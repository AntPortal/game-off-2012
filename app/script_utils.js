/* Utility methods for building scripts for the ScriptRunner component.
 * TODO: document.
 */
define([
	'underscore'
], function() {
	function interpolate(msg, env) {
		return msg.replace(/@(\w+)@/g, function(_, name) { return env[name]; });
	}
	function makeNpcVariables(npcEnt, suffix) {
		var result = {};
		suffix = suffix || '';
		result['npcName' + suffix] = npcEnt.properties.name,
		result['HeOrShe' + suffix] = npcEnt.properties.gender === 'M' ? "He" : "She";
		result['heOrShe' + suffix] = result['HeOrShe' + suffix].toLowerCase();
		result['HimOrHer' + suffix] = npcEnt.properties.gender === 'M' ? "Him" : "Her";
		result['himOrHer' + suffix] = result['HimOrHer' + suffix].toLowerCase();
		return result;
	}

	/**
	 * @param interactionDictionary  the dictionary defining all NPC interactions in the game.
	 * @param npcDictionary  an object whose keys are NPC names and whose values are corresponding
	 *                       Crafty NPC entities.
	 * @param gameState  the current game state, which maps each NPC's name to a list
	 *                   containing the names of the interactions that can happen with them.
	 * @param localState  an object containing several context items for the script. Must
	 *                    have at least the following keys:
	 *                    - npc: the Crafty entity for the NPC that the player is speaking to.
	 *                    - interaction: the name of the interaction that the player is undergoing with the NPC.
	 *                    - face: the asset for the face to display in dialogs, e.g. 'face_childM',
	 *                            or 'undefined' for no face.
	 *                    - x, y: the x/y coordinates at which any dialogs should be displayed.
	 *                    - heroName: the name of the hero.
	 *                    Other fields are allowed, and will be interpolated into dialog messages.
	 *                    Several interpolation variables are automatically available, e.g. @heOrShe@.
	 */
	function ScriptUtils(
		interactionDictionary,
		npcDictionary,
		gameState,
		localState
	) {
		this._interactionDictionary = interactionDictionary;
		this._npcDictionary = npcDictionary;
		this._gameState = gameState;
		this._localState = _.extend(makeNpcVariables(localState.npc), localState);
	}

	ScriptUtils.prototype._dialogAndPauseWithEnv = function(msg, env) {
		var interpolated = interpolate(msg, env);
		return [
			{
				action: 'dialog',
				params: {
					x: this._localState.x,
					y: this._localState.y,
					w: 400,
					h: 70,
					face: undefined, /* TODO */
					msg: interpolated
				},
			},
			{action: 'PACADOC'}
		];
	}

	ScriptUtils.prototype.dialogAndPause = function(msg) {
		return this._dialogAndPauseWithEnv(msg, this._localState);
	}

	ScriptUtils.prototype.actionBranch = function(actions, menuCallback) {
		var self = this;
		var chosenAction = null;
		var actionCallback = null;

		var script = [
			{
				action: 'menu',
				params: {
					x: this._localState.x,
					y: this._localState.y,
					w: 400,
					h: 90,
					actions: actions.map(function(action, index) {
						var jump = 1;
						for (var i = 0; i < index; i++) {
							jump += actions[i].result.length + 1;
						}
						return {
							label: action.label,
							onClick: function() { actionCallback(jump); }
						};
					})
				}
			},
			{
				action: 'arbitraryCode',
				code: function(curState, callback) {
					menuCallback(true);
					actionCallback = function(jump) { menuCallback(false); callback(curState+jump); };
				}
			}
		];

		actions.forEach(function(action, index) {
			script = script.concat(action.result);

			var jump = 1;
			for (var i = index + 1, n = actions.length; i < n; i++) {
				jump += actions[i].result.length + 1;
			}

			script.push({
				action: 'arbitraryCode',
				code: function(curState, callback) { callback(curState + jump); }
			});
		});

		return script;
	}

	/**
	 * Returns a script fragment that displays a dialog telling the player to visit
	 * another NPC.
	 *
	 * @param  refMsg message to display if an NPC with a referrable interaction is
	 *                found, e.g. "You should go talk to @npcName@".
	 @ @param  noRefMsg message to display if no NPC with a referrable interaction is found.
	 */
	ScriptUtils.prototype.makeReferral = function(refMsg, noRefMsg, prefInteraction) {
		var self = this;
		var maybeInteractionInfo = _.reduce(self._gameState, function(foundInteraction, interactions, npcName) {
			var referrableInteractions = _.filter(interactions, function(q) { return self._interactionDictionary[q].referrable; });
			var hasPrefInteraction = _.contains(referrableInteractions, prefInteraction);
			if (hasPrefInteraction) {
				return {npcName: npcName, interactionName: prefInteraction};
			} else if (referrableInteractions.length === 0) {
				return foundInteraction;
			} else {
				if (foundInteraction === null) {
					return _.first(referrableInteractions);
				} else {
					return foundInteraction;
				}
			}
		}, null);

		if (maybeInteractionInfo !== null) {
			var env = _.extend({}, self.localState, makeNpcVariables("Ref"));
			return this._dialogAndPauseWithEnv(refMsg, env);
		} else {
			return this._dialogAndPauseWithEnv(noRefMsg, self.localState);
		}
	}

	/**
	 * Returns a script fragment that removes the current interaction from the current NPC's
	 * list of available interactions.
	 */
	ScriptUtils.prototype.removeCurrentInteraction = function() {
		var self = this;
		return [{
				action: 'arbitraryCode',
				code: function(curState, callback) {
					var npcName = self._localState.npc.properties.name;
					self._gameState[npcName] = _.without(self._gameState[npcName], self._localState.interaction);
					callback(curState + 1);
				}
		}];
	}

	return ScriptUtils;
});
