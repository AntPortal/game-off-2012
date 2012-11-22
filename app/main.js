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
	Crafty.init(config.viewport.width, config.viewport.height);
	// Start in loading scene
	Crafty.scene('Loading');
});
