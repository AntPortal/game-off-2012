define([
		'config',
		'maps/level1-intro.json', //Any arbitrary level for tileset data
		'Crafty',
		'scenes/Title',
		'scenes/level1-intro'
	], function(config, mapData) {
	Crafty.scene('Loading', function() {
		Crafty.background('#000');
		Crafty.e('2D, DOM, Text').attr({
			w : config.viewport.width,
			x : 0,
			y : config.viewport.height / 2
		}).text("Loading...").css({
			'text-align' : 'center',
			'color' : 'white'
		});
		var music = {
			'music/title': 'assets/music/peekaboo',
			'music/town' : 'assets/music/292 - Touch the Sky',
		};
		for (key in music) {
			var ogg = music[key] + '.ogg';
			var mp3 = music[key] + '.mp3';
			Crafty.audio.add(key, [ ogg, mp3 ]);
		}
		Crafty.load([
				'assets/tiles/iso-64x64-building_2.png',
				'assets/tiles/iso-64x64-outside.png',
				'assets/sprites/charsets_warrior.png'
			], function() {
			// TODO load other assets
			(function() {
				//Defines components for hero sprite
				var w = 16*2;
				var h = 18*2;
				Crafty.sprite("assets/sprites/charsets_warrior.png", {
					heroNorth: [0, 0, w, h],
					heroEast: [0, h, w, h],
					heroSouth: [0, h*2, w, h],
					heroWest: [0, h*3, w, h]
				});
			})();
			// When done loading, transition to Title scene.
			// Crafty.scene('Title');
			Crafty.scene('IsoTest'); //TODO
		});
	});
	return undefined;
});