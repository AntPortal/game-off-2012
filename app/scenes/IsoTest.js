define([
		'config',
		'maps/test-multi-tileset-two-baseheights.json',
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
	var HERO_START = {x: 0, y: 0};
	Crafty.scene('IsoTest', function() {
		var versions = Crafty.e('VersionHistory');
		var sepiaEntity = Crafty.e('Sepia').
			Sepia('cr-stage', 0, 0, config.zOffset.gitk - 1, config.viewport.width, config.viewport.height);
		var hero; //entity global to this scene
		var tileProperties = utils.loadTileset(mapData);
		var actionMenuActive = false;
		function commitPseudoCurrentState(heroX, heroY) {
			versions.commit({
				hero: {
					x: heroX,
					y: heroY
				}
			});
		}
		var parsedMapData = utils.loadMap(mapData, tileProperties, function(clickedTileEntity) {
			if (hero && !actionMenuActive) {
				hero.setWalkTarget(clickedTileEntity.tileX, clickedTileEntity.tileY);
				actionMenuActive = true;
				Crafty.e('2D, Canvas, ActionMenu').attr({
					x: 0, //TODO
					y: 0, //TODO
					w: 300,
					h: 150,
					actions: [{
						label: 'Deliver Newspaper',
						enabled: false,
						subscript: 'deliver newspaper subtext',
						onClick: function() {
							console.log('Chose to deliver newspaper.');
							actionMenuActive = false;
							//TODO
							commitPseudoCurrentState(clickedTileEntity.tileX, clickedTileEntity.tileY);
						}
					},{
						label: 'Do Nothing',
						enabled: true,
						subscript: 'Move to the selected position, then ends your turn.',
						onClick: function() {
							actionMenuActive = false;
							commitPseudoCurrentState(clickedTileEntity.tileX, clickedTileEntity.tileY);
						}
					},{
						label: 'Cancel',
						enabled: true,
						subscript: 'Allows you to select a new tile to move to',
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
			hero.setPos(tileX, tileY, parsedMapData.heightMap[tileX+","+tileY].surfaceZ);
			hero.setWalkTarget(tileX, tileY);
			var isLeaf = rev.childRevIds.length == 0;
			sepiaEntity.setVisible(! isLeaf);
		});
		Crafty.viewport.clampToEntities = false;
		mouselook.start();
	});
	return undefined;
});
