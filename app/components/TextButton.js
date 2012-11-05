define([
	'config',
	'Crafty',
	'components/BetterText',
], function(config) {
	Crafty.c('TextButton', {
		init: function() {
			this.requires('2D, Mouse');
			this._attributeChanged();
			this.bind('Change', this._attributeChanged);
			this.bind('Remove', this._removed);
			return this;
		},
		TextButton: function(label, params) {
			if (!params) {
				params = {};
			}
			if (!params.size) {
				params.size = '45px';
			}
			this._label = Crafty.e('2D, Canvas, BetterText');
			this._label.attr({
				text: label,
				textColor: '#FFFFFF',
				fontFamily: 'Patrick Hand',
				fontSize: params.size,
			});
			return this;
			//TODO Allow user to configure font size, color
		},
		_attributeChanged: function() {
			var label = this._label;
			if (label) {
				label.attr({
					x: this.x + this.w / 2,
					y: this.y + this.h / 2,
					z: this.z,
				});
			}
		},
		_removed: function() {
			if (this._label) {
				this._label.destroy();
			}
		},
	});
});