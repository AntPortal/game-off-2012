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
			var w = 16*2;
			var h = 18*2;
			Crafty.sprite("assets/sprites/charsets_warrior.png", {
				heroNorth: [0, 0, w, h],
				heroEast: [0, h, w, h],
				heroSouth: [0, h*2, w, h],
				heroWest: [0, h*3, w, h]
			});
		})();
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
							var addUp = 0, addSides = 0;
							if (tileProperties.addUp) {
								addUp = parseInt(tileProperties.addUp, 10);
							}
							if (tileProperties.addSides) {
								addSides = parseInt(tileProperties.addSides, 10);
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
				var fixedPath = "assets" + tileset.image.substr(2);
				Crafty.sprite(tileset.tileheight, tileset.tilewidth, fixedPath, craftySpriteData);
			}
		})();
		var worldToPixel = makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		(function() {
			//Render map
			var i, j;
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

			var hero = Crafty.e('2D, Canvas, Hero, heroSouth').setPos(0, 0, 0);

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
							var entity = Crafty.e('2D, Canvas, Mouse, ' + tileType);
							entity.attr({
								x: pixelCoord.pixelX - entity.w / 2,
								y: pixelCoord.pixelY - entity.h,
								z: baseheight,
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