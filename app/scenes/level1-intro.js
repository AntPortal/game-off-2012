define([
		'config',
		'maps/level1-intro.json',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/Character',
		'components/Dialog',
		'components/ScriptRunner',
		'scenes/IsoTest', //TODO change to level1
	], function(config, mapData, utils) {
	Crafty.scene('level1-intro', function() {
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			//Does nothing
		});
		//Add characters
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var hero = Crafty.e('2D, Canvas, Character, heroSouth').Character(heightMap, worldToPixel, 3, 0);
		hero.visible = false;
		var mom = Crafty.e('2D, Canvas, Character, momSouth').Character(heightMap, worldToPixel, 1, 0);
		var script = [
			{ 
				action: 'fade',
				params: {
					color: '#000000',
					alpha: 1.0, 
				},
				duration: 1
			},
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: 70,
					msg: config.getCurShortName() + "...",
					showMore: true,
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: 70,
					msg: config.getCurShortName() + "!",
					showMore: true,
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: 70,
					msg: "Good morning, "+config.getCurShortName() +"!",
					showMore: true,
				}
			},
			{ action: 'PACADOC' },
			{ action: 'playMusic', song: 'music/town' },
			{ 
				action: 'fade',
				params: {
					color: '#000000',
					alpha: 0.0, 
				},
				duration: 100
			},
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: 70,
					msg: "Mom: Come on, sleepy head! Get up!",
					showMore: true,
					face: 'face_villagerF',
				}
			},
			{ action: 'PACADOC' },
			{ action: 'arbitraryCode', code: function(curState, callback) {
				hero.visible = true;
				hero.setWalkTarget(3,1);
				callback(curState + 1);
			}},
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: 70,
					msg: [
						"Mom: You were so excited about the Millenial",
						"Fair that you didn't sleep well, did you...?",
					],
					showMore: true,
					face: 'face_villagerF',
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: 70,
					msg: [
						"Mom: I want you to behave yourself today!",
					],
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
	});
	return undefined;
});
