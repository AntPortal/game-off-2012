define([ 'config', 'maps/test.json', 'Crafty' ], function(config, mapData) {

	
	Crafty.scene('IsoTest', function() {
		var tileX, tileY, pixelX, pixleY, tileType, i, j;
		//Load tileset into crafty
		//TODO: Only support 1 tileset for now
		for (i =0; i < mapData.tilesets.length; i++) {
			var tileset = mapData.tilesets[i]
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
			//TODO: fix image path
			Crafty.sprite(tileset.tileheight, tileset.tilewidth, tileset.image, craftySpriteData);
		}
		
		//Render map
		for (i = 0; i < mapData.layers.length; i++) {
			var layer = mapData.layers[i];
			if (layer.visible) {
				for (j = 0; j < layer.data.length; j++) {
					tileType = 'tile'+layer.data[j];
					tileX = j % layer.width;
					tileY = Math.floor(j / layer.width);
					pixelX = (config.viewport.width / 2) + ((tileX - tileY) * mapData.tilewidth / 2);
					pixelY = ((tileX + tileY) * mapData.tileheight / 2);
					console.log({tileX: tileX,tileY: tileY,pixelX:pixelX,pixelY:pixelY});
					var entity = Crafty.e('2D, Canvas, Mouse, ' + tileType + ', Tint').attr({
						w : 64,
						h : 64,
						x: pixelX,
						y: pixelY,
						tileX: tileX,
						tileY: tileY
					});
					entity.bind('MouseOver', function(event) {
						this.tint("#0000FF", 0.25);
						console.log({tileX: this.tileX, tileY: this.tileY});
					});
					entity.bind('MouseOut', function(event) {
						this.tint("#000000", 0);
					});
				}
			}
		} 
	});
	return undefined;
});