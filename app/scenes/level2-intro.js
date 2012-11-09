define([
		'config',
		'maps/level2.json',
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
	var HERO_START = {x: 9, y: 5};
	Crafty.scene('level2-intro', function() {
		var versions = Crafty.e('VersionHistory').VersionHistory(5);
		var sepiaEntity = Crafty.e('Sepia').
			Sepia('cr-stage', 0, 0, config.zOffset.gitk - 1, config.viewport.width, config.viewport.height);
		var tileProperties = utils.loadTileset(mapData);
		var actionMenuActive = false;
		function commitPseudoCurrentState(heroX, heroY) {
			versions.commit({
				hero: {
					x: heroX,
					y: heroY
				}
			});
			//TODO
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
				var actions = [];
				//TODO
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
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var pathFinder = utils.makePathFinder(parsedMapData);
		var hero = Crafty.e('2D, Canvas, Character').
			Character(parsedMapData.heightMap, worldToPixel, pathFinder, HERO_START.x, HERO_START.y, 'hero');
		(function() {
			//Add characters
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
			//TODO
			hero.setPos(tileX, tileY, parsedMapData.heightMap[tileX+","+tileY].surfaceZ);
			hero.setWalkTarget(tileX, tileY);
			var isLeaf = rev.childRevIds.length == 0;
			sepiaEntity.setVisible(! isLeaf);
		});
		Crafty.viewport.clampToEntities = false;
		utils.centerViewportOn(Crafty, hero, 1);
		mouselook.start();
		utils.ensureMusicIsPlaying('music/town'); //TODO
	});
	return undefined;
});
