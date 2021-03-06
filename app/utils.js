define([
		'config',
		'path_finder',
		'set',
		'components/BetterText',
],
function(config, PathFinder, Set) {
	function assert(cond, msg) {
		if (!cond) {
			debugger;
			throw msg;
		}
	}

	var newUUID = (function() {
		var nextId = 0;
		return function() {
			return (nextId++);
		}
	})();

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
	 * Tests whether a point is in a rectangle. The point must be an
	 * object with "x" and "y" properties; the rectangle must be an
	 * object with "x", "y", "w", and "h" properties.
	 */
	function pointInRect(pt, rect) {
		return pt.x >= rect.x && pt.x <= (rect.x + rect.w) && pt.y >= rect.y && pt.y <= (rect.y + rect.h);
	}
	/**
	 * Loads a tileset from a map (i.e. creates or updates the
	 * appropriate components), and returns a tileproperties object,
	 * which is a map from global tile id, e.g. "55", to their
	 * properties, e.g. {"noStand": "true"}
	 */
	function loadTileset(mapData) {
		assert(mapData, 'mapData required');
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
	 * Creates the many entities needed to represent the map, and returns TODO
	 * 
	 * @param mapData
	 *            Tiled data.
	 * @param tileProperties
	 *            retrieved via loadTileset()
	 * @param tileClickCallback
	 *            a function which accepts a single parameter representing the
	 *            tile entity that was clicked on.
	 */
	function loadMap(mapData, tileProperties) {
		assert(mapData, 'mapData required');
		assert(tileProperties, 'tileProperties required');
		/**
		 * Map from a string of the form "x,y", e.g. "0,0", to an object containing information about the highest tile
		 * at those coordinates. Used for pathing.
		 */
		var worldToPixel = makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var parsedMapData = {};
		parsedMapData.heightMap = {};
		parsedMapData.objects = [];
		function parseTilelayer(layer, baseheight) {
			if (layer.visible) {
				var j;
				var layerData = layer.data;
				var layerDataLength = layerData.length;
				for (j = 0; j < layerDataLength; j++) {
					if (layerData[j] != 0) {
						var tileType = 'tile'+layerData[j];
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
						parsedMapData.heightMap[tileX+","+tileY] = entity;
					}
				}
			}
		}
		function parseObjectlayer(layer, baseheight) {
			var i;
			if (layer.visible) {
				for (i = 0; i < layer.objects.length; i++) {
					var object = layer.objects[i];
					parsedMapData.objects.push({
						tileX: Math.round(object.x / 32 + baseheight), //TODO: How do we know it's 32?
						tileY: Math.round(object.y / 32 + baseheight), //TODO: How do we know it's 32?
						tileZ: baseheight,
						name: object.name,
						type: object.type,
						properties: object.properties,
					});
				}
			}
		}
		var i;
		for (i = 0; i < mapData.layers.length; i++) {
			var layer = mapData.layers[i];
			var baseheight;
			if (layer.properties && layer.properties.baseheight) {
				baseheight = parseInt(layer.properties.baseheight, 10);
			} else {
				baseheight = 0;
				console.warn('Layer ' + layer.name + ' missing baseheight');
			}
			if (layer.type == 'tilelayer') {
				// profile('utils.js loadMap :: parseTileLayer', parseTilelayer, [layer, baseheight]);
			} else if (layer.type == 'objectgroup') {
				profile('utils.js loadMap :: parseObjectLayer',  parseObjectlayer, [layer, baseheight]);
			}
		}
		return parsedMapData;
	}

	/**
	 * Creates a PathFinder (see path_finder.js) that can compute paths
	 * within the given parsed map data.
	 *
	 * The states of the returned PathFinder are tile entities; the actions
	 * are functions that accept a source tile entity and return a destination
	 * tile entity, or `undefined` if the action isn't allowed (because it
	 * would go where there's no tile).
	 *
	 * @param parsedMapData  parsed map data as returned by loadMap.
	 */
	function makePathFinder(parsedMapData) {
		function makeActionFunc(dx, dy) {
			return function(ent) {
				var newX = ent.tileX + dx;
				var newY = ent.tileY + dy;
				return parsedMapData.heightMap[newX+","+newY];
			}
		}
		var ALL_ACTIONS = [
			makeActionFunc(1,0),
			makeActionFunc(-1,0),
			makeActionFunc(0,1),
			makeActionFunc(0,-1)
		];
		var objectPositions = new Set(function(x) { return x; });
		parsedMapData.objects.forEach(function(obj) {
			objectPositions.add(obj.tileX+","+obj.tileY);
		});

		return new PathFinder({
			actions: function(state) {
				return ALL_ACTIONS.filter(function(act) {
					var dest = act(state); /* might be undefined, if it would go where there's no tile */
					if (dest === undefined) {
						return false;
					} else if (dest.noStand || objectPositions.contains(dest.tileX+","+dest.tileY)) {
						return false;
					} else {
						var srcHeight = parsedMapData.heightMap[state.tileX+","+state.tileY].surfaceZ;
						var destHeight = parsedMapData.heightMap[dest.tileX+","+dest.tileY].surfaceZ;
						return Math.abs(srcHeight - destHeight) <= 0.5;
					}
				});
			},
			cost: function(state, action) { return 1; },
			result: function(state, action) { return action(state); },
			stateKey: function(state) { return state.tileX + "," + state.tileY; }
		});
	}

	function stopAllMusic() {
		for (key in config.music) {
			Crafty.audio.stop(key);
		}
	}
	function ensureMusicIsPlaying(songId) {
		for (key in config.music) {
			if (key == songId) {
				if (! Crafty.audio.isPlaying(key)) {
					Crafty.audio.play(key, -1, effectiveVolume(key));
				}
			} else {
				//Stop all other music
				Crafty.audio.stop(key);
			}
			
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
	/**
	 * Merges two objects, using the given function to combine
	 * values from keys that are found in both. Example:
	 *
	 * mergeObjs({a: 1, b: 2}, {b: 3, c: 4}, function(x,y) { return x+y; })
	 *
	 * returns {a: 1, b: 5, c: 4}.
	 */
	function mergeObjs(obj1, obj2, combineFunc) {
		var result = {};
		for (k in obj1) {
			if (obj1.hasOwnProperty(k)) {
				result[k] = obj1[k];
			}
		}
		for (k in obj2) {
			if (obj2.hasOwnProperty(k)) {
				if (result.hasOwnProperty(k)) {
					result[k] = combineFunc(result[k], obj2[k]);
				} else {
					result[k] = obj2[k];
				}
			}
		}
		return result;
	}
	function createTitleEntity(Crafty) {
		var TITLE_WIDTH = 434;
		var TITLE_HEIGHT = 130;
		var title = Crafty.e('2D, Canvas, karayom_title');
		title.attr({x: 0, y: 0});
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
		/*
		 * Note that the judge's github account names are:
		 * 
		 * David Czarnecki: czarneckid
		 * Eric Preisz: ??? GarageGames? DavidWyand-GG? GG-ScottB? Svetbach? thecelloman?
		 * Matt Hackett: richtaur 
		 * Lee Reilly: leereilly
		 * Romana Ramzan: ???
		 */
		if (longName.length <= MAX_NAME_LENGTH) { //If the name fits, just use it as is.
			return longName;
		}
		//Guaranteed name is too long at this point.
		var dashPosition = longName.indexOf('-');
		if (dashPosition != -1) { //If there's a dash in the name, truncate at dash and try again
			return getShortName(longName.substr(0,dashPosition));
		}
		//Guaranteed too long and no dash at this point.
		var regResults;
		/*
		 * If a name is exactly two uppercase characters followed by a lower case characters, drop the first uppercase
		 * character, then keep all the remaining lowercase characters (up to the max length). E.g. "ASwanson" -> "Swanso".
		 */
		regResults = /^[A-Z]([A-Z][a-z]+)$/.exec(longName);
		if (regResults) {
			return regResults[1].substr(0,MAX_NAME_LENGTH);
		}
		/*
		 * If you can divide the name into an uppercase portion followed by a lowercase portion, keep all but the last
		 * uppercase character, and truncate the rest. E.g. "TJHolowaychuk" -> "TJ". If the uppercase portion is too long,
		 * just return the first N characters from it, e.g. "ABCDEFGalloway" -> "ABCDEF". Note that because of the earlier
		 * regexp test, we're guaranteed that there are at least 2 uppercase initials here.
		 */
		regResults = /^([A-Z]+)[A-Z][a-z]+$/.exec(longName);
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
	function ajax(url, callback) {
		var unusedName = 'asjdlasidjliwmxxsasdnsmnd'; //TODO check if name is unused, generate a different name if it is used.
		var body = document.getElementsByTagName('body')[0];
		var script = document.createElement('script');
		window[unusedName] = function(var_args) {
			delete window[unusedName];
			body.removeChild(script);
			callback.apply(null, arguments);
		};
		script.src = url + '?callback='+unusedName;
		body.appendChild(script);
	}
	/**
	 * Gets the avatar url associated with the specified github account name, and then invokes the callback, passing in
	 * the url.
	 */
	function withGitHubAvatarUrl(githubAccountName, callback) {
		cacheFunctionResult(
			'withGitHubAvatarUrl.'+githubAccountName,
			function(cacheCallback) {
				ajax('https://api.github.com/users/'+githubAccountName, function(jsonData) {
					if (jsonData.meta.status === 200) {
						cacheCallback(jsonData.data.avatar_url);
					} else if (jsonData.meta.status === 404) {
						cacheCallback(null);
					} else {
						console.warn('Got ' + jsonData.meta.status + ' while loading github avatar');
						cacheCallback(null);
					}
				});
			},
			callback
		);
	}
	/**
	 * Given an array of github account names, gets their associated avatar urls, then invokes the callback, passing in
	 * an array of urls.
	 */
	function withGitHubAvatarUrls(accountArray, callback) {
		function withGitHubAvatarUrlsRecurr(myArray, accumulator) {
			if (accountArray.length == 0) {
				callback(accumulator);
			} else {
				var head = accountArray[0];
				var tail = accountArray.splice(0, 1);
				withGitHubAvatarUrl(head, function(headUrl) {
					accumulator.push(headUrl);
					withGitHubAvatarUrlsRecurr(tail, accumulator);
				});
			}
		}
		withGitHubAvatarUrlsRecurr(accountArray, []);
	}
	/**
	 * Returns true if the array contains the provided needle, false otherwise.
	 */
	function contains(array, needle) {
		for (var i = 0; i < array.length; i++) {
			if (array[i] == needle) {
				return true;
			}
		}
		return false;
	}
	/**
	 * Returns a new array which is equal to the first array, except with duplicates removed;
	 */
	function removeDuplicates(array) {
		var retVal = [];
		for (var i = 0; i < array.length; i++) {
			if (!contains(retVal, array[i])) {
				retVal.push(array[i]);
			}
		}
		return retVal;
	}
	/**
	 * If the cache contains the provided key, invokes the callback passing in the associated value. Otherwise, runs the
	 * provided function, and stores the result of the function into the cache under the specified key, and then invokes
	 * the specified callback with the value.
	 * 
	 * Example:
	 * 
	 * cacheFunctionResult(
	 * 	'sumOf2Plus2',
	 * 	function(callback) {
	 * 		var computation = 2 + 2;
	 * 		callback(computation);
	 * 	},
	 * 	function(result) {
	 * 		console.log('The result is ' + result);
	 * });
	 * 
	 * Note that "falsy" values are not stored into the cache. If you really want to cache 'false' as the result of the
	 * computation, you should wrap it in an object so that it appears truthy.
	 */
	function cacheFunctionResult(key, func, callback) {
		var cacheStr = window.localStorage.getItem('cacheFunctionResult');
		var cacheObj = cacheStr ? JSON.parse(cacheStr) : {};
		var cachedValue = cacheObj[key];
		if (cachedValue) {
			callback(cachedValue);
		} else {
			func(function(result) {
				if (result) { //Don't store falsy results.
					cacheObj[key] = result;
					window.localStorage.setItem('cacheFunctionResult', JSON.stringify(cacheObj));
				}
				callback(result);
			});
		}
	}
	/**
	 * Sets a value on an object, and then returns the original object; useful for chaining setters on native objects.
	 */
	function chainSet(obj, key, value) {
		obj[key] = value;
		return obj;
	}
	/**
	 * The built in Crafty.viewport.centerOn is not correctly implemented, so this is offered as a replacement
	 * implementation.
	 */
	function centerViewportOn(Crafty, target, time) {
		var worldTargetCenter = {
			x: target.x + target.w / 2,
			y: target.y + target.h / 2
		};
		var screenTargetCenter = {
			x: worldTargetCenter.x + Crafty.viewport.x,
			y: worldTargetCenter.y + Crafty.viewport.y
		};
		var screenCenter = {
			x: config.viewport.width / 2,
			y: config.viewport.height / 2,
		};
		Crafty.viewport.pan('reset');
		Crafty.viewport.pan('x', screenTargetCenter.x - screenCenter.x, time);
		Crafty.viewport.pan('y', screenTargetCenter.y - screenCenter.y, time);
	}
	function interpolate(msg, env) {
		return msg.replace(/@(\w+)@/g, function(_, name) { return env[name]; });
	}
	var profileDepth = 0;
	function profile(desc, func, funcArgs) {
		var indent = '';
		var i;
		for (i = 0; i < profileDepth; i++) {
			indent += '>';
		}
		profileDepth++;
		var startTime = Date.now();
		console.log(indent, 'BEGIN ', desc, startTime);
		try {
			return func.apply(this, funcArgs || []);
		} finally {
			var endTime = Date.now();
			profileDepth--;
			console.log(indent, 'END ', desc, endTime, '('+(endTime - startTime)+')');
		}
	}
	return {
		assert : assert,
		newUUID : newUUID,
		makeWorldToPixelConverter : makeWorldToPixelConverter,
		pointInRect : pointInRect,
		loadTileset : function(mapData) { return profile('utils.js loadTileset', loadTileset, [mapData]); },
		effectiveVolume : effectiveVolume,
		setMusicVolume : setMusicVolume,
		addMusicControlEntity: addMusicControlEntity,
		loadMap: function(mapData, tileProperties, tileClickCallback) { return profile('utils.js loadMap', loadMap, [mapData, tileProperties, tileClickCallback]);},
		makePathFinder: makePathFinder,
		stopAllMusic: stopAllMusic,
		binarySearch: binarySearch,
		mergeObjs: mergeObjs,
		createTitleEntity: createTitleEntity,
		getShortName: getShortName,
		withGitHubAvatarUrl: withGitHubAvatarUrl,
		withGitHubAvatarUrls: withGitHubAvatarUrls,
		removeDuplicates: removeDuplicates,
		centerViewportOn: centerViewportOn,
		ensureMusicIsPlaying: ensureMusicIsPlaying,
		chainSet: chainSet,
		interpolate: interpolate,
		profile: profile,
	};
});
