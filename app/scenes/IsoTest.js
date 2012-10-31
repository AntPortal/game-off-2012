define([
		'config',
		'maps/test-multi-tileset-two-baseheights.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('IsoTest', function() {
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
		Crafty.audio.play('music/town', -1, utils.effectiveVolume('music/town'));
		mouselook.start();
	});
	return undefined;
});
