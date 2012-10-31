define([ 'config', 'Crafty' ], function(config) {
	Crafty.scene('Title', function() {
		Crafty.audio.play('music/title', 1, 0.5);
		var clickToSkipText = Crafty.e('2D, DOM, Text');
		clickToSkipText.attr({
			w : config.viewport.width,
			x : 0,
			y : config.viewport.height * 0.9
		}).text("Click to Skip").css({
			'text-align' : 'center',
			'color' : 'white'
		});
		var clickCapture = Crafty.e('2D, Canvas, Mouse');
		clickCapture.attr({
			x: 0,
			y: 0,
			w : config.viewport.width,
			h : config.viewport.height,
			clicked: false
		});
		clickCapture.bind('Click', function() {
			this.clicked = true;
		});
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
			clickToSkipText.visible = Math.floor(curBeat) % 2 == 0;
			if (curBeat > 64 * 4 || clickCapture.clicked) {
				Crafty.audio.stop('music/title');
				//Crafty.scene('level1-intro'); //TODO
				Crafty.scene('IsoTest');
				this.destroy();
			}
		});
	});
	return undefined;
});