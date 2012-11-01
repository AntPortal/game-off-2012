define([
		'config',
		'maps/level1-intro.json',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/Character',
		'components/Dialog',
		'components/ScriptRunner',
	], function(config, mapData, utils) {
	Crafty.scene('level1-intro', function() {
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			//Does nothing
		});
		//Add characters
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var hero = Crafty.e('2D, Canvas, Character, heroSouth').Character(heightMap, worldToPixel, 3, 0);
		var mom = Crafty.e('2D, Canvas, Character, momSouth').Character(heightMap, worldToPixel, 1, 0);
		var script = [
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 320,
					h: 70,
					msg: "[Name]...",
					showMore: true,
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 320,
					h: 70,
					msg: "[Name]!",
					showMore: true,
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 320,
					h: 70,
					msg: "Good morning, [Name]!",
					showMore: true,
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 320,
					h: 70,
					msg: "Mom: Come on, sleepy head! Get up!",
					showMore: true,
					face: 'face_villagerF',
				}
			},
			{ action: 'PACADOC' },
			{ action: 'loadScene', scene: 'IsoTest' },
		];
		Crafty.e('2D, ScriptRunner').ScriptRunner(script).run();
		Crafty.viewport.clampToEntities = false;
		Crafty.viewport.y = config.viewport.height / 2;
		Crafty.audio.play('music/town', -1, utils.effectiveVolume('music/town'));
	});
	return undefined;
});
