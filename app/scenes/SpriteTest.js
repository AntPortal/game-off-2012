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
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('SpriteTest', function() {
		var directions = ['N', 'E', 'S', 'W'];
		var i, j;
		for (i = 0; i < directions.length; i++) {
			for (j = 0; j < 3; j++) {
				var direction = directions[i];
				var name = 'sprite_hero_'+direction+j;
				Crafty.e('2D, Canvas').
					addComponent(name).
					attr({
						x: i * 128,
						y: j * 64,
					});
				Crafty.e('2D, Canvas, BetterText').
					attr({
						text: name,
						x: i * 128,
						y: j * 64,
						fontSize: '12px',
						fontFamily: 'Helvetica',
						textColor: 'white',
						w: 128,
						h: 64,
					});
			}
		}
	});
	return undefined;
});
