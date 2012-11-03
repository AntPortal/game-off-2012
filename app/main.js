require.config({
	paths : {
		Crafty : '../libs/crafty_0.5.2/crafty',
		maps: '../assets/maps'
	}
});

define([
	'config',
	'Crafty',
	'scenes/Loading',
], function(config) {
	Crafty.init(config.viewport.width, config.viewport.height);
	// Start in loading scene
	Crafty.scene('Loading');
});