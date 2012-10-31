define(['config'], function(config) {
	function makeWorldToPixelConverter(mapTileWidth, mapTileHeight) {
		return function(worldX, worldY, worldZ) {
			return {
				pixelX: ((config.viewport.width - mapTileWidth) / 2) + ((worldX - worldY + 1) * mapTileWidth / 2),
				pixelY: ((worldX + worldY) * mapTileHeight / 2) - ((worldZ - 1) * mapTileHeight)
			};
		};
	}
	return {
		makeWorldToPixelConverter: makeWorldToPixelConverter
	};
});