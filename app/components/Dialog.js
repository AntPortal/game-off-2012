define([
	'config',
	'Crafty',
	'components/BetterText',
	'components/BaseDialog',
], function(config) {
	var SHOW_MORE_SIZE = 16; // hardcoded size of the "show more" icon.
	/**
	 * Extends BaseDialog by providing support for text, a portrait, and a "show more..." icon.
	 */
	Crafty.c('Dialog', {
		msg: [''], /* TODO: this doesn't need to be an array anymore, since the text entity is DOM-based and has automatic line breaking */
		msgColor: '#FFFFFF',
		init : function() {
			this.requires('2D');
			this.requires('BaseDialog');
			this._msgEntity = null;
			this.bind('EnterFrame', this._animateShowMore);
			this.bind('Change', this._attributeChanged);
			this.bind('Remove', this._removed);
		},
		_animateShowMore: function(params) {
			if (this.visible && this._showMoreEntity) {
				var size = (Math.sin(params.frame / 20) + 1)/ 3;
				this._showMoreEntity.w = SHOW_MORE_SIZE * (1 + size);
				this._showMoreEntity.h = SHOW_MORE_SIZE * (1 + size);
			}
		},
		_attributeChanged: function() {
			if (!this.msg) {
				this.msg = [''];
			} else if (typeof(this.msg) == 'string') {
				var temp = [this.msg];
				this.msg = temp;
			}
			var i;
			if (this.showMore) {
				if (!this._showMoreEntity) {
					this._showMoreEntity = Crafty.e('2D, Canvas, dialogMore');
				}
				this._showMoreEntity.attr({
					x: this.x + this.w - (this.TILE_SIZE * 1.5),
					y: this.y + this.h - (this.TILE_SIZE * 1.5),
					z: this.z,
					visible: this.visible
				});
			} else if (this._showMoreEntity) {
				this._showMoreEntity.destroy();
				this._showMoreEntity = null;
			}
			//Destroy old face entity
			if (this._faceEntity) {
				this._faceEntity.destroy();
				this._faceEntity = null;
			}
			if (this.face) {
				this._faceEntity = Crafty.e('2D, Canvas');
				this._faceEntity.addComponent(this.face);
				if (this.faceWidth) {
					this._faceEntity.attr("w", this.faceWidth);
				}
				if (this.faceHeight) {
					this._faceEntity.attr("h", this.faceWidth);
				}
				this._faceEntity.attr({
					x: this.x + this.TILE_SIZE * 2/3,
					y: this.y + this.TILE_SIZE * 2/3,
					z: this.z,
					visible: this.visible
				});
			}
			//Destroy the old message entity
			if (this._msgEntity) {
				this._msgEntity.destroy();
			}
			//Create new message entity
			this._msgEntity = Crafty.e('2D, DOM, BetterText');
			var paddedFaceWidth = this.face ? this._faceEntity.w + 2 : 0;
			this._msgEntity.attr({
				text: this.msg.join(" "),
				textColor: this.msgColor,
				fontFamily: 'Patrick Hand',
				fontSize: '16px',
				x : this.x + this.TILE_SIZE + paddedFaceWidth,
				y : this.y + (this.TILE_SIZE / 2),
				z : this.z,
				w : this.w - (this.TILE_SIZE * 2) - paddedFaceWidth,
				h : 16,
				baseline: null,
				visible: this.visible,
			});
			this._msgEntity.trigger('Change');
		},
		_removed: function() {
			var i;
			if (this._showMoreEntity) {
				this._showMoreEntity.destroy();
			}
			if (this._faceEntity) {
				this._faceEntity.destroy();
			}
			if (this._msgEntity) {
				this._msgEntity.destroy();
			}
		}
	});

	return undefined;
});
