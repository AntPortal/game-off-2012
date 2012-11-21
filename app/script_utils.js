/* Utility methods for building scripts for the ScriptRunner component.
 * TODO: document.
 */
define([
	'utils',
	'underscore',
	'Crafty'
], function(utils) {
	/**
	 * Creates and returns the interpolation variables for an NPC's name, pronoun,
	 * etc.
	 */
	function makeNpcVariables(npcEnt, suffix) {
		utils.assert(npcEnt);
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
	 * Constructor.
	 *
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
		utils.assert(localState, 'Must pass in a localState');
		utils.assert(localState.npc, 'Must pass in an NPC in localState');
		utils.assert(localState.interaction, 'Must pass in an interaction in localState');
		utils.assert(localState.x, 'Must pass in an x coordinate in localState');
		utils.assert(localState.y, 'Must pass in a y coordinate in localState');
		utils.assert(localState.heroName, 'Must pass in a heroName in localState');
		this._interactionDictionary = interactionDictionary;
		this._npcDictionary = npcDictionary;
		this._gameState = gameState;
		this._localState = _.extend(makeNpcVariables(localState.npc), localState);
	}

	ScriptUtils.prototype.getGameState = function() {
		return this._gameState;
	};

	ScriptUtils.prototype._dialogAndPauseWithEnv = function(msg, env) {
		var interpolated = utils.interpolate(msg, env);
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

	ScriptUtils.prototype.dialogAndPause = function(msgs) {
		var self = this;
		return _.flatten(_.map(msgs, function(msg) {
			return self._dialogAndPauseWithEnv(msg, self._localState);
		}));
	}

	ScriptUtils.prototype.actionBranch = function(actions) {
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
					actionCallback = function(jump) { callback(curState+jump); };
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
	 * @param rightAnswer  an object with the following keys:
	 *                     - text: the text of the right answer.
	 *                     - result: a script fragment to run when the right answer is chosen.
	 * @param wrongAnswer  an object with the following keys:
	 *                     - texts: an array containing the text of all the possible wrong answers.
	 *                     - result: a script fragment to run when any wrong answer is chosen.
	 *                     - take: the number of wrong answers to present.
	 * @param jokeAnswers  an object with the following keys:
	 *                     - choices: an array of objects, each with the same form as the `rightAnswer` field.
	 *                     - take: the number of joke answers to present.
	 */
	ScriptUtils.prototype.quizBranch = function(
		rightAnswer,
		wrongAnswers,
		jokeAnswers
	) {
		var wrongLabel = utils.newUUID();
		var endLabel = utils.newUUID();

		var actionBranches = [
			{
				label: rightAnswer.text,
				result: rightAnswer.result.concat([{ 'action': 'jumpToLabel', 'label': endLabel }])
			}
		];
		_.chain(wrongAnswers.texts).shuffle().first(wrongAnswers.take).each(function(wrongAns) {
			actionBranches.push({
				label: wrongAns,
				result: [{ 'action': 'jumpToLabel', 'label': wrongLabel }]
			});
		});
		_.chain(jokeAnswers.choices).shuffle().first(jokeAnswers.take).each(function(jokeChoice, i) {
			actionBranches.push({
				label: jokeChoice.text,
				result: jokeChoice.result.concat([{ 'action': 'jumpToLabel', 'label': endLabel }])
			});
		});
		actionBranches = _.shuffle(actionBranches);

		return _.flatten([
			this.actionBranch(actionBranches),
			[{ 'action': 'label', 'label': wrongLabel }],
			wrongAnswers.result,
			[{ 'action': 'label', 'label': endLabel }]
		]);
	}

	/**
	 * Returns a script fragment that awards the player the given number of copper.
	 */
	ScriptUtils.prototype.giveCopper = function(numCopper) {
		var self = this;
		return [{
			action: 'arbitraryCode',
			code: function(curState, callback) {
				self._gameState.giveCopper(numCopper);
				callback(curState+1);
			}
		}];
	}

	/**
	 * Returns a script fragment that searches the game state for another NPC
	 * with the current interaction, removes the interaction from that NPC's
	 * interaction list, and presents a dialog containing either msgIfFound or
	 * msgIfNotFound, depending on if the interaction was found or not.
	 */
	ScriptUtils.prototype.tryRemoveInteraction = function(msgIfFound, msgIfNotFound) {
		var self = this;
		var curNpcName = self._localState.npc.properties.name;
		var curInteraction = self._localState.interaction;
		return [{
			action: 'arbitraryCode',
			code: function(curState, callback) {
				var maybeInteraction = self._gameState.findReferrableInteraction(curNpcName, curInteraction);
				var vm = Crafty.e('ScriptRunner');

				var script = [];
				if (maybeInteraction && maybeInteraction.interactionName === curInteraction) {
					var npc = self._npcDictionary[maybeInteraction.npcName];
					var env = _.extend({}, self._localState, makeNpcVariables(npc, "Ref"));
					script = script.concat(self._dialogAndPauseWithEnv(msgIfFound, env));
					script.push({
						action: 'arbitraryCode',
						code: function(nestState, nestCallback) {
							self._gameState.removeInteraction(maybeInteraction.npcName, maybeInteraction.interactionName);
							nestCallback(nestState+1);
						}
					});
				} else {
					script.push(self._dialogAndPauseWithEnv(msgIfNotFound, self._localState));
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
		}]
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

	ScriptUtils.prototype.addInteraction = function(npcNames, interaction) {
		var self = this;
		return [{
			action: 'arbitraryCode',
			code: function(curState, callback) {
				self._gameState.addInteraction(npcNames, interaction);
				callback(curState + 1);
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
