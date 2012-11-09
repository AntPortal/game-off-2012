define([
		'config',
		'maps/level1.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
		'components/VersionHistory',
		'components/Dialog',
		'components/Gitk',
		'components/Sepia',
		'components/ActionMenu',
		'scenes/level2-intro',
		'components/TaskList',
	], function(config, mapData, mouselook, utils) {
	var HERO_START = {x: 8, y: 26};
	var sepiaEntity = null;
	var versions = null;
	var taskList = null;
	function init() {
		versions = Crafty.e('VersionHistory').VersionHistory(5);
		sepiaEntity = Crafty.e('Sepia').
			Sepia('cr-stage', 0, 0, config.zOffset.gitk - 1, config.viewport.width, config.viewport.height);
		var hero; //entity global to this scene
		var hasNewspaper = {
			townfolk: false,
			healer: false,
			oldwoman: false,
			bunny: false,
			dancerF: false,
			oldman: false,
		}
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
		function commitPseudoCurrentState(heroX, heroY) {
			versions.commit({
				hero: {
					x: heroX,
					y: heroY
				},
				hasNewspaper: hasNewspaper,
			});
			updateTaskList();
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
								actionMenuActive = false;
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
									actionMenuActive = false;
									commitPseudoCurrentState(clickedTileEntity.tileX, clickedTileEntity.tileY);
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
					onClick: function() {
						actionMenuActive = false;
						commitPseudoCurrentState(clickedTileEntity.tileX, clickedTileEntity.tileY);
					}
				});
				actions.push({
					label: "Cancel",
					enabled: true,
					subscript: "Allows you to select a new tile to move to",
					onClick: function() {
						actionMenuActive = false;
						versions.reset();
					}
				});
				Crafty.e('2D, Canvas, ActionMenu').attr({
					x: clickedTileEntity.x - 300,
					y: clickedTileEntity.y - 155,
					w: 400,
					h: 135,
					actions: actions,
				});
				sepiaEntity.setVisible(false);
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
			var COMMIT_SIZE = 16;
			Crafty.e('Gitk').Gitk(
				'cr-stage',
				COMMIT_SIZE * 2, /* x */
				config.viewport.height - (COMMIT_SIZE * 6) - 16, /* y */
				config.viewport.width - 64, /* width */
				(COMMIT_SIZE * 6), /* height */
				versions
			);
		})();
		commitPseudoCurrentState(HERO_START.x,HERO_START.y); //initial state
		versions.mergeFunc = function(base, ours, theirs) {
			return {
				hero: {
					x: ours.hero.x,
					y: ours.hero.y
				},
				hasNewspapers: utils.mergeObjs(ours.hasNewspapers, theirs.hasNewspapers, function(x, y) { return x || y; })
			}
		};
		versions.bind("Checkout", function(rev) {
			var revData = rev.data;
			var tileX = revData.hero.x;
			var tileY = revData.hero.y;
			hasNewspapers = revData.hasNewspapers;
			hero.setPos(tileX, tileY, parsedMapData.heightMap[tileX+","+tileY].surfaceZ);
			hero.setWalkTarget(tileX, tileY);
			var isLeaf = rev.childRevIds.length == 0;
			sepiaEntity.setVisible(! isLeaf);
			updateTaskList();
		});
		Crafty.viewport.clampToEntities = false;
		utils.centerViewportOn(Crafty, hero, 1);
		mouselook.start();
		utils.ensureMusicIsPlaying('music/town');
		(function() { //Initial dialog from boy and girl to hero.
			var vm = Crafty.e('ScriptRunner');
			var chainSet = utils.chainSet;
			var template = {
				boy: {
					x: -280,
					y: 580,
					w: 400,
					h: 90,
					face: 'face_childM',
					showMore: true,
				},
				girl: {
					x: -560,
					y: 420,
					w: 400,
					h: 90,
					face: 'face_childF',
					showMore: true,
				}
			};
			vm.ScriptRunner([{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.boy), 'msg', [
					"Finally! What took you so long? We're almost out of",
					"time for the fair!",
				]),
			},{
					action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.girl), 'msg', [
					"Hurry up and deliver those newspapers so we can get",
					"out of here!",
				]),
			},{
					action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.boy), 'msg', [
					"You remember how, right? Just click next to the guy,",
					"to walk up to him and then pick \"Deliver Newspaper\"",
					"from the action menu!",
				]),
			},{
					action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.girl), 'msg', [
					"And if you can't see the person you want to deliver",
					"the paper to, just drag the map until you CAN see them",
					"and THEN click next to them.",
				]),
			},{
					action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.girl), 'msg', [
					"The key is always to move, then perform an action,",
					"in that order. You can't move twice in a row without",
					"an action in between.",
				]),
			},{
				action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.boy), 'msg', [
					"I mean, if you REALLY want to just move somewhere, and",
					"then not do an action, pick the \"Do nothing\" action..."
				]),
			},{
				action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.girl), 'msg', [
					"But don't waste any time \"doing nothing\" here, 'cause",
					"we gotta get to the fair before it closes!",
				]),
			},{
				action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.boy), 'msg', [
					"If you mess up your movement, you can always choose",
					"\"cancel\" from the action menu to try again!"
				]),
			},{
				action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.girl), 'msg', [
					"And if you REALLY mess up, you could always use your",
					"magic powers to rewind time!"
				]),
			},{
				action: 'PACADOC'
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.boy), 'msg', [
					"Now get going! We're gonna be late!"
				]),
			},{
				action: 'dialog',
				params: chainSet(Crafty.clone(template.girl), 'msg', [
					"Now get going! We're gonna be late!"
				]),
			},{
				action: 'PACADOC'
			}, {
				action: 'arbitraryCode',
				code: function(curState, callback) {
					updateTaskList();
					vm.destroy();
				}
			}
			]);
			vm.run();
		})();
	}
	function uninit() {
		if (sepiaEntity) {
			sepiaEntity.destroy();
		}
		sepiaEntity = null;
		if (versions) {
			versions.destroy();
		}
		versions = null;
		if (taskList) {
			taskList.destroy();
		}
		taskList = null;
	}
	Crafty.scene('level1', init, uninit);
	return undefined;
});
