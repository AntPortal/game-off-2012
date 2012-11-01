define([ 'config', 'Crafty' ], function(config) {
	var TILE_SIZE = 16; // hardcoded size of a dialog tile.
	var SHOW_MORE_SIZE = 16; // hardcoded size of the "show more" icon.
	Crafty.c('Dialog', {
		init : function() {
			this.requires('2D');
		},
		Dialog : function(params) {
			if (!params.x) {
				params.x = 0;
			}
			if (!params.y) {
				params.y = 0;
			}
			if (!params.z) {
				params.z = config.zOffset.dialog;
			}
			if (!params.w || params.w < (TILE_SIZE * 2)) {
				params.w = (TILE_SIZE * 2);
			}
			if (!params.h || params.h < (TILE_SIZE * 2)) {
				params.h = (TILE_SIZE * 2);
			}
			if (!params.msg) {
				params.msg = "";
			}
			if (!params.color) {
				params.color = "#FFFFFF";
			}
			this.x = params.x;
			this.y = params.y;
			this.z = params.z;
			this.w = params.w;
			this.h = params.h;
			this.d7 = Crafty.e('2D, Canvas, dialog7');
			this.d8 = Crafty.e('2D, Canvas, dialog8');
			this.d9 = Crafty.e('2D, Canvas, dialog9');
			this.d4 = Crafty.e('2D, Canvas, dialog4');
			this.d5 = Crafty.e('2D, Canvas, dialog5');
			this.d6 = Crafty.e('2D, Canvas, dialog6');
			this.d1 = Crafty.e('2D, Canvas, dialog1');
			this.d2 = Crafty.e('2D, Canvas, dialog2');
			this.d3 = Crafty.e('2D, Canvas, dialog3');
			this.msg = Crafty.e('2D, Canvas, Text').
				text(params.msg).
				textColor(params.color, 1).
				textFont({
					family: 'Patrick Hand',
					size: '16px',
				});
			if (params.showMore) {
				this.showMore = Crafty.e('2D, Canvas, dialogMore');
				this.bind('EnterFrame', this._animateShowMore);
			}
			if (params.face) {
				this.face = Crafty.e('2D, Canvas');
				this.face.addComponent(params.face);
			}
			this._attributeChanged();
			this.bind('Change', this._attributeChanged);
			return this;
		},
		_animateShowMore: function(params) {
			if (this.visible) {
				var size = (Math.sin(params.frame / 20) + 1)/ 3;
				this.showMore.w = SHOW_MORE_SIZE * (1 + size);
				this.showMore.h = SHOW_MORE_SIZE * (1 + size);
			}
		},
		_attributeChanged: function() {
			this.d7.attr({
				x : this.x,
				y : this.y,
				z : this.z,
				visible: this.visible,
			});
			this.d8.attr({
				x : this.x + TILE_SIZE,
				y : this.y,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d9.attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y,
				z : this.z,
				visible: this.visible,
			});
			this.d4.attr({
				x : this.x,
				y : this.y + TILE_SIZE,
				z : this.z,
				h : this.h - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d5.attr({
				x : this.x + TILE_SIZE,
				y : this.y + TILE_SIZE,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				h : this.h - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d6.attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y + TILE_SIZE,
				z : this.z,
				h : this.h - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d1.attr({
				x : this.x,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				visible: this.visible,
			});
			this.d2.attr({
				x : this.x + TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				visible: this.visible,
			});
			this.d3.attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				visible: this.visible,
			});
			if (this.showMore) {
				this.showMore.attr({
					x: this.x + this.w - (TILE_SIZE * 1.5),
					y: this.y + this.h - (TILE_SIZE * 1.5),
					z: this.z,
					visible: this.visible
				});
			}
			if (this.face) {
				this.face.attr({
					x: this.x + TILE_SIZE * 2/3,
					y: this.y + TILE_SIZE * 2/3,
					z: this.z,
					visible: this.visible
				});
			}
			this.msg.attr({
				x : this.x + TILE_SIZE + (this.face ? 48 : 0),
				y : this.y + (TILE_SIZE * 1.5),
				z : this.z,
				visible: this.visible,
			});
		},
	});

	return undefined;
});