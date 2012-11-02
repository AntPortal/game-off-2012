define([
		'config',
		'maps/test-multi-tileset-two-baseheights.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
		'components/VersionHistory'
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('IsoTest', function() {
		var gameState = {
			hero: {position: [0, 0]}
		};
		var versions = Crafty.e('VersionHistory');
		versions.commit(gameState);

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
				versions.commit({hero: {position: [tileEntity.tileX, tileEntity.tileY]}});
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
		Crafty.viewport.clampToEntities = false;
		mouselook.start();
	});
	return undefined;
});
