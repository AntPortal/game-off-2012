define([
	'config',
	'Crafty',
	'components/BaseDialog',
	'components/BetterText',
], function(config) {
	var TIP_WIDTH = 115;
	var TIP_HEIGHT = 20;
	var ACTION_VERT_SPACE = Math.round(config.dialogFont.size * 24.0 / 16.0);
	var SUBTEXT_INDENT = 16;
	var ATOI = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	/**
	 * A menu (based on BaseDialog) with a list of clickable actions.
	 */
	Crafty.c('ActionMenu', {
		/**
		 * If present, this text will appear before the choices are presented.
		 */
		preface: undefined,
		/**
		 * Actions is an array of objects. Each object represent an entry in the menu that will be displayed, and has the
		 * following structure:
		 * 
		 * {
		 *   label: "Deliver Newspaper",
		 *   onClick: function() { ... },
		 * }
		 */
		actions: null,
		_prefaceEntity: null,
		/*
		 * This array follows a similar structure to actions:
		 * 
		 * {
		 *   labelEntity: ...,
		 *   onClickEntity: ...,
		 * }
		 */
		_actionEntities: null,
		_tipEntity: null,
		_dimmer: null,
		init: function() {
			this.requires('BaseDialog');
			this.dialogBg = 'actionUi'; //Changes default value.
			this.actions = [];
			this._actionEntities = [];
			this.bind('Change', this._attributeChanged);
			this.bind('Remove', this._removed);
			this.bind('KeyDown', function(keyEvent) {
				var aKeycode = 65;
				var zKeycode = aKeycode + 25;
				var keycode = keyEvent.which || keyEvent.key || keyEvent.keyCode;
				var choice = null;
				if (aKeycode <= keycode && keycode <= zKeycode) {
					choice = keycode - aKeycode; //a -> 0, b -> 1, etc.
				}
				if (choice !== null) {
					var selectedAction = this.actions[choice];
					if (selectedAction) {
						this._createOnClickHandler(selectedAction)();
					}
				}
			});
		},
		_createOnClickHandler: function(action) {
			var me = this;
			return function() {
				me.destroy();
				action.onClick();
			};
		},
		_attributeChanged: function() {
			var i;
			this._removed();
			var iOffset = this.preface ? 1 : 0;
			if (this.preface) {
				this._prefaceEntity = Crafty.e('2D, Canvas, BetterText').attr({
					text: this.preface,
					fontSize: config.dialogFont.size + 'px',
					fontFamily: 'Patrick Hand',
					fillStyle: '#AAAAFF',
					strokeStyle: undefined,
					x: this.x + this.TILE_SIZE * 0.5,
					y: this.y + this.TILE_SIZE * 0.25,
					z: this.z + 1,
					w: this.w,
					h: config.dialogFont.size
				});
			}

			for (i = 0; i < this.actions.length; i++) {
				var action = this.actions[i];
				var entities = {};
				entities['labelEntity'] = Crafty.e('2D, Canvas, BetterText').attr({
					text: '('+ATOI[i] + ') ' +action.label,
					fontSize: config.dialogFont.size + 'px',
					fontFamily: 'Patrick Hand',
					fillStyle: 'white',
					strokeStyle: undefined,
					x: this.x + this.TILE_SIZE * 0.5,
					y: this.y + this.TILE_SIZE * 0.25 + ACTION_VERT_SPACE * (i + iOffset),
					z: this.z + 1,
					w: this.w,
					h: config.dialogFont.size
				});
				entities['onClickEntity'] = Crafty.e('2D, Mouse').
					attr({
						x: this.x + this.TILE_SIZE * 0.5,
						y: this.y + this.TILE_SIZE * 0.25 + ACTION_VERT_SPACE * (i + iOffset),
						z: this.z + 1,
						w: this.w,
						h: config.dialogFont.size
					}).
					bind('Click', this._createOnClickHandler(action));
				this._actionEntities.push(entities);
			}

			this._tipEntity = Crafty.e('2D, Canvas, BetterText').attr({
				text: "Click or tap an option to select it",
				fontSize: (config.dialogFont.size*0.5) + 'px',
				fontFamily: 'Patrick Hand',
				fillStyle: 'white',
				strokeStyle: undefined,
				x: this.x + this.w - TIP_WIDTH - 41, // empirical value
				y: this.y + this.h - TIP_HEIGHT - 9, // empirical value
				z: this.z + 1,
				w: TIP_WIDTH,
				h: TIP_HEIGHT
			})
		},
		/**
		 * Destroys any Crafty entities that are internally managed by this component.
		 */
		_removed: function() {
			var i;
			for (i = 0; i < this._actionEntities.length; i++) {
				var entities = this._actionEntities[i];
				entities.labelEntity.destroy();
				entities.onClickEntity.destroy();
			}
			this._actionEntities = [];
			if (this._prefaceEntity) {
				this._prefaceEntity.destroy();
				this._prefaceEntity = null;
			}
			if (this._tipEntity) {
				this._tipEntity.destroy();
				this._tipEntity = null;
			}
		},
	});
	return undefined;
});
