define([
		'config'
],
function(config) {
	function makeWorldToPixelConverter(mapTileWidth, mapTileHeight) {
		return function(worldX, worldY, worldZ) {
			return {
				pixelX : ((config.viewport.width - mapTileWidth) / 2)
						+ ((worldX - worldY + 1) * mapTileWidth / 2),
				pixelY : ((worldX + worldY) * mapTileHeight / 2)
						- ((worldZ - 1) * mapTileHeight)
			};
		};
	}
	/**
	 * Loads a tileset from a map (i.e. creates or updates the
	 * appropriate components), and returns a tileproperties object,
	 * which is a map from global tile id, e.g. "55", to their
	 * properties, e.g. {"noStand": "true"}
	 */
	function loadTileset(mapData) {
		var tileProperties = {};
		var tileX, tileY, i;
		for (i = 0; i < mapData.tilesets.length; i++) {
			var tileset = mapData.tilesets[i];
			if (tileset.tileheight != config.TILE_IMAGE_SIZE) {
				console.warn("tileheight is not "
						+ config.TILE_IMAGE_SIZE + " for "
						+ tileset.name);
			}
			if (tileset.tilewidth != config.TILE_IMAGE_SIZE) {
				console.warn("tilewidth is not "
						+ config.TILE_IMAGE_SIZE + " for "
						+ tileset.name);
			}
			// TODO: margin and spacing are ignored.
			var tileId = tileset.firstgid;
			var craftySpriteData = {};
			var imageHeightInTiles = tileset.imageheight
					/ tileset.tileheight;
			var imageWidthInTiles = tileset.imagewidth
					/ tileset.tilewidth;
			for (tileY = 0; tileY < imageHeightInTiles; tileY++) {
				for (tileX = 0; tileX < imageWidthInTiles; tileX++) {
					var _tileProperties = tileset.tileproperties
							&& tileset.tileproperties[tileId
									- tileset.firstgid];
					if (_tileProperties) {
						tileProperties[tileId] = _tileProperties;
							var addUp = 0, addSides = 0;
						if (_tileProperties.addUp) {
							addUp = parseInt(_tileProperties.addUp, 10);
						}
						if (_tileProperties.addSides) {
							addSides = parseInt(
									_tileProperties.addSides, 10);
						}
						craftySpriteData['tile' + tileId] = [
								tileX - addSides, tileY - addUp,
								addSides * 2 + 1, addUp + 1 ];
					}
					if (!craftySpriteData['tile' + tileId]) { // default
						craftySpriteData['tile' + tileId] = [ tileX,
								tileY ];
					}
					tileId++;
				}
			}
			/*
			 * Tiled saves images relative to the map, which is in
			 * /assets/maps. Crafty wants images relative to /. The
			 * images are in /assets/tiles, so basically we replace the
			 * ".." with "assets" to perform the conversion, e.g.
			 * "../tiles/tileset.png" -> "assets/tiles/tileset.png";
			 */
			var fixedPath = 'assets' + tileset.image.substr(2);
			Crafty.sprite(tileset.tileheight, tileset.tilewidth,
					fixedPath, craftySpriteData);
		}
		return tileProperties;
	}
	/**
	 * Returns the crafty volume (i.e. what should be passed to
	 * Crafty.audio.play) for a given song. This is because certain
	 * songs are louder than others, so we there's a normalization value
	 * on a per-song basis.
	 * 
	 * @param songId
	 *            the id of the song.
	 * @param logicalVolume
	 *            (optional) A value from 0.0 to 1.0. If absent, the
	 *            value from config.musicVolume is used instead.
	 */
	function effectiveVolume(songId, logicalVolume) {
		if (arguments.length === 1) {
			logicalVolume = config.musicVolume;
		}
		return config.music[songId].volume * logicalVolume;
	}
	function setMusicVolume(Crafty, newLogicalVolume) {
		config.musicVolume = newLogicalVolume;
		for (key in config.music) {
			var craftySoundObj = Crafty.audio.sounds[key];
			if (craftySoundObj) {
				var html5SoundObj = craftySoundObj.obj;
				craftySoundObj.volume = effectiveVolume(key,
						newLogicalVolume);
				html5SoundObj.volume = effectiveVolume(key,
						newLogicalVolume);
			}
		}
	}
	function addMusicControlEntity(Crafty) {
		Crafty.sprite('assets/ui/music.png', {
			uiMusic: [0, 0, 256,256]
		});
		Crafty.e('2D, Canvas, Mouse, uiMusic, ViewportRelative').attr({
			x: 0,
			y: 0,
			z: config.zOffset.meta,
			w: 32,
			h: 32,
			volumeState: 1
		}).bind('Click', function() {
			switch (this.volumeState) {
			case 1:
				this.volumeState = 0.5;
				this.alpha = 0.5;
				break;
			case 0.5:
				this.volumeState = 0;
				this.alpha = 0.3;
				break;
			default:
				this.volumeState = 1;
				this.alpha = 1;
				break;
			}
			setMusicVolume(Crafty, this.volumeState);
		});
	}
	/**
	 * Creates the many entities needed to represent the map, and returns the
	 * heightmap that was computed.
	 * 
	 * @param mapData
	 *            Tiled data.
	 * @param tileProperties
	 *            retrieved via loadTileset()
	 * @param tileClickCallback
	 *            a function which accepts a single parameter representing the
	 *            tile entity that was clicked on.
	 */
	function loadMap(mapData, tileProperties, tileClickCallback) {
		/**
		 * Map from a string of the form "x,y", e.g. "0,0", to an object containing information about the highest tile
		 * at those coordinates. Used for pathing.
		 */
		var worldToPixel = makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var heightMap = {};
		var i, j;
		for (i = 0; i < mapData.layers.length; i++) {
			var layer = mapData.layers[i];
			var baseheight;
			if (layer.properties && layer.properties.baseheight) {
				baseheight = parseInt(layer.properties.baseheight, 10);
			} else {
				baseheight = 0;
				console.warn('Layer ' + layer.name + ' missing baseheight');
			}
			if (layer.visible) {
				for (j = 0; j < layer.data.length; j++) {
					if (layer.data[j] != 0) {
						var tileType = 'tile'+layer.data[j];
						/*
						 * We add the baseheight to convert from "Looks right in tiled" to "reflects actual world
						 * coordinates."
						 */
						var tileX = j % layer.width + baseheight;
						var tileY = Math.floor(j / layer.width) + baseheight;
						var pixelCoord = worldToPixel(tileX, tileY, baseheight);
						var entity = Crafty.e('2D, Canvas, ' + tileType);
						var _justTileProperties = tileProperties[layer.data[j]] || {};
						var heightoffset;
						if (_justTileProperties['heightoffset']) {
							heightoffset = parseFloat(_justTileProperties['heightoffset']);
							if (isNaN(heightoffset)) {
								heightoffset = 0;
								console.warn('Could not parse ' + _justTileProperties['heightoffset']);
							}
						} else {
							heightoffset = 0;
						}
						entity.attr({
							x: pixelCoord.pixelX - entity.w / 2,
							y: pixelCoord.pixelY - entity.h,
							z: tileX + tileY + baseheight,
							tileX: tileX,
							tileY: tileY,
							tileZ: baseheight,
							surfaceZ: baseheight + heightoffset,
							tileId: layer.data[j],
							tileProperties: _justTileProperties
						});
						heightMap[tileX+","+tileY] = entity;
						if (!entity.tileProperties['noStand']) {
							entity.addComponent('ClickNoDrag');
							entity.bind("ClickNoDrag", function() {
								if (tileClickCallback) {
									tileClickCallback(this);
								}
							});
							/* The call to .map below makes a deep copy of the array; this is needed because Crafty
							 * seems to change the provided coordinate arrays in-place, which leads to problems if
							 * they're shared between multiple entities. */
							var _areaMapType = entity.tileProperties['areaMap'] || 'default'; 
							var tileAreaMap = new Crafty.polygon(config.areaMaps[_areaMapType].map(function(a) { return a.slice(); }));
							entity.areaMap(tileAreaMap);
						}
					}
				}
			}
		}
		return heightMap;
	}
	function stopAllMusic() {
		for (key in config.music) {
			Crafty.audio.stop();
		}
	}
	/**
	 * Given a sorted array of objects with a numeric field, returns the
	 * object whose numeric field is the largest one less than or equal to the
	 * target value. E.g.
	 * 
	 * binarySearch([
	 *   { key : 1, val: "a"},
	 *   { key : 2, val: "b"},
	 *   { key : 3, val: "c"},
	 * ], "key", 2.5) returns { key : 2, val: "b"}.
	 * 
	 * 	 * @param array
	 *            the array to search
	 * @param numericField
	 *            the name of the numeric field
	 * @param targetValue
	 *            an upper bound on the value the numericField can have.
	 * @return the object whose numeric field is the largest one under the
	 *         target value, or null if no such object exists.
	 */
	function binarySearch(array, numericField, targetValue) {
		function binarySearchRecurr(imin, imax) {
			//imin is inclusive, imax is exclusive
			if (array[imin][numericField] > targetValue) {
				return null;
			}
			if (imin >= imax) {
				return null;
			}
			if (imin + 1 == imax) {
				return array[imin];
			}
			var imid = Math.floor((imin + imax)/2);
			var value = array[imid][numericField];
			if (value > targetValue) {
				return binarySearchRecurr(imin, imid);
			} else if (value < targetValue) {
				return binarySearchRecurr(imid, imax);
			} else {
				return array[imid];
			}
		}
		return binarySearchRecurr(0, array.length);
	}
	function createTitleEntity(Crafty) {
		var title = Crafty.e('2D, DOM, Text');
		title.attr({
			w : config.viewport.width,
			x : 0,
			y : 0,
			z : 1,
		}).text("Karayom").css({
			'text-align': 'center',
			'color': '#fff',
			'display' : 'none',
			'font-family' : 'Corben', //depends on index.html
			'font-size' : '80px',
			'font-weight' : 700,
			'text-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff2d95, 0 0 30px #ff2d95, 0 0 40px #ff2d95, 0 0 50px #ff2d95, 0 0 75px #ff2d95',
		});
		return title;
	}
	function charAtIsLowerCase(text, index) {
		if (text.length <= index) {
			return false;
		}
		var char = text[index];
		return char.toLowerCase() == char;
	}
	var MAX_NAME_LENGTH = 6;
	function getShortName(longName) {
		if (longName.length <= MAX_NAME_LENGTH) { //If the name fits, just use it as is.
			return longName;
		}
		//Guaranteed name is too long at this point.
		var dashPosition = longName.indexOf('-');
		if (dashPosition != -1) { //If there's a dash in the name, truncate at dash and try again
			return getShortName(longName.substr(0,dashPosition));
		}
		//Guaranteed too long and no dash at this point.
		
		/*
		 * If you can divide the name into an uppercase portion followed by a lowercase portion, keep all but the last
		 * uppercase character, and truncate the rest. E.g. "TJHolowaychuk" -> "TJ". If the uppercase portion is too long,
		 * just return the first N characters from it, e.g. "ABCDEFGalloway" -> "ABCDEF".
		 */
		var regResults = /^([A-Z]+)[A-Z][a-z]+$/.exec(longName);
		if (regResults) {
			return regResults[1].substr(0,MAX_NAME_LENGTH);
		}
		/*
		 * If there is a transition from lowecase to uppercase within the length limit, keep the lowercase letter and
		 * discard the uppercase one. E.g. "NebuPookins" would be truncated to "Nebu".
		 */
		var i;
		for (i = MAX_NAME_LENGTH - 1; i > 0; i--) {
			if (charAtIsLowerCase(longName, i) && !charAtIsLowerCase(longName, i + 1)) {
				return longName.substr(0, i + 1);
			}
		}
		//Give up. Just return the first N characters.
		return longName.substr(0, MAX_NAME_LENGTH);
	}
	return {
		makeWorldToPixelConverter : makeWorldToPixelConverter,
		loadTileset : loadTileset,
		effectiveVolume : effectiveVolume,
		setMusicVolume : setMusicVolume,
		addMusicControlEntity: addMusicControlEntity,
		loadMap: loadMap,
		stopAllMusic: stopAllMusic,
		binarySearch: binarySearch,
		createTitleEntity: createTitleEntity,
		getShortName: getShortName,
	};
});