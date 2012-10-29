require.config({
	paths : {
		Crafty : '../libs/crafty_0.5.2/crafty'
	}
});

define([ 'config', 'Crafty', 'scenes/Loading', 'scenes/IsoTest' ], function(config) {
	Crafty.init(config.viewport.width, config.viewport.height);
	// Start in loading scene
	//Crafty.scene('Loading');
	Crafty.scene('IsoTest');
});