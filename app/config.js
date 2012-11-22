define([], function() {
	//TODO: Store the musicVolume in the preference, and reload it as needed.
	var configObj = {
		viewport : {
			width : 710,
			height : 580
		},
		TILE_IMAGE_SIZE : 64, // A baked in assumption we're making
		DEFAULT_GITHUB_AVATAR_URL: 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png',
		areaMaps : {
			'default' : [ [ 32, 32 ], [ 64, 48 ], [ 32, 64 ], [ 0, 48 ] ],
			'cube' : [ [ 32, 0 ], [ 64, 16 ], [ 32, 32 ], [ 0, 16 ] ],
			'slopeE' : [ [ 32, 32 ], [ 48, 16 ], [ 32, 64 ], [ 0, 48 ] ],
			'slopeNE' : [ [ 32, 0 ], [ 64, 16 ], [ 32, 64 ], [ 0, 48 ] ]
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
		/**
		 * 0000..0999: Game objects (e.g. tiles, NPCs, etc.)
		 * 1000..1999: gitk UI
		 * 2000..2999: dialog UI
		 * 3000..3999: meta UI (e.g. volume mute)
		 */
		zOffset : {
			'game': 0,
			'gitk': 1000,
			'dialog': 2000,
			'meta': 3000,
		},
		dialogFont: {
			family: 'Patrick Hand',
			size: '24px'
		}
	};
	return configObj;
});
