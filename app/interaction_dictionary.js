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
	var sveniteNames = ['Apache', 'Berkeley', 'Colin', 'Disco', 'Mergee', 'Conflictee'];
	return {
		defaultInteraction: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause(
						["@npcName@: Hi @heroName@! I've got nothing for you today. Why don't you look around to see if anyone else needs help?"]
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
						["@npcName@: Hi @heroName@! I'd give you some help with git, but that feature hasn't been implemented yet..."]
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
						["@npcName@: Really? That sounds dangerous... are you sure Linus said to use that? Maybe you should check with him again... "
							+ "I wouldn’t want to set my whole bookshelf on fire!"]
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
						["@npcName@: Hmm @heroName@! That didn’t work! Please go tell Linus my piece of mind about his git magic. "
							+ "It doesn’t work!! Or maybe come talk to me again when you’ve listened more carefully to Linus’ lessons."]
					)
				};

				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause(
						["@npcName@: Hi @heroName@! I've been trying to clone that book from Linus. What are the magic words to get it?"]
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
						["@npcName@: @heroName@, I see in my scrying pool that you have succesfuly helped all "
							+ "the Svenites obtain the latest copy of my book. Thank you! Here’s your silver coin."]
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
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Ah, this is embarrassing... it seems there was a squashed bug in my book! He must have jumped in there when I wasn’t looking.",
						"@npcName@: Let me see... Okay. I’ve rewritten the page and the bug is there no more!",
						"@npcName@: Now I need to add that page into the book. For that I will use the magic words <span class='cmd'>git add page503</span>.",
						"@npcName@: But the page won’t be bound to my book until I call the magic words <span class='cmd'>git commit</span>, and then add a note explaining that I’ve removed a bug.",
						"@npcName@: <span class='cmd'>git add</span>, then <span class='cmd'>git commit</span>. You might want to remember that in case you ever need to commit something yourself...",
					]),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							gameState.addInteraction([sveniteNames[0]], 'villagerGitAdd1');
							callback(curState+1);
						}
					}],
					scriptUtils.makeReferral(
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you. It might be a good opportunity for you to teach @himOrHerRef@ about the new magic words I just taught you.",
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you.",
						"@npcName@: Come back and see me later in case I find another bug.",
						"villagerGitAdd1"
					),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			referrable: true
		},

		villagerGitAdd1: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						/* TODO: replace "alchemy" with randomized topics */
						"@npcName@: Hey @heroName@, you came just in time. I’ve written a few pages on alchemy that I think would fit right into that book Linus is writing.",
						"@npcName@: The only problem is, I don’t know what I need to do to get them in.",
						"@npcName@: He said something about magically cloning his book, adding my new pages, and then binding those pages in.",
						"@npcName@: It all sounds really complicated. He called that “committing” or something... maybe you can help me with this.",
						"@npcName@: OK, let's start by getting a copy of the book. What's the incantation?"
					]),
					[{ action: 'jumpToLabel', label: 'askClone' }],
					[{ action: 'label', label: 'wrongAnswerClone' }],
					scriptUtils.dialogAndPause([
						"@npcName@: I can’t seem to see Linus’ stuff. I think I’d rather we start again. Give me a second to clean this up.",
						"@npcName@: Let’s try again. What’s the incantation for getting Linus’ stuff?"
					]),
					[{ action: 'label', label: 'askClone' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: 'git clone https://github.com/AntPortal/game-off-2012.git',
							result: [{ action: 'jumpToLabel', label: 'beginGitAdd' }],
						},
						{ /* wrong answers */
							texts: [
								'git-clone https://github.com/AntPortal/game-off-2012.git',
								'git clone AntPortal/game-off-2012.git'
							],
							result: [{ action: 'jumpToLabel', label: 'wrongAnswerClone'}],
							take: 1
						},
						{ /* joke answers */
							choices: [
								{
									text: 'git init',
									result: _.flatten([
										scriptUtils.dialogAndPause([
											"This doesn’t look like the right book... all it has is one page that says “This page intentionally left blank.” Are you sure that’s the right spell?"
										]),
										[{ action: 'jumpToLabel', label: 'wrongAnswerClone' }]
									])
								},
								{
									text: 'git clone https://github.com/ruby/ruby.git',
									result: _.flatten([
										scriptUtils.dialogAndPause([
											"Woah!! That’s a lot of stuff! Though are you sure this is Linus’ book? There’s all these gems, and clever trinkets."
										]),
										[{ action: 'jumpToLabel', label: 'wrongAnswerClone' }]
									])
								}
							],
							take: 1
						}
					),

					[{ action: 'label', label: 'beginGitAdd' }],
					scriptUtils.dialogAndPause([
						"@npcName@: Okay, I think I got the right book. Now I’ll add my pages at the end of the book... It will be Chapter 74.",
						"@npcName@: Now, what spell do I need to cast to insert the pages in the book?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: 'git add chapter74',
							result: [{ action: 'jumpToLabel', label: 'beginGitCommit' }],
						},
						{ /* wrong answers */
							texts: ['git fetch', 'git-add chapter74', 'git insert chapter74', 'mv chapter74 git'],
							result: scriptUtils.dialogAndPause([
								"Aaah, no, that didn’t work. You didn’t lose my changes, did you?",
								"I hope I don’t have to rewrite that chapter all over again..."
							]),
							take: 1
						},
						{ /* joke answers */
							choices: [
								{
									text: 'cat /dev/random',
									result: scriptUtils.dialogAndPause([
										"I͠ ͞ḑon'͠t̢ ̴k̶ńo͞w w̕h͟a͏t ̨you̡ ̛did, b͜u̕t̕ ̶I t͞hink̛ th̶e̸ ţe̢x͠t ͘is̴ ͞ovȩr̡f̀l̀o̧wi҉ng̛ ͘oút ̶of ͏the b̴óok̕.͜"
									])
								},
								{
									text: 'sudo systemctl poweroff',
									result: scriptUtils.dialogAndPause([
										"I don't think I have the wizardly authority to cast the 'sudo' spell..." /* TODO: say something about the "poweroff" part */
									])
								}
							],
							take: 1
						}
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'beginGitCommit' }],
					scriptUtils.dialogAndPause([
						"That looks like it worked! But the pages don’t seem to be glued to the book.",
						"Did Linus mention about anyway to permanently attach the pages? What’s that spell?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: 'git commit',
							result: _.flatten(
								[{ action: 'jumpToLabel', label: 'endGitCommit' }]
							),
						},
						{ /* wrong answers */
							texts: ['svn commit', 'git commit chapter74'],
							result: scriptUtils.dialogAndPause([
								"Aaah, no, that didn’t work. You didn’t lose my changes, did you?",
								"I hope I don’t have to rewrite that chapter all over again..."
							]),
							take: 1
						},
						{ /* joke answers */
							choices: [
								{
									text: 'curl http://download.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2',
									result: scriptUtils.dialogAndPause([
										"My house isn't big enough to hold a whole library..."
									])
								},
								{
									text: 'nmap 0.0.0.0/0',
									result: scriptUtils.dialogAndPause([
										"I don't know, I've heart people have gotten themselves into a lot of trouble with that 'nmap' spell..."
									])
								}
							],
							take: 1
						}
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endGitCommit' }],
					scriptUtils.dialogAndPause([
						"Ahh! Interesting, the book asked me to explain why I was gluing these pages in. But it’s all said and done now.",
						"Perfect, looks like the pages are securely fastened to the book. I guess I’ll continue writing my next chapter.",
						"Thank you! Oh, please go say thank you to Linus on my behalf."
					]),
					[{ action: 'label', label: 'end' }],
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			referrable: true
		}
	};
});
