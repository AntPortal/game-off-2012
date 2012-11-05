define([
	'config',
	'Crafty',
	'components/BetterText'
], function(config) {
	var TILE_SIZE = 16; // hardcoded size of a dialog tile.
	var SHOW_MORE_SIZE = 16; // hardcoded size of the "show more" icon.
	Crafty.c('Dialog', {
		init : function() {
			this.requires('2D');
			this.attr({
				x: 0,
				y: 0,
				z: config.zOffset.dialog,
				w: TILE_SIZE * 2,
				h: TILE_SIZE * 2,
				msg: [''],
				msgColor: '#FFFFFF',
			});
			this.d = [1,2,3,4,5,6,7,8,9];
			this.d[7] = Crafty.e('2D, Canvas, dialog7');
			this.d[8] = Crafty.e('2D, Canvas, dialog8');
			this.d[9] = Crafty.e('2D, Canvas, dialog9');
			this.d[4] = Crafty.e('2D, Canvas, dialog4');
			this.d[5] = Crafty.e('2D, Canvas, dialog5');
			this.d[6] = Crafty.e('2D, Canvas, dialog6');
			this.d[1] = Crafty.e('2D, Canvas, dialog1');
			this.d[2] = Crafty.e('2D, Canvas, dialog2');
			this.d[3] = Crafty.e('2D, Canvas, dialog3');
			this._msgEntity = [];
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
			this.d[7].attr({
				x : this.x,
				y : this.y,
				z : this.z,
				visible: this.visible,
			});
			this.d[8].attr({
				x : this.x + TILE_SIZE,
				y : this.y,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d[9].attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y,
				z : this.z,
				visible: this.visible,
			});
			this.d[4].attr({
				x : this.x,
				y : this.y + TILE_SIZE,
				z : this.z,
				h : this.h - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d[5].attr({
				x : this.x + TILE_SIZE,
				y : this.y + TILE_SIZE,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				h : this.h - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d[6].attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y + TILE_SIZE,
				z : this.z,
				h : this.h - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d[1].attr({
				x : this.x,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				visible: this.visible,
			});
			this.d[2].attr({
				x : this.x + TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d[3].attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				visible: this.visible,
			});
			if (this.showMore) {
				if (!this._showMoreEntity) {
					this._showMoreEntity = Crafty.e('2D, Canvas, dialogMore');
				}
				this._showMoreEntity.attr({
					x: this.x + this.w - (TILE_SIZE * 1.5),
					y: this.y + this.h - (TILE_SIZE * 1.5),
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
					x: this.x + TILE_SIZE * 2/3,
					y: this.y + TILE_SIZE * 2/3,
					z: this.z,
					visible: this.visible
				});
			}
			//Destroy the old message entities
			for (i = 0; i < this._msgEntity.length; i++) {
				this._msgEntity[i].destroy();
			}
			this._msgEntity = [];
			//Create new set of message entities
			for (i = 0; i < this.msg.length; i++) {
				var msgEntity = Crafty.e('2D, Canvas, BetterText');
				var baseline = this.y + (i + 1) * (TILE_SIZE * 1.5);
				msgEntity.attr({
					text: this.msg[i],
					textColor: this.msgColor,
					fontFamily: 'Patrick Hand',
					fontSize: '16px',
					x : this.x + TILE_SIZE + (this.face ? this._faceEntity.w + 2 : 0),
					y : baseline,
					z : this.z,
					w : this.w - (TILE_SIZE * 2),
					h : 16,
					baseline: baseline,
					visible: this.visible,
				});
				this._msgEntity.push(msgEntity);
				msgEntity.trigger('Change');
			}
		},
		_removed: function() {
			var i;
			for (i = 1; i <= 9; i++) {
				this.d[i].destroy();
			}
			if (this._showMoreEntity) {
				this._showMoreEntity.destroy();
			}
			if (this._faceEntity) {
				this._faceEntity.destroy();
			}
			for (i = 0; i < this._msgEntity.length; i++) {
				this._msgEntity[i].destroy();
			}
		}
	});

	return undefined;
});