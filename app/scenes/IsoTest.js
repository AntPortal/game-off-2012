define([ 'config', 'maps/test-multi-tileset-two-baseheights.json', 'Crafty' ], function(config, mapData) {
	var TILE_IMAGE_SIZE = 64; //A baked in assumption we're making

	Crafty.scene('IsoTest', function() {
		function makeWorldToPixelConverter(mapTileWidth, mapTileHeight) {
			return function(worldX, worldY, worldZ) {
				return {
					pixelX: ((config.viewport.width - mapTileWidth) / 2) + ((worldX - worldY) * mapTileWidth / 2),
					pixelY: ((worldX + worldY) * mapTileHeight / 2) - (worldZ * mapTileHeight)
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
						craftySpriteData['tile'+tileId] = [tileX,tileY];
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

			var heroWidth = 24;
			var heroHeight = 36;
			var heroPixelCoord = worldToPixel(0, 0, 0);
			var hero = Crafty.e('2D, Canvas, Color').attr({
				w: heroWidth,
				h: heroHeight,
				x: heroPixelCoord.pixelX + (TILE_IMAGE_SIZE - heroWidth) / 2,
				y: heroPixelCoord.pixelY + 0.75*TILE_IMAGE_SIZE - heroHeight,
				z: 1
			}).color('green');

			for (i = 0; i < mapData.layers.length; i++) {
				var layer = mapData.layers[i];
				if (layer.visible) {
					for (j = 0; j < layer.data.length; j++) {
						if (layer.data[j] != 0) {
							var tileType = 'tile'+layer.data[j];
							var tileX = j % layer.width;
							var tileY = Math.floor(j / layer.width);
							var pixelCoord = worldToPixel(tileX, tileY, layer.properties.baseheight);
							var entity = Crafty.e('2D, Canvas, Mouse, ' + tileType).attr({
								w : TILE_IMAGE_SIZE,
								h : TILE_IMAGE_SIZE,
								x: pixelCoord.pixelX,
								y: pixelCoord.pixelY,
								z: layer.properties.baseheight,
								tileX: tileX,
								tileY: tileY
							}).bind("Click", function() {
								var newHeroPixelCoord = worldToPixel(this.tileX, this.tileY, this.z);
								hero.attr({
									x: newHeroPixelCoord.pixelX  + (TILE_IMAGE_SIZE - heroWidth) / 2,
									y: newHeroPixelCoord.pixelY  + 0.75 *TILE_IMAGE_SIZE - heroHeight,
									z: this.z + 1
								});
							});
						}
					}
				}
			}
		})();
	});
	return undefined;
});