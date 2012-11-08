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
	], function(config, mapData, mouselook, utils) {
	var HERO_START = {x: 8, y: 26};
	Crafty.scene('level1', function() {
		var versions = Crafty.e('VersionHistory');
		var sepiaEntity = Crafty.e('Sepia').
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
		function commitPseudoCurrentState(heroX, heroY) {
			versions.commit({
				hero: {
					x: heroX,
					y: heroY
				},
				hasNewspaper: hasNewspaper,
			});
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
				utils.centerViewportOn(Crafty, clickedTileEntity, 60);
				var heroName = config.getCurShortName();
				Crafty.e('2D, Canvas, ActionMenu').attr({
					x: clickedTileEntity.x - 300,
					y: clickedTileEntity.y - 155,
					w: 400,
					h: 135,
					actions: [{
						label: "Deliver Newspaper",
						enabled: (nearbyNPC != null),
						subscript: nearbyNPC ? "Delivers a newspaper." : "You must move next to the person you want to give the newspaper to.",
						onClick: function() {
							function createNewspaperScript(face, firstDialog, subsequentDialog, hasNewspaperKey) {
								var vm = Crafty.e('2D, ScriptRunner');
								vm.ScriptRunner([
									{
										action: 'dialog',
										params: {
											x: clickedTileEntity.x - 300,
											y: clickedTileEntity.y - 125,
											w: 400,
											h: 70,
											face: face,
											msg: hasNewspaper[hasNewspaperKey] ? subsequentDialog : firstDialog
										}
									},
									{ action: 'PACADOC' },
									{ action: 'arbitraryCode', code: function(curState, callback) {
										hasNewspaper[hasNewspaperKey] = true;
										actionMenuActive = false;
										vm.destroy();
									}},
								]);
								return vm;
							}
							switch(nearbyNPC.name) {
							case 'townfolk':
								createNewspaperScript(
									'face_townfolkM',
									"Hey, thanks for delivering this, " + heroName + "!",
									"Hmm, it says here tensions are rising at the border.",
									'townfolk'
								).run();
								break;
							case 'healer':
								createNewspaperScript(
										'face_healerF',
										"Hey, thanks for delivering this, " + heroName + "!", //TODO
										"Hmm, it says here tensions are rising at the border.", //TODO
										'healer'
									).run();
								break;
							case 'oldwoman': //intentional fallthrough to dog
							case 'dog':
								//TODO
								actionMenuActive = false;
								break;
							case 'oldman':
								createNewspaperScript(
										'face_oldman',
										"Hey, thanks for delivering this, " + heroName + "!", //TODO
										"Hmm, it says here tensions are rising at the border.", //TODO
										'oldman'
									).run();
								break;
							case 'dancerF':
								createNewspaperScript(
									'face_dancerF',
									"Hey, thanks for delivering this, " + heroName + "!", //TODO
									"Hmm, it says here tensions are rising at the border.", //TODO
									'dancerF'
								).run();
								break;
							case 'bunny':
								createNewspaperScript(
									'face_bunny',
									"Hey, thanks for delivering this, " + heroName + "!", //TODO
									"Hmm, it says here tensions are rising at the border.", //TODO
									'bunny'
								).run();
								break;
							case 'girl': //intentional fallthrough to boy
							case 'boy':
								//TODO
								actionMenuActive = false;
								break;
							default:
								console.error('Unrecognized NPC: ', nearbyNPC.name);
								break;
							}
							commitPseudoCurrentState(clickedTileEntity.tileX, clickedTileEntity.tileY);
						}
					},{
						label: "Do Nothing",
						enabled: true,
						subscript: "Moves to the selected position, then ends your turn.",
						onClick: function() {
							actionMenuActive = false;
							commitPseudoCurrentState(clickedTileEntity.tileX, clickedTileEntity.tileY);
						}
					},{
						label: "Cancel",
						enabled: true,
						subscript: "Allows you to select a new tile to move to",
						onClick: function() {
							actionMenuActive = false;
							versions.reset();
						}
					}],
				});
				sepiaEntity.setVisible(false);
			}
		});
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			hero = Crafty.e('2D, Canvas, Character').
				Character(parsedMapData.heightMap, worldToPixel, HERO_START.x, HERO_START.y, 'hero');
			var i = 0;
			for (i = 0; i < parsedMapData.objects.length; i++) {
				var object = parsedMapData.objects[i];
				if (object.type == 'npc') {
					Crafty.e('2D, Canvas, Character').
						Character(parsedMapData.heightMap, worldToPixel, object.tileX, object.tileY, object.properties.sprite);
				} else {
					console.warn('Unknown object type: ', object.type);
				}
			}
		})();
		(function() {
			//Handle HUD
			utils.addMusicControlEntity(Crafty);
		})();
		(function() {
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
		versions.bind("Checkout", function(rev) {
			var revData = rev.data;
			var tileX = revData.hero.x;
			var tileY = revData.hero.y;
			hasNewspapers = revData.hasNewspapers;
			hero.setPos(tileX, tileY, parsedMapData.heightMap[tileX+","+tileY].surfaceZ);
			hero.setWalkTarget(tileX, tileY);
			var isLeaf = rev.childRevIds.length == 0;
			sepiaEntity.setVisible(! isLeaf);
		});
		Crafty.viewport.clampToEntities = false;
		utils.centerViewportOn(Crafty, hero, 1);
		mouselook.start();
	});
	return undefined;
});
