define([
	'Crafty',
	'components/BaseDialog',
	'components/BetterText',
], function() {
	var ACTION_VERT_SPACE = 24;
	var SUBTEXT_INDENT = 16;
	/**
	 * A menu (based on BaseDialog) with a list of clickable actions.
	 */
	Crafty.c('ActionMenu', {
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
			for (i = 0; i < this.actions.length; i++) {
				var action = this.actions[i];
				var entities = {};
				entities['labelEntity'] = Crafty.e('2D, Canvas, BetterText').attr({
					text: action.label,
					fontSize: '16px',
					fontFamily: 'Patrick Hand',
					textColor: '#FFF',
					x: this.x + this.TILE_SIZE * 0.5,
					y: this.y + this.TILE_SIZE * 0.25 + ACTION_VERT_SPACE * i,
					z: this.z + 1,
					w: this.w,
					h: 16
				});
				entities['onClickEntity'] = Crafty.e('2D, Mouse').
					attr({
						x: this.x + this.TILE_SIZE * 0.5,
						y: this.y + this.TILE_SIZE * 0.25 + ACTION_VERT_SPACE * i,
						z: this.z + 1,
						w: this.w,
						h: 16
					}).
					bind('Click', this._createOnClickHandler(action));
				this._actionEntities.push(entities);
			}
		},
		_removed: function() {
			var i;
			for (i = 0; i < this._actionEntities.length; i++) {
				var entities = this._actionEntities[i];
				entities.labelEntity.destroy();
				entities.onClickEntity.destroy();
			}
			this._actionEntities = [];
		},
	});
	return undefined;
});
