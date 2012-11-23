define([
	'config',
	'Crafty',
	'scenes/level1',
	'components/BetterText'
], function(config) {
	Crafty.scene('intro', function() {
		Crafty.e('2D, DOM, BetterText').attr({
			x: 50,
			y: 50,
			w: config.viewport.width - 100,
			h: config.viewport.height - 100,
			fontFamily: config.dialogFont.family,
			fontSize: config.dialogFont.size + 'px',
			text: "<p>In 1434, long before Charles Babbage had invented the programmable computer, a wise mage by the name of Linus Isopaa invented git, a powerful set of magic spells which allowed the people of his village to collaboratively create, edit, and safeguard all of their writings.</p> <p>For 6 years, they flourished and Linus gained a vast number of apprentices.</p> <p>However, the process of learning the magic words took time, and in 1440, Johannes Gutenberg invented the printing press.</p> <p>As a result, very few people, to this day, remember the wonders of using git magic...</p>"
		});
		Crafty.e('2D, DOM, BetterText').attr({
			x: 0,
			y: config.viewport.height - 40,
			w: config.viewport.width,
			h: 40,
			fontFamily: config.dialogFont.family,
			fontSize: Math.round(config.dialogFont.size * 0.75) + 'px',
			text: "<p style='text-align: center'>Click (or Tap) to continue</p>"
		});
		Crafty.e('2D, Mouse').attr({
			x: 0,
			y: 0,
			w: config.viewport.width,
			h: config.viewport.height
		}).bind("Click", function() {
			Crafty.scene('level1');
		});
	});
});
