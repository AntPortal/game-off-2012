define([ 'config', 'maps/test-multi-tileset-two-baseheights.json', 'Crafty' ], function(config, mapData) {
	var TILE_IMAGE_SIZE = 64; //A baked in assumption we're making

	Crafty.scene('IsoTest', function() {
		var hero; //entity global to this scene
		function makeWorldToPixelConverter(mapTileWidth, mapTileHeight) {
			return function(worldX, worldY, worldZ) {
				return {
					pixelX: ((config.viewport.width - mapTileWidth) / 2) + ((worldX - worldY + 1) * mapTileWidth / 2),
					pixelY: ((worldX + worldY) * mapTileHeight / 2) - ((worldZ - 1) * mapTileHeight)
				};
			};
		}
		(function() {
			var w = 16*2;
			var h = 18*2;
			Crafty.sprite("assets/sprites/charsets_warrior.png", {
				heroNorth: [0, 0, w, h],
				heroEast: [0, h, w, h],
				heroSouth: [0, h*2, w, h],
				heroWest: [0, h*3, w, h]
			});
		})();
		/**
		 * Map from global tile id, e.g. "55", to their properties, e.g. {"noStand": "true"}
		 */
		var tileProperties = {};
		(function() {
			//Load tileset into crafty
			var tileX, tileY, i;
			for (i =0; i < mapData.tilesets.length; i++) {
				var tileset = mapData.tilesets[i];
				if (tileset.tileheight != TILE_IMAGE_SIZE) {
					console.warn("tileheight is not " + TILE_IMAGE_SIZE + " for " + tileset.name);
				}
				if (tileset.tilewidth != TILE_IMAGE_SIZE) {
					console.warn("tilewidth is not " + TILE_IMAGE_SIZE + " for " + tileset.name);
				}
				//TODO: margin and spacing are ignored.
				var tileId = tileset.firstgid;
				var craftySpriteData = {};
				var imageHeightInTiles = tileset.imageheight / tileset.tileheight;
				var imageWidthInTiles = tileset.imagewidth / tileset.tilewidth;
				for (tileY = 0; tileY < imageHeightInTiles; tileY++) {
					for (tileX = 0; tileX < imageWidthInTiles; tileX++) {
						var _tileProperties = tileset.tileproperties && tileset.tileproperties[tileId - tileset.firstgid];
						if (_tileProperties) {
							tileProperties[tileId] = _tileProperties;
							var addUp = 0, addSides = 0;
							if (_tileProperties.addUp) {
								addUp = parseInt(_tileProperties.addUp, 10);
							}
							if (_tileProperties.addSides) {
								addSides = parseInt(_tileProperties.addSides, 10);
							}
							craftySpriteData['tile'+tileId] = [
								tileX - addSides,
								tileY-addUp,
								addSides * 2 + 1,
								addUp+1
							];
						}
						if (!craftySpriteData['tile'+tileId]) { //default
							craftySpriteData['tile'+tileId] = [tileX,tileY];
						}
						tileId++;
					}
				}
				/*
				 * Tiled saves images relative to the map, which is in /assets/maps. Crafty wants images
				 * relative to /. The images are in /assets/tiles, so basically we replace the ".." with "assets"
				 * to perform the conversion, e.g. "../tiles/tileset.png" -> "assets/tiles/tileset.png";
				 */
				var fixedPath = 'assets' + tileset.image.substr(2);
				Crafty.sprite(tileset.tileheight, tileset.tilewidth, fixedPath, craftySpriteData);
			}
		})();
		var worldToPixel = makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		(function() {
			//Render map
			var i, j;

			var areaMaps = {
				'default': [[32, 32], [64, 48], [32, 64], [0, 48]],
				'cube': [[32, 0], [64, 16], [32, 32], [0, 16]],
			};

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
							entity.attr({
								x: pixelCoord.pixelX - entity.w / 2,
								y: pixelCoord.pixelY - entity.h,
								z: baseheight,
								tileX: tileX,
								tileY: tileY,
								tileId: layer.data[j],
								tileProperties: tileProperties[layer.data[j]] || {}
							});
							if (!entity.tileProperties['noStand']) {
								entity.addComponent('Mouse');
								entity.bind("Click", function() {
									var heightoffset = parseFloat(this.tileProperties['heightoffset'] || 0, 10);
									if (hero) {
										hero.setPos(this.tileX, this.tileY, this.z + heightoffset);
									}
								});
								/* The call to .map below makes a deep copy of the array; this is needed because Crafty
								 * seems to change the provided coordinate arrays in-place, which leads to problems if
								 * they're shared between multiple entities. */
								var _areaMapType = entity.tileProperties['areaMap'] || 'default'; 
								var tileAreaMap = new Crafty.polygon(areaMaps[_areaMapType].map(function(a) { return a.slice(); }));
								entity.areaMap(tileAreaMap);
							}
						}
					}
				}
			}
		})();
		(function() {
			//Add characterss
			Crafty.c('Hero', {
				init: function() {
					this.requires('2D');
				},
				setPos: function(worldX, worldY, worldZ) {
					var pixelCoord = worldToPixel(worldX, worldY, worldZ);
					this.attr({
						tileX: worldX,
						tileY: worldY,
						tileZ: worldZ,
						x: pixelCoord.pixelX - (this.w / 2),
						y: pixelCoord.pixelY - (TILE_IMAGE_SIZE / 4) - this.h,
						z: Math.floor(worldZ)
					});
					return this;
				}
			});
			hero = Crafty.e('2D, Canvas, Hero, heroSouth').setPos(0, 0, 0);
		})();
		(function() {
			Crafty.sprite("assets/ui/music.png", {
				uiMusic: [0, 0, 256,256]
			});
			var temp = worldToPixel(0,0,0);
			//TODO: Make it so that this isn't affected by mouselook.
			//TODO: Make it so that when you click on this, the music is muted.
			Crafty.e('2D, Canvas, Mouse, uiMusic').attr({
				x: temp.pixelX,
				y: temp.pixelY,
				z: 1,
				w: 64,
				h: 64
			});
		})();
		Crafty.viewport.clampToEntities = false;
		Crafty.viewport.mouselook(true);
		//Crafty.audio.play('music/town', -1); //TODO: Uncomment this once muting is implemented.
	});
	return undefined;
});