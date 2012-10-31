define(function() {
	//TODO: Store the musicVolume in the preference, and reload it as needed.
	return {
		viewport : {
			width : 710,
			height : 580
		},
		TILE_IMAGE_SIZE : 64, // A baked in assumption we're making
		areaMaps : {
			'default' : [ [ 32, 32 ], [ 64, 48 ], [ 32, 64 ], [ 0, 48 ] ],
			'cube' : [ [ 32, 0 ], [ 64, 16 ], [ 32, 32 ], [ 0, 16 ] ],
		},
		debug : true,
		musicVolume : 1.0,
		music : {
			'music/title' : {
				prefix : 'assets/music/peekaboo',
				volume: 0.5,
			},
			'music/town' : {
				prefix : 'assets/music/292 - Touch the Sky',
				volume: 1.0,
			},
		},
	};
});