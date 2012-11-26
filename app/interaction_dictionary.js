/**
 * A dictionary from interaction names to details about those interactions. Each one is represented
 * as an object with the following fields:
 * - doAction: a function that, when called, carries out the interaction.
 * - taskString: optional; the text to display in the task list for this interaction.
 * - referrable: optional; indicates whether the interaction is referrable or not. If absent, "false" is assumed.
 * - icon: TODO
 */
define([
	'config',
	'utils',
	'underscore',
	'Crafty',
	'components/ScriptRunner',
], function(config, utils) {
	var sveniteNames = ['Apache', 'Berkeley', 'Colin', 'Disco', 'Mergee', 'Conflictee'];

	function checkGitPushDone(scriptUtils) {
		var gameState = scriptUtils.getGameState();
		return [{
			action: 'arbitraryCode',
			code: function(curState, callback) {
				var completed = _.all([1,2,3,4], function(i) {
					return gameState.findInteraction('villager'+i+'GitPush').length === 0;
				});
				if (completed) {
					gameState.addInteraction(['Linus'], 'linusFinal');
				}
				callback(curState+1);
			}
		}];
	}

	return {
		linusIntro: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hello @heroName@! It's nice of you to come by. Listen, I'm working on this new book and I'd love to share my draft with the villagers in Sveni. They will be so happy to hear the good news!",
						"@npcName@: To get a copy of my book, they need to recite the magic words, <span class='cmd'>“git clone https://github.com/git/git.git”</span>. But they often git it wrong.",
						"@npcName@: Your mission: go to the six villagers in Sveni, north of here, and help them say the right magic words. You will be rewarded with one silver coin once you complete your mission."
					]),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							var helpTextEnt = Crafty(Crafty('HelpText')[0]);
							helpTextEnt.setLines(["Drag or slide to look around.", "Click or tap on someone to talk to them."]);
							setTimeout(function() { helpTextEnt.setLines([]); }, 120000);
							callback(curState+1);
						}
					}],
					scriptUtils.addInteraction(sveniteNames, 'villagerGitClone'),
					scriptUtils.addInteraction(['Scott', 'Junio'], 'scottJunioGitClone'),
					scriptUtils.addInteraction(['Linus'], 'linusGitCloneRepeat'),
				]));
				vm.run();
			},
			taskString: "",
			referrable: false
		},

		defaultInteraction: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.makeReferral(
						"@npcName@: Hi @heroName@! I've got nothing for you right now. Why don't you go see @npcNameRef@? @HeOrSheRef@ said @heOrSheRef@ wanted to speak with you.",
						"@npcName@: Hi @heroName@! I've got nothing for you right now. Why don't you go see @npcNameRef@? @HeOrSheRef@ said @heOrSheRef@ wanted to speak with you.",
						"@npcName@: Hi @heroName@! I've got nothing for you right now. Why don't you look around to see if anyone else needs help?",
						undefined
					),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			}
		},
		defaultLinus: {
			doAction: function(scriptUtils) {
				utils.profile('interaction_dictionary defaultLinus action', function() {
					var vm = Crafty.e('ScriptRunner');
					vm.ScriptRunner(_.flatten([
						/* TODO: implement getting help with git */
						scriptUtils.dialogAndPause(
							["@npcName@: Hi @heroName@! I'd give you some help with git, but that feature hasn't been implemented yet..."]
						),
						[{ action: 'destroyVM' }]
					]));
					vm.run();
				});
			}
		},

		linusGitCloneRepeat: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Go and see the six villagers in the town of Sveni, northeast of here, and teach them how to get a copy of my book.",
						"@npcName@: Don't forgit, um, forget the magic words: <span class='cmd'>“git clone https://github.com/git/git.git.”</span>",
						"@npcName@: What are you waiting for? Go!"
					])
				]));
				vm.run();
			},
			taskString: "",
			referrable: false
		},

		scottJunioGitClone: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Are you looking for the village of Sveni? You can drag (or slide) the map to move around.",
						"@npcName@: You shouldn't have trouble finding it if you follow the road... it's on the hill northeast of here."
					])
				]));
				vm.run();
			},
			taskString: "",
			referrable: false,
		},

		villagerGitClone: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var thisInteraction = 'villagerGitClone';
				var rightAnswerAction = {
					label: "git clone https://github.com/git/git.git",
					result: _.flatten([
						scriptUtils.removeCurrentInteraction(),
						[{
							action: 'arbitraryCode',
							code: function(curState, callback) {
								var npcsWithClone = gameState.findInteraction(thisInteraction);
								var numClonesLeft = npcsWithClone.length;
								if (numClonesLeft === 0) {
									gameState.removeInteraction('Linus', 'linusGitCloneRepeat');
									gameState.removeInteraction('Scott', 'scottJunioGitClone');
									gameState.removeInteraction('Junio', 'scottJunioGitClone');
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
						),
						scriptUtils.giveCopper(config.coinValues.copper),
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
					"git init https://github.com/git/git.git",
					"git checkout https://github.com/git/git.git",
					"clone https://github.com/git/git.git",
					"clone git https://github.com/git/git.git",
					"git-clone https://github.com/git/git.git",
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
						"What are the magic words to clone Linus' book?"
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
					scriptUtils.giveCopper(config.coinValues.silver),
					scriptUtils.addInteraction(['Linus'], 'linusGitAdd1'),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			taskString: "Report back to Linus",
			referrable: true,
			icon: null /* TODO */
		},

		linusGitAdd1: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Ah, this is embarrassing... it seems there was a squashed bug in my book! He must have jumped in there when I wasn’t looking.",
						"@npcName@: Let me see... Okay. I’ve rewritten the page and the bug is there no more!",
						"@npcName@: Now I need to add that page into the book. For that I will use the magic words <span class='cmd'>“git add page503.”</span>",
						"@npcName@: But the page won’t be bound to my book until I call the magic words <span class='cmd'>“git commit,”</span> and then add a note explaining that I’ve removed a bug.",
						"@npcName@: <span class='cmd'>“git add,”</span> then <span class='cmd'>“git commit.”</span> You might want to remember that in case you ever need to commit something yourself...",
					]),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							gameState.addInteraction(['Scott'], 'villagerGitAdd1');
							gameState.addInteraction(['Linus'], 'linusGitAdd1Repeat');
							callback(curState+1);
						}
					}],
					scriptUtils.makeReferral(
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you. It might be a good opportunity for you to teach @himOrHerRef@ about the new magic words I just taught you.",
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you.",
						"@npcName@: Come back and see me later in case I find another bug.",
						"villagerGitAdd1"
					),
					scriptUtils.removeCurrentInteraction(),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			taskString: "Talk to Linus",
			referrable: true
		},

		linusGitAdd1Repeat: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.makeReferral(
						"@npcName@: I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you. It might be a good opportunity for you to teach @himOrHerRef@ about the <span class='cmd'>“git add”</span> and <span class='cmd'>“git commit”</span> spells I just taught you.",
						"@npcName@: BTW, I think @npcNameRef@ said @heOrSheRef@ wanted to talk to you.",
						"@npcName@: Come back and see me later in case I find another bug.",
						"villagerGitAdd1"
					)
				]));
				vm.run();
			},
			taskString: "",
			referrable: false
		},

		villagerGitAdd1: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
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
							text: 'git clone https://github.com/git/git.git',
							result: [{ action: 'jumpToLabel', label: 'beginGitAdd' }],
						},
						{ /* wrong answers */
							texts: [
								'git-clone https://github.com/git/git.git',
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
											"@npcName@: This doesn’t look like the right book... all it has is one page that says “This page intentionally left blank.” Are you sure that’s the right spell?"
										]),
										[{ action: 'jumpToLabel', label: 'wrongAnswerClone' }]
									])
								},
								{
									text: 'git clone https://github.com/ruby/ruby.git',
									result: _.flatten([
										scriptUtils.dialogAndPause([
											"@npcName@: Woah!! That’s a lot of stuff! Though are you sure this is Linus’ book? There’s all these gems, and clever trinkets."
										]),
										[{ action: 'jumpToLabel', label: 'wrongAnswerClone' }]
									])
								}
							],
							take: 1
						},
						"How do you get Linus' book?"
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
								"@npcName@: Aaah, no, that didn’t work. You didn’t lose my changes, did you?",
								"@npcName@: I hope I don’t have to rewrite that chapter all over again..."
							]),
							take: 1
						},
						{ /* joke answers */
							choices: [
								{
									text: 'cat /dev/random',
									result: scriptUtils.dialogAndPause([
										"@npcName@: I͠ ͞ḑon'͠t̢ ̴k̶ńo͞w w̕h͟a͏t ̨you̡ ̛did, b͜u̕t̕ ̶I t͞hink̛ th̶e̸ ţe̢x͠t ͘is̴ ͞ovȩr̡f̀l̀o̧wi҉ng̛ ͘oút ̶of ͏the b̴óok̕.͜"
									])
								},
								{
									text: 'sudo systemctl poweroff',
									result: scriptUtils.dialogAndPause([
										"@npcName@: I don't think I have the wizardly authority to cast the 'sudo' spell..." /* TODO: say something about the "poweroff" part */
									])
								}
							],
							take: 1
						},
						"How do you insert the pages in the book?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'beginGitCommit' }],
					scriptUtils.dialogAndPause([
						"@npcName@: That looks like it worked! But the pages don’t seem to be glued to the book.",
						"@npcName@: Did Linus mention about anyway to permanently attach the pages? What’s that spell?"
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
								"@npcName@: Aaah, no, that didn’t work. You didn’t lose my changes, did you?",
								"@npcName@: I hope I don’t have to rewrite that chapter all over again..."
							]),
							take: 1
						},
						{ /* joke answers */
							choices: [
								{
									text: 'curl http://download.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2',
									result: scriptUtils.dialogAndPause([
										"@npcName@: My house isn't big enough to hold a whole library..."
									])
								},
								{
									text: 'nmap 0.0.0.0/0',
									result: scriptUtils.dialogAndPause([
										"@npcName@: I don't know, I've heard people have gotten themselves into a lot of trouble with that 'nmap' spell..."
									])
								}
							],
							take: 1
						},
						"How do you permanently attach the pages?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endGitCommit' }],
					scriptUtils.dialogAndPause([
						"@npcName@: Ahh! Interesting, the book asked me to explain why I was gluing these pages in. But it’s all said and done now.",
						"@npcName@: Perfect, looks like the pages are securely fastened to the book. I guess I’ll continue writing my next chapter.",
						"@npcName@: Thank you! Oh, please go say thank you to Linus on my behalf."
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.giveCopper(config.coinValues.gold),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							gameState.removeInteraction('Linus', 'linusGitAdd1Repeat');
							gameState.addInteraction(['Linus'], 'linusGitAdd2');
							callback(curState+1);
						}
					}],
					[
						{ action: 'label', label: 'end' },
						{ action: 'destroyVM' }
					]
				]));
				vm.run();
			},
			taskString: "Teach Scott how to add and commit",
			referrable: true
		},

		linusGitAdd2: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: It sounds like you’ve now mastered the art of adding pages to the book.",
						"@npcName@: Could you please go back to the Svenites and teach them what you just taught Scott?", /* TODO: put actual name here */
						"@npcName@: This time, I think you can just teach 3 of them, and they’ll spread the word themselves from there.",
						"@npcName@: While you're at it, could you could pass by Ceeveeus’ house? He lives alone in a fortress in the forest far North of Sveni.",
						"@npcName@: He never really wanted to join the village of Sveni. Maybe it was for tax purposes. Who knows."
					]),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							gameState.addInteraction(['Linus'], 'linusGitAdd2Repeat');
							gameState.addInteraction(sveniteNames, 'villagerGitAdd2');
							gameState.addInteraction(['Ceeveeus'], 'ceeveeus1');
							callback(curState+1);
						}
					}],
					scriptUtils.removeCurrentInteraction()
				]));
				vm.run();
			},
			taskString: "Talk to Linus",
			referrable: true
		},

		linusGitAdd2Repeat: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Go and teach the Svenites about the <span class='cmd'>“git add”</span> and <span class='cmd'>“git commit”</span> spells you just taught Scott.",
						"@npcName@: Also make sure to pass by Ceeveeus’ house, far north of Sveni. Hopefully he’ll listen to you more than he listened to me…"
					])
				]));
				vm.run();
			},
			taskString: "",
			referrable: false,
		},

		villagerGitAdd2: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var thisInteraction = 'villagerGitAdd2';
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@, I’m so glad to see you. After we started reading Linus’ book, we realized how much we’d love to start writing ourselves too.",
						"@npcName@: I heard that writing magical books is the new literacy! Could you please show me how to add my new chapter?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git add chapter75",
							result: [{ action: 'jumpToLabel', label: 'beginCommit' }]
						},
						{ /* wrong answers */
							texts: ['git fetch', 'git-add chapter75', 'git insert chapter75', 'mv chapter75 git'],
							result: scriptUtils.dialogAndPause(["@npcName@: Aaah, no, that didn’t work. You didn’t lose my changes, did you? I hope I don’t have to rewrite that chapter all over again... "]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I add my new chapter?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'beginCommit' }],
					scriptUtils.dialogAndPause([
						"@npcName@: The pages don’t seem to be glued to the book, though. There's another spell to actually attach them, right? What is it?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git commit",
							result: [{ action: 'jumpToLabel', label: 'endCommit' }]
						},
						{ /* wrong answers */
							texts: ['svn commit', 'git commit chapter75'],
							result: scriptUtils.dialogAndPause([
								"@npcName@: Aaah, no, that didn’t work. You didn’t lose my changes, did you?",
								"@npcName@: I hope I don’t have to rewrite that chapter all over again..."
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How to attach the pages to the book?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endCommit' }],
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.tryRemoveInteraction(
						"@npcName@: Thanks! As a token of gratitude, I’m going to go teach it to @npcNameRef@ on your behalf. My mother always told me that teaching is the best way to learn.",
						"@npcName@: Thanks!"
					),
					scriptUtils.giveCopper(config.coinValues.silver),
					scriptUtils.removeCurrentInteraction(),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							var villagersWithGitAdd = gameState.findInteraction(thisInteraction);
							var ceeveeusInteraction = gameState.getOneInteraction('Ceeveeus');
							if (villagersWithGitAdd.length === 0 && !ceeveeusInteraction) {
								gameState.removeInteraction('Linus', 'linusGitAdd2Repeat');
								gameState.addInteraction(['Linus'], 'linusGitPull');
							}
							callback(curState+1);
						}
					}],

					[
						{ action: 'label', label: 'end' },
						{ action: 'destroyVM' }
					]
				]));
				vm.run();
			},
			taskString: "Teach villagers about git add",
			referrable: true
		},

		ceeveeus1: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: What do you want? Can’t you see I’m busy chopping down trees? There are branches all over the property!!",
						"@npcName@: Unless you’re here to help me clean up the mess, please go away!"
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Ceeveeus'], 'ceeveeus2')
				]));
				vm.run();
			},
			taskString: "Talk to Ceeveeus",
			referrable: true
		},

		ceeveeus2: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: You again? Don’t tell me Linus sent you. I already said I didn’t want to join Sveni.",
						"@npcName@: They are a bunch of high tax payers and their central government is slow.",
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Ceeveeus'], 'ceeveeus3')
				]));
				vm.run();
			},
			taskString: "Talk to Ceeveeus",
			referrable: true
		},

		ceeveeus3: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause(["@npcName@: Hey, git outta my face!"]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Ceeveeus'], 'ceeveeus4')
				]));
				vm.run();
			},
			taskString: "Talk to Ceeveeus",
			referrable: true
		},

		ceeveeus4: {
			doAction: function(scriptUtils) {
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Well, I respect stubbornness.",
						"@npcName@: You know I was stubborn too when I was young.",
						"@npcName@: I used to fight for righteous causes. Like this one time when I wrote a book on how to make chips and wafers."
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Ceeveeus'], 'ceeveeusClone')
				]));
				vm.run();
			},
			taskString: "Talk to Ceeveeus",
			referrable: true
		},

		ceeveeusClone: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: I give in. Maybe I’ll read just <em>one</em> page.",
						"@npcName@: So let’s get that book. Just tell me the magic words... "
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git clone https://github.com/git/git.git",
							result: [{ action: 'jumpToLabel', label: 'beginAdd' }],
						},
						{ /* wrong answers */
							texts: [
								"git checkout https://github.com/git/git.git",
								"cvs checkout https://github.com/git/git.git",
								"cvs clone https://github.com/git/git.git"
							],
							result: scriptUtils.dialogAndPause([
								"@npcName@:  Hrm, didn’t work. You know, back in my day, we made spells that actually did things..."
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [],
							take: 0
						},
						"How do you get the book?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'beginAdd' }],
					scriptUtils.dialogAndPause([
						"@npcName@: Okay, I have the book now. Le’ssee here... Geez, I can tell that this was written by a bunch of youngins’ who think they know everything.",
						"@npcName@: Why, I have half a mind to show this “Linus” what for. Tell me, son, how do I add my own pages to this book?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git add page504",
							result: [{ action: 'jumpToLabel', label: 'beginCommit' }]
						},
						{ /* wrong answers */
							texts: ["git-add page504", "cvs add page504"],
							result: scriptUtils.dialogAndPause(["@npcName@: No, that didn’t seem to do anything. Are you sure this “Linus magic” is any good?"]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [],
							take: 0
						},
						"How do you add pages to this book?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'beginCommit' }],
					scriptUtils.dialogAndPause([
						"@npcName@: Huh, that pretty much looks like the way <em>I’ve</em> been doing things all along. Reinventing the wheel is all you kids have done.",
						"@npcName@: Anyway, what do I do to permanently bind the page to the book?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git commit",
							result: [{ action: 'jumpToLabel', label: 'endCommit' }]
						},
						{ /* wrong answers */
							texts: ["cvs commit"], /* TODO: add more */
							result: scriptUtils.dialogAndPause(["@npcName@: Nope, the pages aren’t bound to the book. If you whippersnappers are gonna reinvent the wheel, and least invent a wheel that works!"]),
							take: 1
						},
						{ /* joke answers; none for now */
							choices: [],
							take: 0
						},
						"How do you permanently bind the page to the book?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endCommit' }],
					scriptUtils.dialogAndPause([
						"@npcName@: “git commit”? Sounds like this “Linus” kid just took my ideas, changed a few keywords around, and called it his own.",
						"@npcName@: Still, at least the book is bound now. Give it a look... or don’t, I don’t care! I got work to do here.",
						"@npcName@: But I sure hope Linus will invent a spell to put all my branches in order... You wouldn’t happen to know how to do that, would you?"
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.actionBranch(_.shuffle([
						{
							label: "Maybe you can do something with “csv2svn” and “git svn”...",
							result: _.flatten([
								scriptUtils.dialogAndPause(["@npcName@: Hmm, really? That sounds like it just might work... here’s something for your trouble."]),
								scriptUtils.giveCopper(config.coinValues.gold)
							])
						},
						{
							label: "I don't know",
							result: scriptUtils.dialogAndPause(["@npcName@: Figures. Well, back to the old way... at least I know it works..."])
						},
						{
							label: "Just use “git cvs”",
							result: scriptUtils.dialogAndPause(["@npcName@: Son, I don’t want to be rude, but you have no idea what you’re talking about, do you?"])
						}
					]),
					"Is there a spell to bridge from cvs to git?"),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							var villagersWithGitAdd = gameState.findInteraction('villagerGitAdd2');
							var ceeveeusInteraction = gameState.getOneInteraction('Ceeveeus');
							if (villagersWithGitAdd.length === 0 && !ceeveeusInteraction) {
								gameState.removeInteraction('Linus', 'linusGitAdd2Repeat');
								gameState.addInteraction(['Linus'], 'linusGitPull');
							}
							callback(curState+1);
						}
					}],

					[
						{ action: 'label', label: 'end' },
						{ action: 'destroyVM' }
					]
				]));
				vm.run();
			},
			taskString: "Talk to Ceeveeus",
			referrable: true
		},

		linusGitPull: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Well done. I could never get Ceeveeus to even take one look at git magic... Here’s two silver coins for doing such a good job."
					]),
					scriptUtils.giveCopper(2*config.coinValues.silver),
					scriptUtils.dialogAndPause([
						"@npcName@: By the way, Junio came by earlier. He was telling me about that squashed bug I found in chapter 10 of the book.",
						"@npcName@: I told him that I’d fixed it, and that he could use the <span class='cmd'>“git pull”</span> spell to get my changes into his copy of the book.",
						"@npcName@: I’m not sure he understood, though... I’m afraid he might’ve taken “pull” to mean “pull the page out of the book.”",
						"@npcName@: Maybe you should go visit him to explain it in more depth. He lives south of here, by the lake. Don’t forget the spell: <span class='cmd'>“git pull.”</span>"
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Linus'], 'linusGitPullRepeat'),
					scriptUtils.addInteraction(['Junio'], 'junioGitPull')
				]));
				vm.run();
			},
			taskString: "Talk to Linus",
			referrable: true
		},

		linusGitPullRepeat: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Go see Junio and show him how to get my changes into his copy of the book.",
						"@npcName@: Remember the spell: <span class='cmd'>“git pull.”</span>"
					])
				]));
				vm.run();
			},
			taskString: "",
			referrable: false
		},

		junioGitPull: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@; I saw a squashed bug between the pages of the book, and I spoke to Linus about it, but he said he had already gotten rid of it in his copy.",
						"@npcName@: I thought I could try and fix the affected pages myself, but then I’d have to guess at all the words that were under the bug.",
						"@npcName@: He said there’s a way to use git magic to get his changes into my copy ... I think he called it “pulling.” You know how to do that?"

					]),
					[{ action: 'label', label: 'askPull' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git pull",
							result: [{ action: 'jumpToLabel', label: 'endPull' }]
						},
						{ /* wrong answers */
							texts: ["git fetch", "git receive", "git update"],
							result: [], /* fall through */
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do you get Linus' changes?"
					),
					scriptUtils.dialogAndPause([
						"@npcName@: Doesn't look like that worked. The bug is still here between the pages. Should we try again?"
					]),
					[{ action: 'jumpToLabel', label: 'askPull' }],

					[{ action: 'label', label: 'endPull' }],
					scriptUtils.dialogAndPause([
						"@npcName@: Hey, great. The bug is gone. Thanks!",
						"@npcName@: I’m sure all the villagers in Sveni will want their books “de-bugged” as well. Why don’t you go and teach them how?"
					]),
					scriptUtils.removeInteraction('Linus', 'linusGitPullRepeat'),
					scriptUtils.giveCopper(config.coinValues.copper),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(sveniteNames, 'villagerGitPull')
				]));
				vm.run();
			},
			taskString: "Explain 'git pull' to Junio",
			referrable: true
		},

		villagerGitPull: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var thisInteraction = 'villagerGitPull';
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@, you came just at the right time. I’ve really been enjoying Linus’ book, but now I’m at chapter 10 and there’s a squashed bug over the most important paragraph!",
						"@npcName@: I won’t be able to understand any of the rest this way.",
						"@npcName@: I heard Linus fixed that, but I’d hate to have to throw the whole book out and “git clone” it all over again, just to get that fix.",
						"@npcName@: You know, there’s a limit on how many pages I can pull through the ether every month... What should I do?"
					]),

					[{ action: 'label', label: 'askPull' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git pull",
							result: [{ action: 'jumpToLabel', label: 'endPull' }]
						},
						{ /* wrong answers */
							texts: ["git fetch", "git receive", "git update"],
							result: [], /* fall through */
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [],  take: 0
						},
						"How do you get only the pages that changed?"
					),
					scriptUtils.dialogAndPause(["@npcName@: Doesn’t look like that worked. The bug is still here between the pages. Should we try again?"]),
					[{ action: 'jumpToLabel', label: 'askPull' }],

					[{ action: 'label', label: 'endPull' }],
					scriptUtils.dialogAndPause(["@npcName@: Hey, great. The bug is gone. Thanks! Here’s something for your help."]),
					scriptUtils.giveCopper(config.coinValues.copper),
					scriptUtils.removeCurrentInteraction(),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							var npcsWithPull = gameState.findInteraction(thisInteraction);
							if (npcsWithPull.length === 0) {
								gameState.addInteraction(['Linus'], 'linusGitPush');
							}
							callback(curState+1);
						}
					}]
				]));
				vm.run();
			},
			taskString: "Explain 'git pull' to villagers (@num@ left)",
			referrable: true
		},

		linusGitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hey, I heard my book is a big success. Everyone’s been adding their own little chapter to it.",
						"@npcName@: I think it’s great that we can all work together to make it better, but now everyone’s work is only in their own copy!",
						"@npcName@: Scott’s version has the chapter on alchemy, while Junio’s version has the chapter on summoning, and the Svenites all have their own books.",
						"@npcName@: You should teach them how to cast the “push” spell on each of their versions of the book, to send those changes to me.",
						"@npcName@: Then I can combine everything into one complete “master edition” with all of their chapters.",
						"@npcName@: The incantation is short and to-the-point: <span class='cmd'>“git push.”</span> But there's an important care you have to take when using that spell.",
						"@npcName@: I’m always working on this book, you see, and even after you've gotten a copy with <span class='cmd'>“git clone,”</span> or gotten the latest and greatest with <span class='cmd'>“git push”</span>, there's always a chance that I'll have changed something by the time you're ready to send your own changes back.",
						"@npcName@: And if you were to just send your changes straight off, they could interfere with mine, which would cause lots of trouble...",
						"@npcName@: So you must remember to always cast <span class='cmd'>“git pull”</span> before you try to send your changes. That will retrieve my latest changes and make sure they can fit together with yours.",
						"@npcName@: So, to sum it all up: <span class='cmd'>“git pull,”</span> then <span class='cmd'>“git push.”</span>",
						"@npcName@: Scott seems to be quick at picking up new spells. Why don’t you go see him first?"
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Scott'], 'scottGitPush'),
					scriptUtils.addInteraction(['Linus'], 'linusGitPushRepeat')
				]));
				vm.run();
			},
			taskString: "Check in with Linus",
			referrable: true
		},

		linusGitPushRepeat: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Go see Scott and teach him how to send him changes back to me.",
						"@npcName@: To do that, you first cast <span class='cmd'>“git pull”</span> to get my latest changes and make sure they fit together with yours. Then you cast <span class='cmd'>“git push”</span> to actually send your changes back to me."
					])
				]));
				vm.run();
			},
			taskString: "",
			referrable: false
		},

		scottGitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hey @heroName@, what’s up?",
						"@npcName@: Oh, Linus wants my chapter added to his “master edition”? Wow, that sounds great.",
						"@npcName@: There must be some magic involved to do that automatically, right? What's the first thing I need to do?"
					]),

					[{ action: 'label', label: 'beginPull' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git pull",
							result: [{ action: 'jumpToLabel', label: 'beginPush' }]
						},
						{ /* wrong answers */
							texts: ["git get", "git send", "git receive"],
							result: scriptUtils.dialogAndPause(["@npcName@: That didn't do anything. Should we try again?"]),
							take: 1
						},
						{ /* not really a joke answer, but has a specialized response */
							choices: [{
								text: "git push",
								result: scriptUtils.dialogAndPause([
									"@npcName@: OK... wait. What if Linus changed something in his copy while I was working on mine? Shouldn't we get his latest changes first, so we can be sure they won't interfere with mine?"
								])
							}],
							take: 1
						},
						"If I want to send changes to Linus, what do I do first?"
					),
					[{ action: 'jumpToLabel', label: 'beginPull' }],

					[{ action: 'label', label: 'beginPush' }],
					scriptUtils.dialogAndPause([
						"@npcName@: OK, looks like everything fits together well. Now, we need to actually send the changes over, right? What's the spell for that?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git push",
							result: [{ action: 'jumpToLabel', label: 'endPush' }]
						},
						{ /* wrong answers */
							texts: ["git commit", "git add", "git update", "git send"],
							result: scriptUtils.dialogAndPause([
								"@npcName@: Well, it doesn’t seem like anything happened.",
								"@npcName@: I mean, you could go ask Linus if he now has my chapter I guess, but something didn’t feel quite right about casting that last spell..."
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I send my changes over to Linus?"
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endPush' }],
					scriptUtils.dialogAndPause(["@npcName@: Hey, did you see that? The extra pages from my chapter flew into the clouds. I bet Linus probably has my chapter now."]),
					scriptUtils.addInteraction(['Junio'], 'junioGitPush'),
					scriptUtils.removeInteraction('Linus', 'linusGitPushRepeat'),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.giveCopper(config.coinValues.copper),
					[
						{ action: 'label', label: 'end' },
						{ action: 'destroyVM' }
					]
				]));
				vm.run();
			},
			taskString: "Explain 'git push' to Scott",
			referrable: true
		},

		junioGitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@. What’s happening?",
						"@npcName@: Linus wants my chapter added to the book? I’ve got the pages ready right here, on the table.",
						"@npcName@: I’m guessing I have a few steps to do to get the pages bound in and sent off. What comes first?"
					]),

					[{ action: 'label', label: 'beginAdd' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git add chapter76",
							result: [{ action: 'jumpToLabel', label: 'beginCommit' }]
						},
						{ /* wrong answers */
							texts: ["git merge", "git mv chapter76 book"],
							result: [{ action: 'jumpToLabel', label: 'wrongAnswer' }],
							take: 1
						},
						{ /* not really a joke answer, but has a specialized response */
							choices: [{
								text: "git push",
								result: [] /* fall through */
							}],
							take: 1
						},
						"What's the first step to get the pages bound in?"
					),
					//This is the response you get if you do the joke answer.
					scriptUtils.dialogAndPause([
						"@npcName@: Huh, nothing happened. I wonder why…",
						"@npcName@: … Oh, I forgot to actually put them in the book. How can I do that?"
					]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git add chapter76",
							result: [{ action: 'jumpToLabel', label: 'beginCommit' }]
						},
						{ /* wrong answers */
							texts: ["git mv table/pages book/chapter76", "git-add chapter76", "git commit chapter76"],
							result: [{ action: 'jumpToLabel', label: 'wrongAnswer' }],
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I put the pages in the book?"
					),

					[{ action: 'label', label: 'beginCommit' }],
					scriptUtils.dialogAndPause(["@npcName@: OK, the pages are in the book now. What next?"]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git commit",
							result: [{ action: 'jumpToLabel', label: 'beginPush' }]
							},
						{ /* wrong answers */
							texts: ["git add", "git log"],
							result: [{ action: 'jumpToLabel', label: 'wrongAnswer' }],
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I bind the pages in the book?"
					),

					[{ action: 'label', label: 'beginPush' }],
					scriptUtils.dialogAndPause(["@npcName@: Looks like the pages are all bound. What's the next step?"]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git push",
							result: [{ action: 'jumpToLabel', label: 'endPush' }]
						},
						{ /* wrong answers */
							texts: ["git send", "git transmit"],
							result: [{ action: 'jumpToLabel', label: 'wrongAnswer' }],
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What do I do after binding the pages?"
					),

					[{ action: 'label', label: 'endPush' }],
					scriptUtils.dialogAndPause([
						"@npcName@: And there the pages go into the clouds. I’m sure Linus must have them now. Thanks!",
						"@npcName@: Maybe you should have a look around the village to see if anyone else has some writing they want to share with Linus.",
						"@npcName@: You'll know them when you see them."
					]),
					scriptUtils.giveCopper(config.coinValues.gold),
					scriptUtils.removeCurrentInteraction(),
					_.chain(sveniteNames).shuffle().first(4).zip([1, 2, 3, 4]).map(function(p) {
						return scriptUtils.addInteraction([p[0]], 'villager' + p[1] + 'GitPush');
					}).value(),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'wrongAnswer' }],
					scriptUtils.dialogAndPause(["@npcName@: Nothing happened. You sure that’s the right spell?"]),

					[
						{ action: 'label', label: 'end' },
						{ action: 'destroyVM' }
					]
				]));
				vm.run();
			},
			taskString: "Explain 'git push' to Junio",
			referrable: true
		},

		villager1GitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@. I heard Linus is assembling a master edition of his book, and wants everyone to send their chapters to him.",
						"@npcName@: He said there's a spell we can cast to do that. What is it? I already have my writing added in and bound."
					]),

					[{ action: 'label', label: 'beginPush' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git push",
							result: [{ action: 'jumpToLabel', label: 'endPush' }]
						},
						{ /* wrong answers */
							texts: ["git send", "git transmit", "git update"],
							result: _.flatten([
								scriptUtils.dialogAndPause([
									"@npcName@: It doesn’t seem like anything happened. Should we try again?",
								]),
								[{ action: 'jumpToLabel', label: 'beginPush' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What do I do after binding my writing?"
					),

					[{ action: 'label', label: 'endPush' }],
					scriptUtils.dialogAndPause(["@npcName@: Thanks!"]),
					scriptUtils.removeCurrentInteraction(),
					checkGitPushDone(scriptUtils),
					scriptUtils.giveCopper(config.coinValues.copper),
					[{ action: 'destroyVM' }],
				]));
				vm.run();
			},
			taskString: "Explain 'git push' to villagers (@num@ left)",
			referrable: true
		},

		villager2GitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@, I heard Linus is collecting all the chapters that everyone contributed, to add to a master edition of his book.",
						"@npcName@: I have all my pages right here. If I want to get these to him, what do I do first?"
					]),

					[{ action: 'label', label: 'beginAdd' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git add chapter77",
							result: [{ action: 'jumpToLabel', label: 'beginCommit' }]
						},
						{ /* wrong answers */
							texts: ["git push", "git commit"],
							result: _.flatten([
								scriptUtils.dialogAndPause([
									"@npcName@: That didn't do anything... I have a feeling there's something else I have to do first..."
								]),
								[{ action: 'jumpToLabel', label: 'beginAdd' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What do I do first?"
					),

					[{ action: 'label', label: 'beginCommit' }],
					scriptUtils.dialogAndPause(["@npcName@: OK, the pages are in the book now. What's next?"]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git commit",
							result: [{ action: 'jumpToLabel', label: 'beginPush' }]
						},
						{ /* wrong answers */
							texts: ["git push", "git log", "git bind"],
							result: _.flatten([
								scriptUtils.dialogAndPause([
									"@npcName@: That didn't work. Are you sure that's the right spell? Let's try again."
								]),
								[{ action: 'jumpToLabel', label: 'beginCommit' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What do I do after adding the pages?"
					),

					[{ action: 'label', label: 'beginPush' }],
					scriptUtils.dialogAndPause(["@npcName@: OK, looks like the pages are bound... what now?"]),
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git push",
							result: [{ action: 'jumpToLabel', label: 'endPush' }]
						},
						{ /* wrong answers */
							texts: ["git send", "git transmit", "git update"],
							result: _.flatten([
								scriptUtils.dialogAndPause(["@npcName@: That didn't do anything. Are you sure that's the right spell? Let's try again."]),
								[{ action: 'jumpToLabel', label: 'beginPush' }]
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What do I do after binding the pages?"
					),

					[{ action: 'label', label: 'endPush' }],
					scriptUtils.dialogAndPause(["@npcName@: Thanks!"]),
					scriptUtils.giveCopper(config.coinValues.gold),
					scriptUtils.removeCurrentInteraction(),
					checkGitPushDone(scriptUtils),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			taskString: "Explain 'git push' to villagers (@num@ left)",
			referrable: true
		},

		villager3GitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@, I’ve written another chapter on transmutation, and I’ve already added it to the book by using “git add.”",
						"@npcName@: I’d like to share this with Linus, and word is that there’s a spell that will let me do just that.",
						"@npcName@: So after “git add”, what's the next thing to do?"
					]),

					[{ action: 'label', label: 'beginCommit' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git commit",
							result: [{ action: 'jumpToLabel', label: 'beginPush' }]
						},
						{ /* wrong answers */
							texts: ["git push", "git send"],
							result: _.flatten([
								scriptUtils.dialogAndPause([
									"@npcName@: No, that didn’t seem to do anything. I think the ordering of the spells matter.",
									"@npcName@: There’s something you specifically have to do after casting the `git add` spell... what is it?"
								]),
								[{ action: 'jumpToLabel', label: 'beginCommit' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What do I do after “git add”?"
					),

					[{ action: 'label', label: 'beginPush' }],
					scriptUtils.dialogAndPause([
						"@npcName@: Good call, I almost forgot that I had to bind the pages after adding them.",
						"@npcName@: Now I guess it’s time to use that other spell for sending it off, right? What is it?"
					]),
					[{ action: 'label', label: 'askPush' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git push",
							result: [{ action: 'jumpToLabel', label: 'endPush' }]
						},
						{ /* wrong answers */
							texts: ["git send", "git log"],
							result: _.flatten([
								scriptUtils.dialogAndPause([
									"@npcName@: I don’t think that worked. I saw someone else cast the spell, and it made his copy of the book fly into the clouds.",
									"@npcName@: Do you think we should try again?"
								])
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"What's the spell to send off the book?"
					),

					[{ action: 'label', label: 'endPush' }],
					scriptUtils.dialogAndPause([
						"@npcName@: That’s all it takes? I’m impressed by how simple git magic is to use nowadays.",
						"@npcName@: I can remember when the git wizards would always talk in arcane terms like “porcelain” and “plumbing”, and nobody could ever tell what they were getting at.",
						"@npcName@: Thanks for your help!"
					]),
					scriptUtils.giveCopper(config.coinValues.silver),
					scriptUtils.removeCurrentInteraction(),
					checkGitPushDone(scriptUtils),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			taskString: "Explain 'git push' to villagers (@num@ left)",
			referrable: true
		},

		villager4GitPush: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: Hi @heroName@, I heard Linus is writing a book on magic, but I’m sure he doesn’t have anything on illusions in it, because those are something of an obscure art.",
						"@npcName@: I wrote an essay on that not long ago, and I think it’d fit right in as a new chapter, but I’ve no idea how to get started.",
						"@npcName@: I don’t even have a copy of Linus’ book yet. What should I do first?"
					]),
					[{ action: 'label', label: 'askClone' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git clone https://github.com/git/git.git",
							result: [{ action: 'jumpToLabel', label: 'beginAdd' }]
						},
						{ /* wrong answers */
							texts: ["git-clone https://github.com/git/git.git", "git checkout https://github.com/git/git.git"],
							result: _.flatten([
								scriptUtils.dialogAndPause([
									"@npcName@: I guess it didn’t work, ‘cause I figure I’d have Linus’ book in front of me after having cast the spell, but I don’t see a book here. Want to try again?"]),
								[{ action: 'jumpToLabel', label: 'askClone' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I get a copy of Linus' book?"
					),

					[{ action: 'label', label: 'beginAdd' }],
					scriptUtils.dialogAndPause(["@npcName@: Okay, I’ve got the book, and I’ve written down my changes. How do I get my changes into the book?"]),
					[{ action: 'label', label: 'askAdd' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git add chapter77",
							result: [{ action: 'jumpToLabel', label: 'beginCommit' }]
						},
						{ /* wrong answers */
							texts: ["git-add chapter77", "git insert chapter77", "git append chapter77"],
							result: _.flatten([
								scriptUtils.dialogAndPause(["@npcName@: My page still isn't in the book. Are you sure you’re casting the right spell? Let's try again."]),
								[{ action: 'jumpToLabel', label: 'askAdd' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I get my changes into the book?"
					),

					[{ action: 'label', label: 'beginCommit' }],
					scriptUtils.dialogAndPause(["@npcName@: Well, the pages are in the book now, but they’re not actually attached to the spine. Is there a way to make my additions more permanent?"]),
					[{ action: 'label', label: 'askCommit' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git commit",
							result: [{ action: 'jumpToLabel', label: 'beginPush' }]
						},
						{ /* wrong answers */
							texts: ["git save", "git bind"],
							result: _.flatten([
								scriptUtils.dialogAndPause(["@npcName@: Hmm, my pages still seem to be unattached to the book. Perhaps we need a different spell?"]),
								[{ action: 'jumpToLabel', label: 'askCommit' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I permanently attach the pages?"
					),

					[{ action: 'label', label: 'beginPush' }],
					scriptUtils.dialogAndPause(["@npcName@: Great! Now how do I share my changes with the rest of the villagers?"]),
					[{ action: 'label', label: 'askPush' }],
					scriptUtils.quizBranch(
						{ /* right answer */
							text: "git push",
							result: [{ action: 'jumpToLabel', label: 'endPush' }]
						},
						{ /* wrong answers */
							texts: ["git send", "git transmit"],
							result: _.flatten([
								scriptUtils.dialogAndPause(["@npcName@: Nothing seems to have happened. Are you sure you cast the right spell? Let's try again."]),
								[{ action: 'jumpToLabel', label: 'askPush' }],
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						},
						"How do I share my changes with the others?"
					),

					[{ action: 'label', label: 'endPush' }],
					scriptUtils.dialogAndPause(["@npcName@: Looks like it worked. Thanks! Here's two gold coins for your trouble."]),
					scriptUtils.giveCopper(2 * config.coinValues.gold),
					scriptUtils.removeCurrentInteraction(),
					checkGitPushDone(scriptUtils)
				]));
				vm.run();
			},
			taskString: "Explain 'git push' to villagers (@num@ left)",
			referrable: true
		},

		linusFinal: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: @heroName@! I’ve been following your progress as you’ve been teaching the villagers all about git magic, and I think you’re ready to join my magic shop as an Apprentice.",
						"@npcName@: Congratulations! Here’s a badge that you can wear to show others what you’ve accomplished.",
						/* TODO: actually award badge here */
						"@npcName@: Even though you now have a good understanding of how you can use git magic for everyday tasks, there is still much of its power you haven’t tapped.",
						"@npcName@: I don’t have any more lessons prepared for you right now, but you’re welcome to explore on your own by reading the texts at <a href='http://git-scm.com/doc' target='_blank'>http://git-scm.com/doc</a>.",
						"@npcName@: You might also want to go back to Sveni sometime to see how you can use your new knowledge to help the villagers with their more involved needs.",
						"@npcName@: I’m sure they’ll reward you well for it..."
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(["Linus"], "linusFinalRepeat")
				]));
				vm.run();
			},
			taskString: "Check back with Linus",
			referrable: true
		},

		linusFinalRepeat: {
			doAction: function(scriptUtils) {
				var gameState = scriptUtils.getGameState();
				var vm = Crafty.e('ScriptRunner');
				vm.ScriptRunner(_.flatten([
					scriptUtils.dialogAndPause([
						"@npcName@: If you want to learn more about git magic, there are many resources available to you, which you can find at <a href='http://git-scm.com/doc' target='_blank'>http://git-scm.com/doc</a>",
						"@npcName@: I'd especially like to highlight the <a href='http://git-scm.com/book' target='_blank'>Pro Git</a> book, which builds on the basics I've taught you and then progresses into much more advanced spells. You'll be amazed at what git magic can do!",
						"@npcName@: Or, if you're starting to find this village a bit too small, you can move to the big city of <a href='http://github.com' target='_blank'>GitHub</a>, where thousands of people use git magic every day to work together on their creations.",
						"@npcName@: As long as you're willing to share your creations with the world, it won't cost even one copper to <a href='https://github.com/signup' target='_blank'>become a citizen</a>.",
						"@npcName@: But even if you do that, please do come back to visit Sveni sometimes. The villagers might still need your help, after all..."
					])
				]));
				vm.run();
			},
			taskString: "",
			referrable: false,
		}
	};
});
