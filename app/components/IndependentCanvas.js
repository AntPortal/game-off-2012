define(
	[ 'Crafty'],
function() {
	/**
	 * Component for when you need to create a canvas that is independnet of Crafty.
	 */
	Crafty.c('IndependentCanvas', {
		_refElem : null, // the HTML DOM element that will contain any created canvases.
		init : function() {
			//Does nothing
		},
		IndependentCanvas : function(baseElemId) {
			this._refElem = document.getElementById(baseElemId);
		},
		createCanvas : function(x, y, cssZ, w, h) {
			var me = this;
			var canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			canvas.style.position = 'absolute';
			canvas.style.top = y + 'px';
			canvas.style.left = x + 'px';
			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';
			canvas.style.zIndex = cssZ;
			this._refElem.appendChild(canvas);
			this.bind('Remove', function() { //Auto remove canvas when this entity is removed.
				me._refElem.removeChild(canvas);
			});
			return canvas;
		},
	});
	return undefined;
});
