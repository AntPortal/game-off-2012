define([
		'config',
		'utils',
		'Crafty',
		'scenes/title'
	], function(config, utils) {
	Crafty.scene('Title-intro', function() {
		Crafty.audio.play('music/title', 1, utils.effectiveVolume('music/title'));
		var clickToSkipText = Crafty.e('2D, DOM, Text');
		clickToSkipText.attr({
			w : config.viewport.width,
			x : 0,
			y : config.viewport.height * 0.9,
			z : config.zOffset.meta
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
		var cues = [];
		(function() {
			var bgCueList = [];
			var bgBlue = null;
			bgCueList.push({minBar: Number.NEGATIVE_INFINITY, action: function(curBar) {
				//Does nothing
			}});
			bgCueList.push({minBar: 1.18, action: function(curBar) {
				if (bgBlue == null) {
					bgBlue = Crafty.e('2D, DOM, ui_bg_blue').origin('center').attr({x: -101, y: -171, z: 0});
				}
				bgBlue.rotation = Crafty.math.lerp(-15, -45, curBar - 1.18);;
			}});
			bgCueList.push({minBar: 2.18, action: function(curBar) {
				bgBlue.rotation = Crafty.math.lerp(15, 45, curBar - 2.18);;
			}});
			bgCueList.push({minBar: 3.18, action: function(curBar) {
				bgBlue.rotation = Crafty.math.lerp(-15, -45, curBar - 3.18);;
			}});
			bgCueList.push({minBar: 4.18, action: function(curBar) {
				bgBlue.rotation = 0;
			}});
			bgCueList.push({minBar: 5, action: function(curBar) {
				bgBlue.visible = false;
			}});
			cues.push(bgCueList);
		})();
		(function() {
			var title = utils.createTitleEntity(Crafty);
			title.visible = false;
			var titleLandingY = config.viewport.height * 0.5;
			var titleCueList = [];
			titleCueList.push({minBar: Number.NEGATIVE_INFINITY, action: function(curBar) {
				title.css({'display':'none'});
			}});
			titleCueList.push({minBar: 4.87, action: function(curBar) {
				title.css({'display':'block'});
				title.y = Crafty.math.lerp(-140, titleLandingY, (curBar - 4.87) / 0.13);
			}});
			titleCueList.push({minBar: 5, action: function(curBar) {
				title.css({'display':'block'});
				title.y = titleLandingY;
			}});
			titleCueList.push({minBar: 9.25, action: function(curBar) {
				title.css({'display':'none'});
			}});
			titleCueList.push({minBar: 29.25, action: function(curBar) { //29 too small, 29.5 too late
				title.css({'display':'block'});
			}});
			titleCueList.push({minBar: 33.25, action: function(curBar) { //33 too early
				title.css({'display':'none'});
			}});
			titleCueList.push({minBar: 53.25, action: function(curBar) { //53 is too early, 53.5 too late
				title.css({'display':'block'});
			}});
			titleCueList.push({minBar: 57.25, action: function(curBar) { //57 is too early, 57.5 too late
				title.css({'display':'none'});
			}});
			cues.push(titleCueList);
		})();
		
		
		Crafty.e('').bind('EnterFrame', function() {
			var curSec = Crafty.audio.getTime('music/title');
			var bpm = 105;
			var offset = -1.231;
			var curBeat = 1 + (curSec + offset) / 60 * bpm;
			var curBar = 1 + curBeat / 4;
			// NOTE: The tempo isn't perfectly steady in the song, so these figures are approximate.
			// Bars 1 to to 5 is the heavy guitar intro, with a accented snare on 4.4
			// Bar 1: Pan some enemies from the left.
			// Bar 2: Pan some enemies from the right.
			// Bar 3: Pan some enemies from the top.
			// Bar 4: Pan two armies about to fight, on 4.4 have the shadow lord drop in and the screen flash.
			// Bars 5 to 9 is the second intro.
			// Bars 9 to 13 is verse 1.
			// Bars 13 to 17 is verse 2.
			// Bars 17 to 21 is pre-chorus, with spring SFX at 18.3
			// Bars 21 to 29 is the chorus, with stutters at 21.2.4, 21.4.4, 25.2.4, 25.4.4
			// Bars 29 to 33 is the second intro again.
			// Bars 33 to 37 is verse 3
			// Bars 37 to 41 is verse 4
			// Bars 41 to 43 is the "quiet part" with bells.
			// Bars 43 to 45 is the pre-chorus
			// Bars 45 to 53 is the chorus, with stutters at 45.2.4, 45.4.4, 49.2.4, 49.4.4
			// Bars 53 to 57 is the second intro again.
			// Bars 57 to 61 and 61 to 64 is the ending.
			for (key in cues) {
				var cueList = cues[key];
				utils.binarySearch(cueList, 'minBar', curBar).action(curBar);
			}
			clickToSkipText.visible = Math.floor(curBeat) % 2 == 0;
			//console.log(curBar);
			if (curBar > 66 || clickCapture.clicked) {
				Crafty.audio.stop('music/title');
				Crafty.scene('title'); //TODO
				this.destroy();
			}
		});
	});
	return undefined;
});