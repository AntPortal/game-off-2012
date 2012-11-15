define([
		'config',
		'maps/level1.json',
		'mouselook',
		'utils',
		'Crafty',
		'underscore',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
		'components/Dialog',
		'components/ActionMenu',
		'scenes/level2-intro',
		'components/TaskList',
	], function(config, mapData, mouselook, utils) {
	var HERO_START = {x: 8, y: 26};
	var taskList = null;
	function init() {
		var hero; //entity global to this scene
		var hasNewspaper = {
			townfolk: false,
			healer: false,
			oldwoman: false,
			bunny: false,
			dancerF: false,
			oldman: false,
		};
		var tileProperties = utils.loadTileset(mapData);
		var actionMenuActive = false;
		function updateTaskList() {
			var numNewspapers = 0;
			for (var i in hasNewspaper) {
				if (hasNewspaper[i] === true) {
					numNewspapers++;
				}
			}
			taskList.attr({
				tasks: [{
					label: "Deliver newspapers ("+numNewspapers+"/6)",
					done: numNewspapers == 6,
				},{
					label: "Go to Millenial Fair",
					done: false,
				}]});
		}
		var parsedMapData = utils.loadMap(mapData, tileProperties, function(clickedTileEntity) {
			if (hero && !actionMenuActive) {
				hero.setWalkTarget(clickedTileEntity.tileX, clickedTileEntity.tileY);
				actionMenuActive = true;
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
				var heroName = config.getCurShortName();
				var actions = [];
				if (nearbyNPC == null) {
					actions.push({
						label: "Deliver Newspaper",
						enabled: false,
						subscript: "You must move next to the person you want to give the newspaper to.",
						onClick: function() {/*Can never reach here.*/}
					});
				} else if (nearbyNPC.name == 'boy' || nearbyNPC.name == 'girl') {
					var allNewspapersDelivered = true;
					for (i in hasNewspaper) {
						allNewspapersDelivered = allNewspapersDelivered && hasNewspaper[i];
					}
					actions.push({
						label: "Head to fair",
						enabled: allNewspapersDelivered,
						subscript: allNewspapersDelivered ? "Go with your friends to the Millenial Fair" : "You must deliver all your newspapers before you can go to the fair.",
						onClick: function() {
							config.setCurLevel(2);
							Crafty.scene('level2-intro');
							//TODO
						}
					});
				} else {
					//We must be near some NPC other than 'boy' or 'girl'
					var scriptData = {};
					scriptData.townfolk = {
						face: 'face_townfolkM',
						newspaperText: "Hey, thanks for delivering this, " + heroName + "!", //TODO
						chatText: "Hmm, it says here tensions are rising at the border.", //TODO
					};
					scriptData.healer = {
						face: 'face_healerF',
						newspaperText: "Hey, thanks for delivering this, " + heroName + "!", //TODO
						chatText: "Hmm, it says here tensions are rising at the border.", //TODO
					};
					scriptData.oldwoman = {
							newspaperScript: function() {
								//TODO;
								hasNewspaper.oldwoman = true;
							}
					};
					scriptData.dog = scriptData.oldwoman; //dog copies woman
					scriptData.oldman = {
							face: 'face_oldman',
							newspaperText: "Hey, thanks for delivering this, " + heroName + "!", //TODO
							chatText: "Hmm, it says here tensions are rising at the border.", //TODO
					};
					scriptData.dancerF = {
							face: 'face_dancerF',
							newspaperText: "Hey, thanks for delivering this, " + heroName + "!", //TODO
							chatText: "Hmm, it says here tensions are rising at the border.", //TODO
					};
					scriptData.bunny = {
							face: 'face_bunny',
							newspaperText: "Hey, thanks for delivering this, " + heroName + "!", //TODO
							chatText: "Hmm, it says here tensions are rising at the border.", //TODO
					};
					function createDialogScript(npcName) {
						return function() {
							var vm = Crafty.e('ScriptRunner');
							vm.ScriptRunner([
								{
									action: 'dialog',
									params: {
										x: clickedTileEntity.x - 300,
										y: clickedTileEntity.y - 125,
										w: 400,
										h: 70,
										face: scriptData[npcName].face,
										msg: hasNewspaper[npcName] ? scriptData[npcName].chatText : scriptData[npcName].newspaperText,
									}
								},
								{ action: 'PACADOC' },
								{ action: 'arbitraryCode', code: function(curState, callback) {
									hasNewspaper[npcName] = true;
									vm.destroy();
								}},
							]);
							vm.run();
						};
					}
					if (hasNewspaper[nearbyNPC.name]) {
						actions.push({
							label: "Chat",
							enabled: true,
							subscript: "Sees what this person has to say.",
							onClick: scriptData[nearbyNPC.name].chatScript || createDialogScript(nearbyNPC.name),
						});
					} else {
						actions.push({
							label: "Deliver Newspaper",
							enabled: true,
							subscript: "Gives a newspaper to this person." ,
							onClick: scriptData[nearbyNPC.name].newspaperScript || createDialogScript(nearbyNPC.name),
						});
					}
				}
				actions.push({
					label: "Do Nothing",
					enabled: true,
					subscript: "Moves to the selected position, then ends your turn.",
					onClick: function() { }
				});
				actions.push({
					label: "Cancel",
					enabled: true,
					subscript: "Allows you to select a new tile to move to",
					onClick: function() { }
				});
				Crafty.e('2D, Canvas, ActionMenu').attr({
					x: clickedTileEntity.x - 300,
					y: clickedTileEntity.y - 155,
					w: 400,
					h: 135,
					actions: actions,
				}).bind("Remove", function() {
					actionMenuActive = false;
				});
			}
		});
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			var pathFinder = utils.makePathFinder(parsedMapData);
			hero = Crafty.e('2D, Canvas, Character').
				Character(parsedMapData.heightMap, worldToPixel, pathFinder, HERO_START.x, HERO_START.y, 'hero');
			var i = 0;
			for (i = 0; i < parsedMapData.objects.length; i++) {
				var object = parsedMapData.objects[i];
				if (object.type == 'npc') {
					Crafty.e('2D, Canvas, Character').
						Character(parsedMapData.heightMap, worldToPixel, pathFinder, object.tileX, object.tileY, object.properties.sprite);
				} else {
					console.warn('Unknown object type: ', object.type);
				}
			}
		})();
		(function() {
			//Handle HUD
			utils.addMusicControlEntity(Crafty);
			taskList = Crafty.e('TaskList');
			taskList.TaskList('cr-stage', config.viewport.width - 220, 0, config.zOffset.gitk, 220, 100)
		})();

		Crafty.viewport.clampToEntities = false;
		utils.centerViewportOn(Crafty, hero, 1);
		mouselook.start();
		utils.ensureMusicIsPlaying('music/town');
		(function() { //Initial dialog from boy and girl to hero.
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
		if (taskList) {
			taskList.destroy();
		}
		taskList = null;
	}
	Crafty.scene('level1', init, uninit);
	return undefined;
});
