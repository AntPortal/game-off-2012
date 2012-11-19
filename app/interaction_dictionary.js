/**
 * A dictionary from interaction names to details about those interactions. Each one is represented
 * as an object with the following fields:
 * - doAction: a function that, when called, carries out the interaction.
 * - taskString: optional; the text to display in the task list for this interaction.
 * - referrable: optional; indicates whether the interaction is referrable or not. If absent, "false" is assumed.
 * - icon: TODO
 */
define([
	'Crafty',
	'components/ScriptRunner',
], function() {
	var COPPER_VALUE = 1;
	var SILVER_VALUE = 4;
	var GOLD_VALUE = 16;
	var PLATINUM_VALUE = 64;
	return {
		defaultInteraction: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause(
						"@npcName@: Hi @heroName@! I've got nothing for you today. Why don't you look around to see if anyone else needs help?"
					),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			}
		},
		defaultLinus: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					/* TODO: implement getting help with git */
					scriptUtils.dialogAndPause(
						"@npcName@: Hi @heroName@! I'd give you some help with git, but that feature hasn't been implemented yet..."
					),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			}
		},
		villagerGitClone: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var thisInteraction = 'villagerGitClone';
				var rightAnswerAction = {
					label: "git clone https://github.com/AntPortal/game-off-2012.git",
					result: _.flatten([
						scriptUtils.removeCurrentInteraction(),
						[{
							action: 'arbitraryCode',
							code: function(curState, callback) {
								var npcsWithClone = gameState.findInteraction(thisInteraction);
								var numClonesLeft = npcsWithClone.length;
								console.log('clones left:', numClonesLeft);
								if (numClonesLeft === 0) {
									gameState.addInteraction(['Linus'], 'linusGitCloneComplete');
								}
								callback(curState+1);
							}
						}],
						scriptUtils.makeReferral(
							"@npcName@: Thanks @heroName@! It worked! Please help other fellow Svenites learn about this new magic! "
								+ "Maybe you could go and help @npcNameRef@? @HeOrSheRef@ doesn't live too far from here...",
							"@npcName@: Thanks @heroName@! It worked! Have you spoken to @npcNameRef@ lately? I think @heOrSheRef@ was looking for you.",
							"Thanks @heroName@! It worked!", /* should never happen */
							thisInteraction
						)
					])
				};
				var jokeAnswerAction = {
					label: "rm -rf ~",
					result: scriptUtils.dialogAndPause(
						"@npcName@: Really? That sounds dangerous... are you sure Linus said to use that? Maybe you should check with him again... "
							+ "I wouldn’t want to set my whole bookshelf on fire!"
					)
				};
				var wrongAnswers = [
					"git init https://github.com/AntPortal/game-off-2012.git",
					"git checkout https://github.com/AntPortal/game-off-2012.git",
					"clone https://github.com/AntPortal/game-off-2012.git",
					"clone git https://github.com/AntPortal/game-off-2012.git",
					"git-clone https://github.com/AntPortal/game-off-2012.git",
					"git clone AntPortal/game-off-2012.git"
				];
				var wrongAnswerAction = {
					label: wrongAnswers[_.random(wrongAnswers.length - 1)],
					result: scriptUtils.dialogAndPause(
						"@npcName@: Hmm @heroName@! That didn’t work! Please go tell Linus my piece of mind about his git magic. "
							+ "It doesn’t work!! Or maybe come talk to me again when you’ve listened more carefully to Linus’ lessons."
					)
				};

				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause(
						"@npcName@: Hi @heroName@! I've been trying to clone that book from Linus. What are the magic words to get it?"
					),
					scriptUtils.actionBranch(
						_.shuffle([rightAnswerAction, jokeAnswerAction, wrongAnswerAction]),
						function(menuActive) { actionMenuActive = menuActive; }
					),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			taskString: "Teach villagers about git clone (@num@ left)",
			referrable: true,
			icon: null /* TODO */
		},
		linusGitCloneComplete: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause(
						"@npcName@: @heroName@, I see in my scrying pool that you have succesfuly helped all "
							+ "the Svenites obtain the latest copy of my book. Thank you! Here’s your silver coin."
					),
					scriptUtils.removeCurrentInteraction(),
					[
						{
							action: 'arbitraryCode',
							code: function(curState, callback) {
								gameState.giveCopper(SILVER_VALUE);
								gameState.addInteraction(['Linus'], 'linusGitAdd');
								callback(curState + 1);
							}
						},
						{ action: 'destroyVM' }
					]
				]));
				vm.run();
			},
			taskString: "Report back to Linus",
			referrable: true,
			icon: null /* TODO */
		},
		linusGitAdd: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					_.flatten([
						"@npcName@: Ah, this is embarrassing... it seems there was a squashed bug in my book! He must have jumped in there when I wasn’t looking.",
						"@npcName@: Let me see... Okay. I’ve rewritten the page and the bug is there no more!",
						"@npcName@: Now I need to add that page into the book. For that I will use the magic words <span class='cmd'>git add page503</span>.",
						"@npcName@: But the page won’t be bound to my book until I call the magic words <span class='cmd'>git commit</span>, and then add a note explaining that I’ve removed a bug.",
						"@npcName@: <span class='cmd'>git add</span>, then <span class='cmd'>git commit</span>. You might want to remember that in case you ever need to commit something yourself...",
					].map(_.bind(scriptUtils.dialogAndPause, scriptUtils))),
					/* TODO: push the "git add" interaction onto some NPC's list of interactions */
					scriptUtils.makeReferral(
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you. It might be a good opportunity for you to teach @himOrHerRef@ about the new magic words I just taught you.",
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you.",
						"@npcName@: Come back and see me later in case I find another bug.",
						"villagerGitAdd"
					)
				]));
				vm.run();
			}
		}
	};
});
