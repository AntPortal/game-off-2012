define([ 'Crafty' ], function() {
	var maxDragDistanceSqr = 49;
	Crafty.c('ClickNoDrag', {
		init: function() {
			var startPos = null;
			this.requires('Mouse');

			this.bind('MouseDown', function(e) {
				startPos = {x: e.clientX, y: e.clientY};
			});

			this.bind('MouseUp', function(e) {
				if (startPos === null) { return; }

				var endPos = {x: e.clientX, y: e.clientY};
				var dx = endPos.x - endPos.x
				var dy = endPos.y - startPos.y;
				var distSqr = dx*dx + dy*dy;
				if (distSqr < maxDragDistanceSqr) {
					this.trigger('ClickNoDrag', e);
				}
				startPos = null;
			});
		}
	});
});
