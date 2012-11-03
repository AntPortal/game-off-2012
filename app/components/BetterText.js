define([ 'Crafty', ], function() {
	/**
	 * @ A better implementation of the Text component.
	 */
	Crafty.c("BetterText", {
		text : "", // A string, or a function which returns a string. In the case of DOM, can contain HTML.
		_textStr : "", // String form of text
		fontStyle : "", // E.g. 'italics'
		fontWeight : "", // E.g. 'bold'
		fontSize : "", // E.g. '24pt'
		fontFamily : "", // E.g. 'Helvetica'
		textColor : 'black',
		baseline: null, // The y coordinate of the baseline for the text. If null, it's set to this.y + this.h
		ready : true,

		init : function() {
			this.requires("2D");
			this.bind("Draw", this._draw);
			this.bind('Change', this._attributeChanged);
		},
		_attributeChanged : function() {
			if (typeof (this.text) == "function") {
				this._textStr = this.text.call(this);
			} else {
				this._textStr = this.text.toString();
			}
		},
		_draw : function(e) {
			var font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize
					+ ' ' + this.fontFamily;
			if (e.type === "DOM") {
				var el = this._element;
				var style = el.style;
				style.color = this.textColor;
				style.font = font;
				el.innerHTML = this._textStr;
			} else if (e.type === "canvas") {
				var context = e.ctx;
				context.save();
				context.fillStyle = this.textColor;
				context.font = font;
				context.translate(this.x, this.baseline == null ? this.y + this.h : this.baseline);
				context.fillText(this._textStr, 0, 0);
				// var metrics = context.measureText(this._text);
				// this._w = metrics.width;
				context.restore();
			}
		}
	});
});