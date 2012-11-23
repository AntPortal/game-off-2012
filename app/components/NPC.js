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
		_dialogIconEntity: null,
		init: function() {
			this.requires('Character');
		},
		NPC: function(heightMap, worldToPixel, pathFinder, initialX, initialY, properties, gameState) {
			this.Character(heightMap, worldToPixel, pathFinder, initialX, initialY, properties);
			utils.assert(properties.name, 'NPCs must have a name.');
			var PIXEL_PER_CHAR = 20;
			var estimatedLabelWidth = properties.name.length * PIXEL_PER_CHAR / 2.5; //2.5 was determined empirically
			var labelX = this.x + ((this.w - estimatedLabelWidth)/ 2)
			this._dialogIconEntity = Crafty.e('2D, Canvas, dialogMore').attr({
				x: this.x - 8, //determined empirically
				y: this.y - 12, //determined empirically
				z: config.zOffset.gitk - 1,
				visible: false, //invisible by default, made visible in _interactionsUpdated
			});
			Crafty.e('Canvas, BetterText').attr({
				text: properties.name,
				fontSize: PIXEL_PER_CHAR+'px',
				fontFamily: 'Patrick Hand',
				fillStyle: 'white',
				strokeStyle: 'black',
				x: labelX,
				y: this.y + 30, //determined empirically
				z: config.zOffset.gitk - 1,
				w: estimatedLabelWidth,
				h: PIXEL_PER_CHAR,
			});
			gameState.bind('InteractionsUpdated', _.bind(this._interactionsUpdated, this));
			this._interactionsUpdated(gameState);
			return this;
		},
		_interactionsUpdated: function(gameState) {
			var myInteractions = gameState.getInteractionsByNpc(this.properties.name);
			myInteractions = myInteractions || [];
			this._hasReferrableInteraction = myInteractions.some(function(ixnName) { return interactionDictionary[ixnName].referrable; });
			this._dialogIconEntity.visible = this._hasReferrableInteraction;
		}
	});
});