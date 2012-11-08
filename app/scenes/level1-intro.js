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
		var nextScene = 'IsoTest'; //TODO change to level1
		var tileProperties = utils.loadTileset(mapData);
		var parsedMapData = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			//Does nothing
		});

		// Add "skip intro" button
		var skipIntro = Crafty.e('2D, Canvas, Mouse, BetterText, ViewportRelative');
		skipIntro.attr({
				text: "Skip",
				textColor: 'white',
				fontFamily: 'Patrick Hand',
				fontSize: '16px',
				x: 8,
				y: config.viewport.height - 20 - 8,
				w: 100,
				h: 20,
				/* The +1 here puts this above the overlays that the script runner uses
				 * for fades and PACADOC instructions. */
				z: config.zOffset.meta + 1
		});
		skipIntro.bind('Click', function() {
			Crafty.scene(nextScene);
		});

		//Add characters
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var hero = Crafty.e('2D, Canvas, Character').Character(parsedMapData.heightMap, worldToPixel, 3, 0, 'hero');
		hero.visible = false;
		var mom = Crafty.e('2D, Canvas, Character').Character(parsedMapData.heightMap, worldToPixel, 1, 0, 'mom');
		var DIALOG_HEIGHT = 90;
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
					h: DIALOG_HEIGHT,
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
					h: DIALOG_HEIGHT,
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
					h: DIALOG_HEIGHT,
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
					h: DIALOG_HEIGHT,
					msg: "Mom: Come on, sleepy head! Get up!",
					showMore: true,
					face: 'face_townfolkF',
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
					h: DIALOG_HEIGHT,
					msg: [
						"Mom: You were so excited about the Millenial",
						"Fair that you didn't sleep well, did you...?",
					],
					showMore: true,
					face: 'face_townfolkF',
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: DIALOG_HEIGHT,
					msg: [
						"Mom: By the way, those two friends of yours came over",
						"earlier asking if you were ready to go yet, but I had",
						"to turn them away since you were still sleeping.",
					],
					showMore: true,
					face: 'face_townfolkF',
				}
			},
			{ action: 'PACADOC' },
			{ action: 'arbitraryCode', code: function(curState, callback) {
				hero.setWalkTarget(0,2);
				mom.setWalkTarget(1,2);
				callback(curState + 1);
			}},
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: DIALOG_HEIGHT,
					msg: [
						"Mom: Hold it! Before you go running off with your",
						"friends, remember that you have to deliver your",
						"newspapers!",
					],
					showMore: true,
					face: 'face_townfolkF',
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: DIALOG_HEIGHT,
					msg: [
						"Mom: I want you to behave yourself today! Promise me",
						"you won't go to the fair until you've delivered all",
						"the papers.",
					],
					showMore: true,
					face: 'face_townfolkF',
				}
			},
			{ action: 'PACADOC' },
			{
				action: 'dialog',
				params: {
					x: 150,
					y: 100,
					w: 400,
					h: DIALOG_HEIGHT,
					msg: [
						"Mom: Let's get moving now! Don't forget, people are",
						"depending on you. Run along now, and be back before",
						"dinner.",
					],
					showMore: true,
					face: 'face_townfolkF',
				}
			},
			{ action: 'PACADOC' },
			{ action: 'loadScene', scene: nextScene},
		];
		Crafty.e('2D, ScriptRunner').ScriptRunner(script).run();
		Crafty.viewport.clampToEntities = false;
		Crafty.viewport.y = config.viewport.height / 2;
	});
	return undefined;
});
