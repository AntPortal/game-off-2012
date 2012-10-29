define([ 'config', 'Crafty', 'scenes/Title' ], function(config) {
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
		Crafty.audio.add('music/title', [ 'assets/music/peekaboo.ogg',
				'assets/music/peekaboo.mp3' ]);
		Crafty.load([ 'assets/tiles/iso-64x64-building_2.png',
				'assets/tiles/iso-64x64-outside.png' ], function() {
			// TODO load other assets
			// When done loading, transition to Title scene.
			Crafty.scene('Title');
		});
	});
	return undefined;
});