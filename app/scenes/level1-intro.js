define([
		'config',
		'maps/level1-intro.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('level1-intro', function() {
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			//Does nothing
		});
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			var hero = Crafty.e('2D, Canvas, Character, heroSouth').Character(heightMap, worldToPixel, 0, 0);
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
