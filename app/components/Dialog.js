define([ 'Crafty' ], function() {
	var TILE_SIZE = 16; // hardcoded size of a dialog tile.
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
				params.z = 100;
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
			this.d7 = Crafty.e('2D, Canvas, dialog7').attr({
				x : this.x,
				y : this.y,
				z : this.z
			});
			this.d8 = Crafty.e('2D, Canvas, dialog8').attr({
				x : this.x + TILE_SIZE,
				y : this.y,
				z : this.z,
				w : this.w - (TILE_SIZE * 2)
			});
			this.d9 = Crafty.e('2D, Canvas, dialog9').attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y,
				z : this.z,
			});
			this.d4 = Crafty.e('2D, Canvas, dialog4').attr({
				x : this.x,
				y : this.y + TILE_SIZE,
				z : this.z,
				h : this.h - (TILE_SIZE * 2)
			});
			this.d5 = Crafty.e('2D, Canvas, dialog5').attr({
				x : this.x + TILE_SIZE,
				y : this.y + TILE_SIZE,
				z : this.z,
				w : this.w - (TILE_SIZE * 2),
				h : this.h - (TILE_SIZE * 2)
			});
			this.d6 = Crafty.e('2D, Canvas, dialog6').attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y + TILE_SIZE,
				z : this.z,
				h : this.h - (TILE_SIZE * 2)
			});
			this.d1 = Crafty.e('2D, Canvas, dialog1').attr({
				x : this.x,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
			});
			this.d2 = Crafty.e('2D, Canvas, dialog2').attr({
				x : this.x + TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
				w : this.w - (TILE_SIZE * 2)
			});
			this.d3 = Crafty.e('2D, Canvas, dialog3').attr({
				x : this.x + this.w - TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				z : this.z,
			});
			this.msg = Crafty.e('2D, Canvas, Text').attr({
				x : this.x + TILE_SIZE,
				y : this.y + (TILE_SIZE * 1.5),
				z : this.z,
			}).text(params.msg).textColor(params.color, 1).textFont({
				family: 'Patrick Hand',
				size: '16px',
			});
			this.attach(this.d1, this.d2, this.d3, this.d4, this.d5, this.d6,
					this.d7, this.d8, this.d9);
			return this;
		}
	});

	return undefined;
});