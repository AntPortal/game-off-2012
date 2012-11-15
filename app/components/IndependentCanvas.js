define(
	[
		'Crafty',
		'components/IndependentDOM'
	],
function() {
	/**
	 * Component for when you need to create a canvas that is independnet of Crafty.
	 */
	Crafty.c('IndependentCanvas', {
		init : function() {
			this.requires('IndependentDOM');
		},
		IndependentCanvas : function(baseElemId) {
			return this.IndependentDOM(baseElemId);
		},
		createCanvas : function(x, y, cssZ, w, h) {
			var canvas = this.createElement('canvas', x, y, cssZ, w, h);
			canvas.width = w;
			canvas.height = h;
			return canvas;
		},
	});
	return undefined;
});
