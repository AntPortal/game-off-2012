require.config({
	paths : {
		Crafty : '../libs/crafty_0.5.2/crafty'
	}
});

define([ 'config', 'Crafty' ], function(config) {
	Crafty.init(config.viewport.width, config.viewport.height);
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
	Crafty.scene('Title', function() {
		Crafty.audio.play('music/title');
		Crafty.e('').bind('EnterFrame', function() {
			var curSec = Crafty.audio.getTime('music/title');
			var bpm = 105;
			var offset = -1.231;
			var curBeat = (curSec + offset) / 60 * bpm;
			// NOTE: The tempo isn't perfectly steady in the song, so these figures are approximate.
			// Beats 1 to to 5 is the heavy guitar intro, with a accented snare on 4.4
			// Beats 5 to 9 is the second intro.
			// Beats 9 to 13 is verse 1.
			// Beats 13 to 17 is verse 2.
			// Beats 17 to 21 is pre-chorus, with spring SFX at 18.3
			// Beats 21 to 29 is the chorus, with stutters at 21.2.4, 21.4.4, 25.2.4, 25.4.4
			// Beats 29 to 33 is the second intro again.
			// Beats 33 to 37 is verse 3
			// Beats 37 to 41 is verse 4
			// Beats 41 to 43 is the "quiet part" with bells.
			// Beats 43 to 45 is the pre-chorus
			// Beats 45 to 53 is the chorus, with stutters at 45.2.4, 45.4.4, 49.2.4, 49.4.4
			// Beats 53 to 57 is the second intro again.
			// Beats 57 to 61 and 61 to 64 is the ending.
		});
	});
	Crafty.scene('IsoTest', function() {
		var x, y, tileType;
		Crafty.sprite(64, 'assets/tiles/iso-64x64-outside.png', {
			grass1 : [ 0, 0 ],
			grass2 : [ 1, 0 ],
			grass3 : [ 2, 0 ],
			grass4 : [ 3, 0 ],
			grass5 : [ 4, 0 ],
			grass6 : [ 5, 0 ],
			grass7 : [ 6, 0 ],
			grass8 : [ 0, 1 ],
			grass9 : [ 1, 1 ],
			grass10 : [ 2, 1 ],
			grass11 : [ 3, 1 ],
			grass12 : [ 4, 1 ],
			grass13 : [ 5, 1 ],
			grass14 : [ 6, 1 ],
			grass15 : [ 7, 1 ],
			grass16 : [ 0, 2 ],
			grass17 : [ 1, 2 ],
			grass18 : [ 2, 2 ],
			grass19 : [ 3, 2 ],
		});
		var map = new Array();
		for (y = 0; y < 35; y++) {
			map[y] = new Array();
			for (x = 0; x < 12; x++) {
				tileType = "grass" + Crafty.math.randomInt(1, 19);
				map[y][x] = tileType;
			}
		}
		var iso = Crafty.isometric.size(64);
		for (y = 0; y < map.length; y++) {
			var row = map[y];
			for (x = 0; x < row.length; x++) {
				tileType = row[x];
				var entity = Crafty.e('2D, Canvas, Mouse, ' + tileType + ', Tint').attr({
					w : 64,
					h : 64
				});
				entity.bind('MouseOver', function(event) {
					this.tint("#0000FF", 0.25);
				});
				entity.bind('MouseOut', function(event) {
					this.tint("#000000", 0);
				});
				iso.place(x, y, 0, entity);
			}
		}
	});
	// Start in loading scene
	// Crafty.scene('Loading');
	Crafty.scene('IsoTest');
});