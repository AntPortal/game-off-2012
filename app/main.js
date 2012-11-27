require.config({
	paths : {
		Crafty : '../libs/crafty_0.5.2/crafty',
		underscore: '../libs/underscore_1.4.2/underscore',
		maps: '../assets/maps'
	}
});

define([
	'config',
	'Crafty',
	'scenes/Loading',
	'trapBackspace',
], function(config) {
	console.log('Game starting...');
	if (navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i)) {
		alert("This game requires iOS 6, but you are currently runnign iOS 5. Please upgrade your firmware to play this game.");
	}
	Crafty.init(config.viewport.width, config.viewport.height);
	// Start in loading scene
	Crafty.scene('Loading');
});
