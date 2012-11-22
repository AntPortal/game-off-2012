define([
	'Crafty',
	'components/BaseDialog',
	'components/BetterText',
], function() {
	var ACTION_VERT_SPACE = 24;
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
		_dimmer: null,
		init: function() {
			this.requires('BaseDialog');
			this.dialogBg = 'actionUi'; //Changes default value.
			this.actions = [];
			this._actionEntities = [];
			this.bind('Change', this._attributeChanged);
			this.bind('Remove', this._removed);
		},
		_createOnClickHandler: function(action) {
			var me = this;
			return function(e) {
				me.destroy();
				action.onClick(e);
			};
		},
		_attributeChanged: function() {
			var i;
			this._removed();
			var iOffset = this.preface ? 1 : 0;
			if (this.preface) {
				this._prefaceEntity = Crafty.e('2D, Canvas, BetterText').attr({
					text: this.preface,
					fontSize: '16px',
					fontFamily: 'Patrick Hand',
					fillStyle: '#AAAAFF',
					strokeStyle: undefined,
					x: this.x + this.TILE_SIZE * 0.5,
					y: this.y + this.TILE_SIZE * 0.25,
					z: this.z + 1,
					w: this.w,
					h: 16
				});
			}

			for (i = 0; i < this.actions.length; i++) {
				var action = this.actions[i];
				var entities = {};
				entities['labelEntity'] = Crafty.e('2D, Canvas, BetterText').attr({
					text: ATOI[i] + '. ' +action.label,
					fontSize: '16px',
					fontFamily: 'Patrick Hand',
					fillStyle: 'white',
					strokeStyle: undefined,
					x: this.x + this.TILE_SIZE * 0.5,
					y: this.y + this.TILE_SIZE * 0.25 + ACTION_VERT_SPACE * (i + iOffset),
					z: this.z + 1,
					w: this.w,
					h: 16
				});
				entities['onClickEntity'] = Crafty.e('2D, Mouse').
					attr({
						x: this.x + this.TILE_SIZE * 0.5,
						y: this.y + this.TILE_SIZE * 0.25 + ACTION_VERT_SPACE * (i + iOffset),
						z: this.z + 1,
						w: this.w,
						h: 16
					}).
					bind('Click', this._createOnClickHandler(action));
				this._actionEntities.push(entities);
			}
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
		},
	});
	return undefined;
});
