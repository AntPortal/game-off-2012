/**
 * Module implementing 'manual' mouselook in Crafty. This differs from the
 * built-in mouselook feature in that it doesn't ignore drags that start
 * on entities.
 */
define([ 'Crafty' ], function() {
	var mouselook = {
		/**
		 * Enable mouselook. Must be called from within a scene definition.
		 * (TODO: is that always the case?)
		 */
		start: function() {
			Crafty.addEvent(this, Crafty.stage.elem, "mousedown", this._mousedown);
		},
		stop: function() {
			Crafty.removeEvent(this, Crafty.stage.elem, "mousedown", this._mousedown);
		},
		_mousedown: function(e) {
			if(e.button > 1) return;
			var scrollStart = {x: e.clientX, y: e.clientY};
			var base = {x: e.clientX, y: e.clientY};

			function scroll(e) {
				var dx = base.x - e.clientX,
				dy = base.y - e.clientY;
				base = {x: e.clientX, y: e.clientY};
				Crafty.viewport.x -= dx;
				Crafty.viewport.y -= dy;
			};

			Crafty.addEvent(this, Crafty.stage.elem, "mousemove", scroll);
			Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function(e) {
				Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", scroll);
			});
		}
	};
	return mouselook;
});
