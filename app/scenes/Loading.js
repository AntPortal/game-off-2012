define([
		'config',
		'maps/level1-intro.json', //Any arbitrary level for tileset data
		'Crafty',
		'scenes/Title',
		'scenes/level1-intro'
], function(config, mapData) {
	function loadAntifareaCharacterSprite(id, url) {
		var w = 16*2;
		var h = 18*2;
		var spriteParam = {};
		spriteParam[id + 'North'] = [0, h*0, w, h];
		spriteParam[id + 'East'] = [0, h*1, w, h];
		spriteParam[id + 'South'] = [0, h*2, w, h];
		spriteParam[id + 'West'] = [0, h*3, w, h];
		Crafty.sprite(url, spriteParam);
	}
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
		for (key in config.music) {
			var ogg = config.music[key].prefix + '.ogg';
			var mp3 = config.music[key].prefix + '.mp3';
			Crafty.audio.add(key, [ ogg, mp3 ]);
		}
		function makeSleepUntilFontsLoaded(doneCallback) {
			var func = function() {
				if (fontsLoaded) {
					doneCallback();
				} else {
					window.setTimeout(func, 500);
				}
			};
			return func;
		}
		Crafty.load([ //Try to keep alphabetical
				'assets/faces/faces1.png',
				'assets/sprites/charsets_warrior.png',
				'assets/sprites/mom.png',
				'assets/tiles/iso-64x64-building_2.png',
				'assets/tiles/iso-64x64-outside.png',
				'assets/ui/comment_new.gif', 'assets/ui/dialog.blue.png',
				'assets/ui/music.png',
		], function() {
			makeSleepUntilFontsLoaded(function() {
				// TODO load other assets
				loadAntifareaCharacterSprite('hero', 'assets/sprites/charsets_warrior.png');
				loadAntifareaCharacterSprite('mom', 'assets/sprites/mom.png');
				// Load dialog box
				Crafty.sprite(16, 'assets/ui/dialog.blue.png', {
					dialog7 : [ 0, 0 ], dialog8 : [ 1, 0 ], dialog9 : [ 2, 0 ],
					dialog4 : [ 0, 1 ], dialog5 : [ 1, 1 ], dialog6 : [ 2, 1 ],
					dialog1 : [ 0, 2 ], dialog2 : [ 1, 2 ], dialog3 : [ 2, 2 ],
				});
				Crafty.sprite(16, 'assets/ui/comment_new.gif', {
					dialogMore : [ 0, 0 ]
				});
				(function() {
					//Loads the faces as face_warriorM, face_warriorF, face_mageM, etc.
					var temp = ['warrior', 'mage', 'healer', 'ninja', 'ranger', 'villager'];
					var i;
					var spriteParam = {};
					for (i = 0; i < temp.length; i++) {
						spriteParam['face_'+temp[i]+'M'] = [i, 0];
						spriteParam['face_'+temp[i]+'F'] = [i, 1];
					}
					Crafty.sprite(48, 'assets/faces/faces1.png', spriteParam);
				})();
				// When done loading, transition to Title scene.
				// Crafty.scene('Title');
				Crafty.scene('level1-intro'); //TODO
			})();
		});
	});
	return undefined;
});