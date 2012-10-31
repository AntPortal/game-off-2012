define(
		[ 'config' ],
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
					logicalVolume = config.musicVolume
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
					z: 100,
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
			return {
				makeWorldToPixelConverter : makeWorldToPixelConverter,
				loadTileset : loadTileset,
				effectiveVolume : effectiveVolume,
				setMusicVolume : setMusicVolume,
				addMusicControlEntity: addMusicControlEntity,
			};
		});