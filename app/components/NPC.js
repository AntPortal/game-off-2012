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
			return this;
		}
	});
});