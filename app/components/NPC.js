/**
 * Defines an non-playable character.
 */
define([
	'config',
	'utils',
	'path_finder',
	'Crafty',
	'components/Character',
], function(config, utils, PathFinder) {
	Crafty.c('NPC', {
		init: function() {
			this.requires('Character');
		},
		NPC: function(heightMap, worldToPixel, pathFinder, initialX, initialY, properties) {
			this.Character(heightMap, worldToPixel, pathFinder, initialX, initialY, properties);
			utils.assert(properties.name, 'NPCs must have a name.');
			var PIXEL_PER_CHAR = 24;
			var estimatedLabelWidth = properties.name.length * PIXEL_PER_CHAR / 2.5; //2.5 was determined empirically
			var labelX = this.x + ((this.w - estimatedLabelWidth)/ 2)
			Crafty.e('Canvas, BetterText').attr({
				text: properties.name,
				fontSize: PIXEL_PER_CHAR+'px',
				fontFamily: 'Patrick Hand',
				fillStyle: 'white',
				strokeStyle: 'black',
				x: labelX,
				y: this.y - 32,
				z: config.zOffset.gitk - 1,
				w: estimatedLabelWidth,
				h: PIXEL_PER_CHAR,
			});
			return this;
		}
	});
});