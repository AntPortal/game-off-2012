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
		'components/Rotates',
		'components/Gitk'
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('IsoTest', function() {
		var versions = Crafty.e('VersionHistory');

		var hero; //entity global to this scene
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			console.log('Clicked on');
			console.log({
				x: tileEntity.tileX,
				y: tileEntity.tileY,
				z: tileEntity.surfaceZ
			});
			if (hero) {
				hero.setWalkTarget(tileEntity.tileX, tileEntity.tileY);
				versions.commit({
					hero: {x: tileEntity.tileX, y: tileEntity.tileY}
				});
			}
		});
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			hero = Crafty.e('2D, Canvas, Character, heroSouth').Character(heightMap, worldToPixel, 0, 0);
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
		/* Commit the initial game state. This needs to be done after the event handler above is installed,
		 * so that the handler will pick up this initial commit. */
		versions.commit({
			hero: {x: hero.tileX, y: hero.tileY}
		});
		versions.bind("Checkout", function(rev) {
			var revData = rev.data;
			var tileX = revData.hero.x;
			var tileY = revData.hero.y;
			hero.setPos(tileX, tileY, heightMap[tileX+","+tileY].surfaceZ);
			hero.setWalkTarget(tileX, tileY);
		});
		Crafty.viewport.clampToEntities = false;
		mouselook.start();
	});
	return undefined;
});
