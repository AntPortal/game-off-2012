define([
	'config',
	'utils',
	'interaction_dictionary',
	'Crafty',
	'underscore',
], function(config, utils, interactionDictionary) {
	var DEBUG_NO_SAVE = false;
	Crafty.c('GameState', {
		_githubName: undefined,
		_shortName: "",
		_slotId: 0,
		_gameState: null,
		_coppers: 0,
		GameState: function(slotId) {
			/*
			 * The save game object has the following structure:
			 * {
			 * 	githubName: "NebuPookins",
			 * 	shortName: "Nebu"
			 * 	progress: {
			 * 		'Apache': ['villagerGitClone', 'villagerGitAdd', ...], // Interactions that this character can perform.
			 *			...
			 * 	},
			 * 	coppers: 2
			 * }
			 * 
			 * githubName is the github account name (alphanumeric and dash, less than 40 char, can't start with dash)
			 * shortname is a shortened version of the github name.
			 * 
			 * Easiest way to detect that a save slot is empty is to read the progress field, and if it's "undefined", it means
			 * the slot is empty.
			 */
			this._slotId = slotId;
			this._load();
			return this;
		},
		getGithubName: function() {
			return this._githubName;
		},
		setGithubName: function(name) {
			this._githubName = name;
			this._save();
			return this;
		},
		getShortName: function() {
			return this._shortName;
		},
		setShortName: function(shortName) {
			this._shortName = shortName;
			this._save();
			return this;
		},
		getCopper: function() {
			return this._coppers;
		},
		giveCopper: function(num) {
			this._coppers += num;
			this._save();
		},
		/** Returns true if this GameState represents a blank save slot. */
		isEmpty: function() {
			return this._githubName === undefined;
		},
		/** Returns true if no NPCs have any interactions available,
		 *  and no interactions have ever been completed; returns false
		 *  otherwise. */
		hasNoInteractions: function() {
			return _.isEmpty(this._gameState);
		},
		clear: function() {
			this._githubName = undefined;
			this._shortName = "";
			this._gameState = {};
			this._coppers = 0;
			this._save();
			this.trigger('InteractionsUpdated', this);
		},
		addInteraction: function(npcNames, interaction) {
			var self = this;
			utils.assert(Array.isArray(npcNames), 'npcNames must be an array');
			_.each(npcNames, function(name) {
				self._gameState[name] = self._gameState[name] || [];
				self._gameState[name].push(interaction);
				/* TODO: avoid duplicates? */
			});
			this.trigger('InteractionsUpdated', this);
			this._save();
		},
		removeInteraction: function(npcName, interaction) {
			utils.assert(this._gameState[npcName], 'removeInteraction was passed an npcName with no gameState entry');
			this._gameState[npcName] = _.without(this._gameState[npcName], interaction);
			this.trigger('InteractionsUpdated', this);
			this._save();
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

				var referrableInteractions = _.filter(interactions, function(q) { return interactionDictionary[q].referrable; });
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
		_load: function() {
			var loadedData = window.localStorage.getItem(this._localStorageKey());
			if (loadedData) {
				var parsedData = JSON.parse(loadedData);
				this._githubName = parsedData.githubName;
				this._shortName = parsedData.shortName;
				this._gameState = parsedData.gameState;
				this._coppers = parsedData.coppers;
			} else {
				this.clear();
			}
			this.trigger('InteractionsUpdated', this);
		},
		_save: function() {
			var toSave = {
				githubName: this._githubName,
				shortName: this._shortName,
				gameState: this._gameState,
				coppers: this._coppers
			};
			if (!DEBUG_NO_SAVE) {
				window.localStorage.setItem(this._localStorageKey(), JSON.stringify(toSave));
			} else {
				console.log("Would save:", toSave);
			}
		},
		_localStorageKey: function() {
			return 'saveGame' + this._slotId;
		},
		/**
		 * Returns a dictionary where the keys are the interaction names and the
		 * values is a count of how many villagers have this interaction open. May
		 * or may not return interactions with a count of zero.
		 */
		getInteractionCounts: function() {
			var retVal = {};
			_.each(this._gameState, function(interactions, villagerName) {
				_.each(interactions, function(interaction) {
					if (this[interaction]) {
						this[interaction]++;
					} else {
						this[interaction] = 1;
					}
				}, this);
			}, retVal);
			return retVal;
		}
	});

	var gameStatesObj = {
		saveGames: [{}, {}, {}],
		curSaveSlot: 0 // must be between 0 and 2 inclusive
	};
	for (var i = 0; i < 3; i++) {
		gameStatesObj.saveGames[i] = Crafty.e('GameState').GameState(i);
	}

	return gameStatesObj;
});