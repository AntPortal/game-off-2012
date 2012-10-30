define([ 'Crafty' ], function() {
	Crafty.c("ViewportRelative", {
		_oldViewportX : 0,
		_oldViewportY : 0,
		init : function() {
			this.bind("EnterFrame", this._frame);
		},
		_frame : function() {
			if (this._oldViewportX != Crafty.viewport._x) {
				this.x -= Crafty.viewport._x - this._oldViewportX;
				this._oldViewportX = Crafty.viewport._x;
			}
			if (this._oldViewportY != Crafty.viewport._y) {
				this.y -= Crafty.viewport._y - this._oldViewportY;
				this._oldViewportY = Crafty.viewport._y;
			}
		}
	});
});