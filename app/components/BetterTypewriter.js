define([
	'config',
	'Crafty',
	'components/BetterText',
], function(config) {
	Crafty.c('BetterTypewriter', {
		/*
		 * An array of BetterText entities, one per paragraph.
		 */
		_textEntities: null,
		/*
		 * An array of strings, one per paragraph.
		 */
		_texts: null,
		/*
		 * Index of the current paragraph being rendered.
		 */
		_paraIdx: 0,
		/*
		 * Index of the current character being rendered, relative to the current paragraph.
		 */
		_position: 0,
		/**
		 * Constructor.
		 * @param {array of strings} text The text to typewrite, with one string per paragraph.
		 * @param {int} x the x coordinate (i.e. left edge) of all text elements.
		 * @param {array of int} y the y coordinate (i.e. top edge) for each paragraph.
		 * @param {int} width the width of all paragraphs.
		 * @param {function} doneCallback A zero-arg function which is called when the typewriting animation is done.
		 */
		BetterTypewriter: function(texts, x, ys, width, doneCallback) {
			this.requires('2D');
			this.requires('Mouse');
			this._entityTexts = texts;
			this._entityX = x;
			this._entityYs = ys;
			this._entityWidth = width;
			this._doneCallback = doneCallback;
			this.attr({
				x: 0,
				y: 0,
				w: config.viewport.width,
				h: config.viewport.height,
			});
			return this;
		},
		start: function() {
			this._position = 0;
			this._paraIdx = 0;
			this._textEntities = []; //TODO check if there already is some text entities, and if so, delete the old ones.
			for (var i = 0; i < this._entityTexts.length; i++) {
				this._textEntities.push(Crafty.e('2D, DOM, BetterText').attr({
				x: this._entityX,
				y: this._entityYs[i],
				w: this._entityWidth,
				fontFamily: config.dialogFont.family,
				fontSize: config.dialogFont.size + 'px',
				}));
			}
			this.bind('EnterFrame', this._update);
			this.bind('Click', this._skipToNextPara);
			return this;
		},
		_skipToNextPara: function() {
			this._paraIdx++;
			this._position = 0;
		},
		_update: function() {
			for (var i = 0; i < this._paraIdx; i++) {
				this._textEntities[i].attr('text', this._entityTexts[i]);
			}
			if (this._paraIdx >= this._entityTexts.length) {
				//We are done.
				this.unbind('EnterFrame', this._update);
				this.unbind('Click', this._skipToNextPara);
				if (this._doneCallback && ((typeof this._doneCallback) === 'function')) {
					this._doneCallback();
				}
				return;
			}
			var curPara = this._entityTexts[this._paraIdx];
			if (this._position > curPara.length) {
				//We are done with this paragraph, move onto the next paragraph.
				this._paraIdx++;
				this._position = 0;
				return;
			}
			//We are not done with the current paragraph.
			this._textEntities[this._paraIdx].attr('text', curPara.substring(0, this._position));
			this._position++;
		}
	});
	return undefined;
});