define([
	'config',
	'Crafty'
], function(config) {
	var FONT_SIZE = 16;
	var LINE_HEIGHT = 20;
	Crafty.c('HelpText', {
		_canvasContext: null,
		_lines: null,
		HelpText: function(baseElemId, x, y, cssZ, w, h) {
			this.requires('IndependentCanvas');
			this.IndependentCanvas(baseElemId);
			this._canvasContext = this.createCanvas(x, y, cssZ, w, h).getContext('2d');
			this._canvasContext.canvas.id = 'HelpText';
			this._w = w;
			this._h = h;
			this._lines = [];
			return this;
		},
		setLines: function(lines) {
			this._lines = lines;
			this._redraw();
		},
		_redraw: function() {
			var ctx = this._canvasContext;
			ctx.clearRect(0, 0, this._w, this._h);
			ctx.save();
			ctx.font = FONT_SIZE+'px Patrick Hand';
			ctx.fillStyle = 'yellow';
			ctx.textBaseline = 'top';
			this._lines.forEach(function(line, i) {
				ctx.fillText(line, 0, i*LINE_HEIGHT);
			});
			ctx.restore();
		}
	});
});
