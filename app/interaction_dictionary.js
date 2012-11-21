/**
 * A dictionary from interaction names to details about those interactions. Each one is represented
 * as an object with the following fields:
 * - doAction: a function that, when called, carries out the interaction.
 * - taskString: optional; the text to display in the task list for this interaction.
 * - referrable: optional; indicates whether the interaction is referrable or not. If absent, "false" is assumed.
 * - icon: TODO
 */
define([
	'underscore',
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
					scriptUtils.giveCopper(SILVER_VALUE),
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
					scriptUtils.removeCurrentInteraction(),
					[{ action: 'destroyVM' }]
				]));
				vm.run();
			},
			taskString: "Talk to Linus",
			referrable: true
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
										"I don't know, I've heard people have gotten themselves into a lot of trouble with that 'nmap' spell..."
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
					scriptUtils.removeCurrentInteraction(),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							/* TODO: give a reward? */
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
			taskString: "Talk to Apache", /* TODO: fix name? */
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
						"@npcName@: While you're at it, could you could pass by Ceeveeus’ house? He lives alone in a shack in the forest far North of Sveni.",
						"@npcName@: He never really wanted to join the village of Sveni. Maybe it was for tax purposes. Who knows."
					]),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
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
						}
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
								"Aaah, no, that didn’t work. You didn’t lose my changes, did you?",
								"I hope I don’t have to rewrite that chapter all over again..."
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [], take: 0
						}
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endCommit' }],
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.tryRemoveInteraction(
						"@npcName@: Thanks! As a token of gratitude, I’m going to go teach it to @npcNameRef@ on your behalf. My mother always told me that teaching is the best way to learn.",
						"@npcName@: Thanks!"
					),
					scriptUtils.removeCurrentInteraction(),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							var villagersWithGitAdd = gameState.findInteraction(thisInteraction);
							var ceeveeusInteraction = gameState.getOneInteraction('Ceeveeus');
							if (villagersWithGitAdd.length === 0 && !ceeveeusInteraction) {
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
					scriptUtils.dialogAndPause(["@npcName@: Hey, git out of my face!"]),
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
							text: "git clone https://github.com/AntPortal/game-off-2012.git",
							result: [{ action: 'jumpToLabel', label: 'beginAdd' }],
						},
						{ /* wrong answers */
							texts: [
								"git checkout https://github.com/AntPortal/game-off-2012.git",
								"cvs checkout https://github.com/AntPortal/game-off-2012.git",
								"cvs clone https://github.com/AntPortal/game-off-2012.git"
							],
							result: scriptUtils.dialogAndPause([
								"@npcName@:  Hrm, didn’t work. You know, back in my day, we made spells that actually did things..."
							]),
							take: 2
						},
						{ /* joke answers; none for now */
							choices: [],
							take: 0
						}
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
						}
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
						}
					),
					[{ action: 'jumpToLabel', label: 'end' }],

					[{ action: 'label', label: 'endCommit' }],
					scriptUtils.dialogAndPause([
						"@npcName@: `git commit`? Sounds like this “Linus” kid just took my ideas, changed a few keywords around, and called it his own.",
						"@npcName@: Still, at least the book is bound now. Give it a look... or don’t, I don’t care! I got work to do here.",
						"@npcName@: But I sure hope Linus will invent a spell to put all my branches in order... You wouldn’t happen to know how to do that, would you?"
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.actionBranch(_.shuffle([
						{
							label: "I’ve heard of the spells “csv2svn” and “git svn”. Maybe you can do something with those...",
							result: _.flatten(
								scriptUtils.dialogAndPause(["@npcName@: Hmm, really? That sounds like it just might work... here’s something for your trouble."]),
								scriptUtils.giveCopper(GOLD_VALUE)
							)
						},
						{
							label: "I don't know",
							result: scriptUtils.dialogAndPause(["@npcName@: Figures. Well, back to the old way... at least I know it works..."])
						},
						{
							label: "Just use “git cvs”",
							result: scriptUtils.dialogAndPause(["@npcName@: Son, I don’t want to be rude, but you have no idea what you’re talking about, do you?"])
						}
					])),
					[{
						action: 'arbitraryCode',
						code: function(curState, callback) {
							var villagersWithGitAdd = gameState.findInteraction('villagerGitAdd2');
							var ceeveeusInteraction = gameState.getOneInteraction('Ceeveeus');
							if (villagersWithGitAdd.length === 0 && !ceeveeusInteraction) {
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
					scriptUtils.giveCopper(2*SILVER_VALUE),
					scriptUtils.dialogAndPause([
						"@npcName@: By the way, Junio came by earlier. He was telling me about that squashed bug I found in chapter 10 of the book.",
						"@npcName@: I told him that I’d fixed it, and that he could use the “git pull” spell to get my changes into his copy of the book.",
						"@npcName@: I’m not sure he understood, though... I’m afraid he might’ve taken “pull” to mean “pull the page out of the book.”",
						"@npcName@: Maybe you should go visit him to explain it in more depth. He lives south of here, by the lake. Don’t forget the spell: “git pull.”"
					]),
					scriptUtils.removeCurrentInteraction(),
					scriptUtils.addInteraction(['Junio'], 'junioGitPull')
				]));
				vm.run();
			},
			taskString: "Talk to Linus",
			referrable: true
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
						}
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
						}
					),
					scriptUtils.dialogAndPause(["@npcName@: Doesn’t look like that worked. The bug is still here between the pages. Should we try again?"]),
					[{ action: 'jumpToLabel', label: 'askPull' }],

					[{ action: 'label', label: 'endPull' }],
					scriptUtils.dialogAndPause(["@npcName@: Hey, great. The bug is gone. Thanks! Here’s something for your help."]),
					scriptUtils.giveCopper(COPPER_VALUE),
					scriptUtils.removeCurrentInteraction()
				]));
				vm.run();
			},
			taskString: "Explain 'git pull' to villagers (@num@ left)",
			referrable: true
		}
	};
});
