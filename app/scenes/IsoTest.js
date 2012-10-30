define([ 'config', 'maps/test-multi-tileset-two-baseheights.json', 'Crafty' ], function(config, mapData) {
	var TILE_IMAGE_SIZE = 64; //A baked in assumption we're making

	Crafty.scene('IsoTest', function() {
		function makeWorldToPixelConverter(mapTileWidth, mapTileHeight) {
			return function(worldX, worldY, worldZ) {
				return {
					pixelX: ((config.viewport.width - mapTileWidth) / 2) + ((worldX - worldY + 1) * mapTileWidth / 2),
					pixelY: ((worldX + worldY) * mapTileHeight / 2) - ((worldZ - 1) * mapTileHeight)
				};
			};
		}
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
						var tileProperties = tileset.tileproperties && tileset.tileproperties[tileId - tileset.firstgid];
						if (tileProperties) {
							if (tileProperties.addUp) {
								var addUp = parseInt(tileProperties.addUp, 10);
								craftySpriteData['tile'+tileId] = [
									tileX,
									tileY-addUp,
									1,
									addUp+1
								];
							}
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
				var fixedPath = "assets" + tileset.image.substr(2);
				Crafty.sprite(tileset.tileheight, tileset.tilewidth, fixedPath, craftySpriteData);
			}
		})();
		(function() {
			//Render map
			var i, j;
			var worldToPixel = makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);

			Crafty.c('Hero', {
				init: function() {
					this.requires('2D');
				},
				setPos: function(worldX, worldY, worldZ) {
					var pixelCoord = worldToPixel(worldX, worldY, worldZ);
					this.attr({
						x: pixelCoord.pixelX - (this.w / 2),
						y: pixelCoord.pixelY - (TILE_IMAGE_SIZE / 4) - this.h,
						z: worldZ + 1
					});
					return this;
				}
			});

			var heroWidth = 24;
			var heroHeight = 36;
			var hero = Crafty.e('2D, Canvas, Color, Hero').attr({
				w: heroWidth,
				h: heroHeight
			}).setPos(0, 0, 0).color('green');

			for (i = 0; i < mapData.layers.length; i++) {
				var layer = mapData.layers[i];
				if (layer.visible) {
					for (j = 0; j < layer.data.length; j++) {
						if (layer.data[j] != 0) {
							var tileType = 'tile'+layer.data[j];
							var tileX = j % layer.width;
							var tileY = Math.floor(j / layer.width);
							var pixelCoord = worldToPixel(tileX, tileY, layer.properties.baseheight);
							var entity = Crafty.e('2D, Canvas, Mouse, ' + tileType);
							entity.attr({
								x: pixelCoord.pixelX - entity.w / 2,
								y: pixelCoord.pixelY - entity.h,
								z: layer.properties.baseheight,
								tileX: tileX,
								tileY: tileY
							}).bind("Click", function() {
								hero.setPos(this.tileX, this.tileY, this.z);
							});
						}
					}
				}
			}
		})();
		Crafty.viewport.clampToEntities = false;
		Crafty.viewport.mouselook(true);
	});
	return undefined;
});