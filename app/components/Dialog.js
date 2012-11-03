define([ 'config', 'Crafty' ], function(config) {
	var TILE_SIZE = 16; // hardcoded size of a dialog tile.
	var SHOW_MORE_SIZE = 16; // hardcoded size of the "show more" icon.
	Crafty.c('Dialog', {
		init : function() {
			this.requires('2D');
		},
		Dialog : function(params) {
			var i;
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
				params.msg = [''];
			}
			if (typeof(params.msg) == 'string') {
				var temp = params.msg;
				params.msg = [];
				params.msg[0] = temp;
			}
			if (!params.color) {
				params.color = '#FFFFFF';
			}
			this.x = params.x;
			this.y = params.y;
			this.z = params.z;
			this.w = params.w;
			this.h = params.h;
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
			this.msg = [];
			for (i = 0; i < params.msg.length; i++) {
				this.msg[i] = Crafty.e('2D, Canvas, Text').
				text(params.msg[i]).
				textColor(params.color, 1).
				textFont({
					family: 'Patrick Hand',
					size: '16px',
				});
			}
			if (params.showMore) {
				this.showMore = Crafty.e('2D, Canvas, dialogMore');
				this.bind('EnterFrame', this._animateShowMore);
			}
			if (params.face) {
				this.face = Crafty.e('2D, Canvas');
				this.face.addComponent(params.face);
				if (params.faceWidth) {
					this.face.attr("w", params.faceWidth);
				}
				if (params.faceHeight) {
					this.face.attr("h", params.faceWidth);
				}
			}
			this._attributeChanged();
			this.bind('Change', this._attributeChanged);
			this.bind('Remove', this._removed);
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
			for (i = 0; i < this.msg.length; i++) {
				this.msg[i].attr({
					x : this.x + TILE_SIZE + (this.face ? this.face.w + 2 : 0),
					y : this.y + (i + 1) * (TILE_SIZE * 1.5),
					z : this.z,
					visible: this.visible,
				});
			}
		},
		_removed: function() {
			var i;
			for (i = 1; i <= 9; i++) {
				this.d[i].destroy();
			}
			if (this.showMore) {
				this.showMore.destroy();
			}
			if (this.face) {
				this.face.destroy();
			}
			for (i = 0; i < this.msg.length; i++) {
				this.msg[i].destroy();
			}
		}
	});

	return undefined;
});