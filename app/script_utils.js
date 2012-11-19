/* Utility methods for building scripts for the ScriptRunner component.
 * TODO: document.
 */
define([
	'utils',
	'underscore',
	'Crafty'
], function(utils) {
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

	ScriptUtils.prototype.getGameState = function() {
		return this._gameState;
	};

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
				action: 'jump',
				offset: jump
			});
		});

		return script;
	}

	/**
	 * Returns a script fragment that displays a dialog telling the player to visit
	 * another NPC.
	 *
	 * @param  prefMsg  message to display if an NPC with the preferred interation is found.
	 * @param  nonPrefMsg  message to display if the only interactions available are non-preferred ones.
	 @ @param  noRefMsg message to display if no NPC with a referrable interaction is found.
	 * @param  prefInteraction  name of the interaction to refer to if any NPC has it.
	 */
	ScriptUtils.prototype.makeReferral = function(prefMsg, nonPrefMsg, noRefMsg, prefInteraction) {
		var self = this;
		utils.assert(self._localState, 'localState in ScriptUtils should be defined');

		return [{
			action: 'arbitraryCode',
			code: function(curState, callback) {
				var maybeInteractionInfo = self._gameState.findReferrableInteraction(self._localState.npc.properties.name, prefInteraction);

				var vm = Crafty.e('ScriptRunner');
				var script;
				if (maybeInteractionInfo !== null) {
					var npc = self._npcDictionary[maybeInteractionInfo.npcName];
					utils.assert(npc, 'Entity for ' + maybeInteractionInfo.npcName + ' not found');
					var env = _.extend({}, self._localState, makeNpcVariables(npc, "Ref"));
					script = self._dialogAndPauseWithEnv(
						maybeInteractionInfo.interactionName === prefInteraction ? prefMsg : nonPrefMsg,
						env
					);
				} else {
					script = self._dialogAndPauseWithEnv(noRefMsg, self._localState);
				}
				script.push({
					action: 'arbitraryCode',
					code: function() {
						vm.destroy();
						callback(curState+1);
					}
				});
				vm.ScriptRunner(script).run();
			}
		}];
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
					self._gameState.removeInteraction(npcName, self._localState.interaction);
					callback(curState + 1);
				}
		}];
	}

	return ScriptUtils;
});
