define(
	[ 'Crafty'],
function() {
	/**
	 * Allows the creation of DOM elements that are independent of Crafty and that do
	 * not participate in Crafty's draw management, viewport translation, and so on.
	 */
	Crafty.c('IndependentDOM', {
		_refElem : null, // the HTML DOM element that be the parent of any new elements.
		init : function() {
			//Does nothing
		},
		IndependentDOM : function(baseElemId) {
			this._refElem = document.getElementById(baseElemId);
			return this;
		},
		createElement : function(name, x, y, cssZ, w, h) {
			var me = this;
			var elem = document.createElement(name);
			elem.style.position = 'absolute';
			elem.style.top = y + 'px';
			elem.style.left = x + 'px';
			elem.style.width = w + 'px';
			elem.style.height = h + 'px';
			elem.style.zIndex = cssZ;
			this._refElem.appendChild(elem);
			this.bind('Remove', function() { //Auto remove element when this entity is removed.
				me._refElem.removeChild(elem);
			});
			return elem;
		},
	});
	return undefined;
});
