define([ 'config' ], function(config) {
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
	 * Loads a tileset from a map (i.e. creates or updates the appropriate
	 * components), and returns a tileproperties object, which is a map from
	 * global tile id, e.g. "55", to their properties, e.g. {"noStand": "true"}
	 */
	function loadTileset(mapData) {
		var tileProperties = {};
		var tileX, tileY, i;
		for (i =0; i < mapData.tilesets.length; i++) {
			var tileset = mapData.tilesets[i];
			if (tileset.tileheight != config.TILE_IMAGE_SIZE) {
				console.warn("tileheight is not " + config.TILE_IMAGE_SIZE + " for " + tileset.name);
			}
			if (tileset.tilewidth != config.TILE_IMAGE_SIZE) {
				console.warn("tilewidth is not " + config.TILE_IMAGE_SIZE + " for " + tileset.name);
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
		return tileProperties;
	}
	return {
		makeWorldToPixelConverter : makeWorldToPixelConverter,
		loadTileset: loadTileset
	};
});