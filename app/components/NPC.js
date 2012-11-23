/**
 * Defines an non-playable character.
 */
define([
	'config',
	'utils',
	'interaction_dictionary',
	'path_finder',
	'Crafty',
	'components/Character',
	'underscore',
], function(config, utils, interactionDictionary, PathFinder) {
	Crafty.c('NPC', {
		hasReferrableInteraction: false,
		init: function() {
			this.requires('Character');
		},
		NPC: function(worldToPixel, initialX, initialY, initialZ, properties, gameState) {
			this.Character(worldToPixel, initialX, initialY, initialZ, properties);
			utils.assert(properties.name, 'NPCs must have a name.');
			gameState.bind('InteractionsUpdated', _.bind(this._interactionsUpdated, this));
			this._interactionsUpdated(gameState);
			return this;
		},
		_interactionsUpdated: function(gameState) {
			var myInteractions = gameState.getInteractionsByNpc(this.properties.name);
			myInteractions = myInteractions || [];
			this.hasReferrableInteraction = myInteractions.some(function(ixnName) { return interactionDictionary[ixnName].referrable; });
		}
	});
});