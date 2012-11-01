define([
		'config',
		'maps/level1-intro.json',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/Character',
		'components/Dialog',
	], function(config, mapData, utils) {
	Crafty.scene('level1-intro', function() {
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			//Does nothing
		});
		//Add characters
		var mouseListener = Crafty.e('2D, Mouse').attr({
			x: 0, y: 0, w: config.viewport.width, h: config.viewport.height, clicked: false
		}).bind('Click', function() {
			this.clicked = true;
		});
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var hero = Crafty.e('2D, Canvas, Character, heroSouth').Character(heightMap, worldToPixel, 3, 0);
		var mom = Crafty.e('2D, Canvas, Character, momSouth').Character(heightMap, worldToPixel, 1, 0);
		(function() {
			//Handle HUD
			utils.addMusicControlEntity(Crafty);
			var dialog1 = Crafty.e('2D, Canvas, Dialog').Dialog({
				x: 150,
				y: 100,
				w: 320,
				h: 70,
				msg: "Mom: [Name], wake up!",
				showMore: true,
				face: 'face_villagerF'
			});
			var dialog2 = Crafty.e('2D, Canvas, Dialog').Dialog({
				x: 150,
				y: 100,
				w: 320,
				h: 70,
				msg: "[Name]: Mfhg... Five more minutes...",
				showMore: true,
				face: 'face_warriorM'
			});
			dialog2.visible = false;
		})();
		Crafty.viewport.clampToEntities = false;
		Crafty.viewport.y = config.viewport.height / 2;
		Crafty.audio.play('music/town', -1, utils.effectiveVolume('music/town'));
	});
	return undefined;
});
