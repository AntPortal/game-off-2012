define([ 'Crafty' ], function() {
	Crafty.c('Sepia', {
		_canvas : null,
		_canvasContext : null,
		_x: 0,
		_y: 0,
		_w: 0,
		_h: 0,
		Sepia : function(baseElemId, x, y, cssZ, w, h) {
			var refElem = document.getElementById(baseElemId);
			function makeCanvas(x, y, w, h, zIndex) {
				var canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;
				canvas.style.position = 'absolute';
				canvas.style.top = y + 'px';
				canvas.style.left = x + 'px';
				canvas.style.width = w + 'px';
				canvas.style.height = h + 'px';
				canvas.style.zIndex = zIndex;
				canvas.style.opacity = '.75';
				canvas.style.display = 'none';
				refElem.appendChild(canvas);
				return canvas;
			}
			this._x = x;
			this._y = y;
			this._w = w;
			this._h = h;
			this._canvas = makeCanvas(x, y, w, h, cssZ);
			this._canvasContext = this._canvas.getContext('2d');
			this.draw();
			return this;
		},
		draw : function() {
			var ctx = this._canvasContext;
			ctx.clearRect(this._x, this._y, this._w, this._h);
			ctx.save();
			//hue 30 = brownish
			//hue 240 = blueish
			ctx.fillStyle = 'hsl(240, 100%, 12%)';
			ctx.fillRect(this._x, this._y, this._w, this._h);
			ctx.restore();
			return this;
		},
		setVisible : function(visibility) {
			if (visibility) {
				this._canvas.style.display = 'block';
			} else {
				this._canvas.style.display = 'none';
			}
			return this;
		}
	});
	return undefined;
});