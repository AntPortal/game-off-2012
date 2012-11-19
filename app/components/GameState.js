define([
	'config',
	'utils',
	'Crafty',
	'underscore',
], function(config, utils) {
	Crafty.c('GameState', {
		_gameState: null,
		_interactionDictionary: null,
		init: function() {
			this._gameState = config.getCurProgress();
		},
		GameState: function(interactionDictionary) {
			this._interactionDictionary = interactionDictionary;
			return this;
		},
		/** Returns true if no NPCs have any interactions available,
		 *  and no interactions have ever been completed; returns false
		 *  otherwise. */
		isEmpty: function() {
			return _.isEmpty(this._gameState);
		},
		addInteraction: function(npcNames, interaction) {
			var self = this;
			_.each(npcNames, function(name) {
				self._gameState[name] = self._gameState[name] || [];
				self._gameState[name].push(interaction);
				/* TODO: avoid duplicates? */
			});
		},
		removeInteraction: function(npcName, interaction) {
			utils.assert(this._gameState[npcName], 'removeInteraction was passed an npcName with no gameState entry');
			this._gameState[npcName] = _.without(this._gameState[npcName], interaction);
		},
		/** Returns the name of an interaction that the given NPC has available, or undefined if the NPC
		 *  doesn't have any interactions. */
		getOneInteraction: function(npcName) {
			return (this._gameState[npcName] || [])[0];
		},
		/** Returns an array containing the names of NPCs who have the given interaction available. */
		findInteraction: function(interaction) {
			var names = [];
			_.each(this._gameState, function(npcIxns, name) {
				if (_.contains(npcIxns, interaction)) {
					names.push(name);
				}
			});
			return names;
		},
		/**
		 * Looks for a referrable interaction.
		 *
		 * @param excludeNpc  an NPC to exclude from the search; usually the NPC the player is currently speaking to.
		 * @param prefInteraction  an interaction to prefer over others.
		 * @return  an object with an `npcName` field containing the name of the NPC who has the found interaction,
		 *          and an `interactionName` field containing the name of the found interaction. Returns null if
		 *          no referrable interaction could be found.
		 */
		findReferrableInteraction: function(excludeNpc, prefInteraction) {
			var self = this;
			return _.reduce(self._gameState, function(foundInteraction, interactions, npcName) {
				utils.assert(foundInteraction === null || typeof(foundInteraction) === 'object', 'Type of ' + foundInteraction + ' should be object or null');

				if (npcName === excludeNpc) {
					return foundInteraction;
				}

				var referrableInteractions = _.filter(interactions, function(q) { return self._interactionDictionary[q].referrable; });
				var hasPrefInteraction = _.contains(referrableInteractions, prefInteraction);
				if (hasPrefInteraction) {
					return {npcName: npcName, interactionName: prefInteraction};
				} else if (referrableInteractions.length === 0) {
					return foundInteraction;
				} else {
					if (foundInteraction === null) {
						return {npcName: npcName, interactionName: _.first(referrableInteractions)};
					} else {
						return foundInteraction;
					}
				}
			}, null);
		},
		_save: function() {
			config.setCurProgress(this._gameState);
		}
	});
});