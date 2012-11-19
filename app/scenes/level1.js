define([
		'config',
		'maps/level1.json',
		'mouselook',
		'utils',
		'script_utils',
		'Crafty',
		'underscore',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
		'components/Dialog',
		'components/GameState',
		'components/ActionMenu',
		'scenes/level2-intro',
		'components/TaskList',
	], function(config, mapData, mouselook, utils, ScriptUtils) {
	var COPPER_VALUE = 1;
	var SILVER_VALUE = 4;
	var GOLD_VALUE = 16;
	var PLATINUM_VALUE = 64;
	var HERO_START = {x: 8, y: 26};
	var taskListEntity = null;
	function init() {
		var hero; //entity global to this scene
		var tileProperties = utils.loadTileset(mapData);
		var actionMenuActive = false;

		/* Map from interaction names to objects containing information about those interactions. */
		var interactionDictionary = {
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
									config.setCurCoppers(config.getCurCoppers() + SILVER_VALUE);
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
		var gameState = Crafty.e('GameState').GameState(interactionDictionary);
		var npcDictionary = {};

		function updateTaskList() {
			taskListEntity.attr({
				tasks: [{
					label: "Clone Linus' book",
					done: false
				}]
			});
		}
		var parsedMapData = utils.loadMap(mapData, tileProperties, function(clickedTileEntity) {
			if (hero && !actionMenuActive) {
				hero.setWalkTarget(clickedTileEntity.tileX, clickedTileEntity.tileY);
				var i = 0;
				var nearbyNPC = null;
				for (i = 0; i < parsedMapData.objects.length; i++) {
					var object = parsedMapData.objects[i];
					if (object.type == 'npc') {
						var xDistance = Math.abs(object.tileX - clickedTileEntity.tileX);
						var yDistance = Math.abs(object.tileY - clickedTileEntity.tileY);
						if (xDistance + yDistance == 1) {
							//Has to be exactly 1 tile away, no diagonals, and not 0 distance.
							nearbyNPC = object; //If there are multiple choices, choose one arbitrarily.
							break;
						}
					}
				}
				utils.centerViewportOn(Crafty, clickedTileEntity, 30);

				if (nearbyNPC != null) {
					//actionMenuActive = true;
					/* The use of setTimeout here defers the enclosed until after the "click"
					 * event for this tile click tile has already passed. Note that this code
					 * is actually running in a "mouseup" handler, not a "click" handler, and
					 * that "mouseup" is always delivered before "click" when both are relevant;
					 * without the use of setTimeout here, the mouse listener from the PACADOC
					 * would already exist by the time the "click" event happened, and would
					 * capture that event, causing all the dialogs to close immediately before
					 * they were displayed. */
					setTimeout(function() {
						var npcName = nearbyNPC.properties.name;
						var actionName = gameState.getOneInteraction(npcName);
						var action = actionName ? interactionDictionary[actionName] : (npcName === "Linus" ? interactionDictionary.defaultLinus : interactionDictionary.defaultInteraction);
						var scriptUtils = new ScriptUtils(
							interactionDictionary,
							npcDictionary,
							gameState,
							{
								npc: npcDictionary[nearbyNPC.properties.name],
								interaction: actionName,
								face: undefined,
								x: clickedTileEntity.x - 300,
								y: clickedTileEntity.y - 125,
								heroName: config.getCurShortName()
							}
						);
						action.doAction(scriptUtils);
					}, 1);
				}
			}
		});
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			var pathFinder = utils.makePathFinder(parsedMapData);
			hero = Crafty.e('2D, Canvas, Character').
				Character(parsedMapData.heightMap, worldToPixel, pathFinder, HERO_START.x, HERO_START.y, {sprite: 'hero'});
			var i = 0;
			for (i = 0; i < parsedMapData.objects.length; i++) {
				var object = parsedMapData.objects[i];
				if (object.type == 'npc') {
					var npcEnt = Crafty.e('2D, Canvas, Character').
						Character(parsedMapData.heightMap, worldToPixel, pathFinder, object.tileX, object.tileY, object.properties);
					npcDictionary[object.properties.name] = npcEnt;
				} else {
					console.warn('Unknown object type: ', object.type);
				}
			}
		})();
		(function() {
			//Handle HUD
			utils.addMusicControlEntity(Crafty);
			taskListEntity = Crafty.e('TaskList');
			taskListEntity.TaskList('cr-stage', config.viewport.width - 220, 0, config.zOffset.gitk, 220, 100)
		})();

		Crafty.viewport.clampToEntities = false;
		utils.centerViewportOn(Crafty, hero, 1);
		mouselook.start();
		utils.ensureMusicIsPlaying('music/town');
		(function() { //Initial dialog from boy and girl to hero.
			if (!gameState.isEmpty()) {
				return;
			}

			var heroName = config.getCurShortName();
			var vm = Crafty.e('ScriptRunner');
			var chainSet = utils.chainSet;
			var template = {
				Linus: {
					x: -355,
					y: 580,
					w: 475,
					h: 90,
					face: 'face_childM', /* TODO: change? */
					showMore: true,
				}
			};
			function dialogAndPause(templateKey, lines) {
				return [{
					action: 'dialog',
					params: chainSet(Crafty.clone(template[templateKey]), 'msg', lines)
				}, {
					action: 'PACADOC'
				}]
			}
			vm.ScriptRunner(_.flatten([
				dialogAndPause('Linus', [
					"Hello " + heroName + "! It's nice of you to come by. Listen, I'm",
					"working on this new book and I'd love to share my draft with the",
					"villagers in Sveni. They will be so happy to hear the good news!"
				]),
				dialogAndPause('Linus', [
					"To get a copy of my book, they need to recite the magic words,",
					"\"git clone https://github.com/AntPortal/game-off-2012.git\".",
					"But they often git it wrong.",
				]),
				dialogAndPause('Linus', [
					"Your mission: go to the six villagers in Sveni, north of",
					"here, and help them say the right magic words. You will be",
					"rewarded with one copper coin once you complete your mission."
				]),
				[{
					action: 'arbitraryCode',
					code: function(curState, callback) {
						gameState.addInteraction(['Apache', 'Berkeley', 'Colin', 'Disco', 'Mergee', 'Conflictee'], 'villagerGitClone');
						updateTaskList();
						vm.destroy();
					}
				}]
			]));
			vm.run();
		})();
	}
	function uninit() {
		mouselook.stop();
		if (taskListEntity) {
			taskListEntity.destroy();
		}
		taskListEntity = null;
	}
	Crafty.scene('level1', init, uninit);
	return undefined;
});
