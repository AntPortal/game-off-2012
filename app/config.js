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
		/*
		 * The save game object has the following structure:
		 * {
		 *   name: "NebuPookins",
		 *   shortName: "Nebu"
		 *   level: 1,
		 * }
		 * 
		 * name is the github account name (alphanumeric and dash, less than 40 char, can't start with dash)
		 * shortname is a shortened version of the github name.
		 * level is an integer, with a minimum value of 1. It indicates the level you should load when the savegame is loaded.
		 * 
		 * Easiest way to detect that a save slot is empty is to read the level field, and if it's "undefined", it means
		 * the slot is empty.
		 */
		saveGames: [{
			name: "Nebu", //TODO Test data, delete me in final build of the game.
			level: 1
		},{},{}], //TODO: Load save games from cookies/local store/whatever
		curSaveSlot: 0, //must be a value between 0 and 2 inclusive
		getCurLevel: function() {
			return this.saveGames[this.curSaveSlot].level;
		},
		setCurLevel: function(newLevel) {
			this.saveGames[this.curSaveSlot].level = newLevel;
			this.serialize();
		},
		getCurName: function() {
			return this.saveGames[this.curSaveSlot].name;
		},
		setCurName: function(newName) {
			this.saveGames[this.curSaveSlot].name = newName;
			this.serialize();
		},
		/**
		 * Returns the name no longer than 6 chars long.
		 */
		getCurShortName: function() {
			return this.saveGames[this.curSaveSlot].shortName;
		},
		/**
		 * Returns the name no longer than 6 chars long.
		 */
		setCurShortName: function(newShortName) {
			this.saveGames[this.curSaveSlot].shortName = newShortName;
			this.serialize();
		},
		serialize: function() {
			//TODO: Store the data in saveGames to local store or cookies or whatever.
		}
	};
});