define([
		'config',
		'maps/test-multi-tileset-two-baseheights.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag'
	], function(config, mapData, mouselook, utils) {
	var TILE_IMAGE_SIZE = 64; //A baked in assumption we're making
	Crafty.scene('IsoTest', function() {
		var hero; //entity global to this scene
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
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		/**
		 * Map from a string of the form "x,y", e.g. "0,0", to an object containing information about the highest tile
		 * at those coordinates. Used for pathing.
		 */
		var heightMap = {};
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
									console.log('Clicked on');
									console.log({
										x: this.tileX,
										y: this.tileY,
										z: this.surfaceZ
									});
									if (hero) {
										hero.setWalkTarget(this.tileX, this.tileY);
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
		console.log('heightMap');
		console.log(heightMap);
		(function() {
			//Add characterss
			Crafty.c('Hero', {
				_targetX: 0, //in world coordinates
				_targetY: 0, //in world coordinates
				init: function() {
					this.requires('2D');
					this.bind('EnterFrame', this._enterFrame);
				},
				setPos: function(worldX, worldY, worldZ) {
					var topLeftPixelCoord = this._getTopLeftPixelCoords(worldX, worldY, worldZ);
					this.attr({
						tileX: worldX,
						tileY: worldY,
						tileZ: worldZ,
						x: topLeftPixelCoord.x,
						y: topLeftPixelCoord.y,
						z: worldX + worldY + worldZ
					});
					return this;
				},
				setWalkTarget: function(worldX, worldY) {
					this._targetX = worldX;
					this._targetY = worldY;
				},
				_getTopLeftPixelCoords: function(worldX, worldY, worldZ) {
					var bottomPixelCoord = worldToPixel(worldX, worldY, worldZ);
					return {
						x: bottomPixelCoord.pixelX - (this.w / 2),
						y: bottomPixelCoord.pixelY - (TILE_IMAGE_SIZE / 4) - this.h
					};
				},
				_enterFrame: function() {
					var curTilePixelTopLeft = this._getTopLeftPixelCoords(this.tileX, this.tileY, this.tileZ);
					if (curTilePixelTopLeft.x != this.x || curTilePixelTopLeft.y != this.y) {
						//Not aligned in tile, so move towards proper position within tile.
						var newX, newY;
						newX = curTilePixelTopLeft.x * 0.1 + this.x * 0.9;
						newY = curTilePixelTopLeft.y * 0.1 + this.y * 0.9;
						if (Math.abs(newX - this.x) < 1) {
							this.x = curTilePixelTopLeft.x;
						} else {
							this.x = newX;
						}
						if (Math.abs(newY - this.y) < 1) {
							this.y = curTilePixelTopLeft.y;
						} else {
							this.y = newY;
						}
					} else if (this._targetX != this.tileX || this._targetY != this.tileY) {
						//Not at the right tile, so choose the next tile to move into
						//TODO: Do pathing so you don't walk over impossible tiles.
						if (this._targetX < this.tileX) {
							this.tileX--;
						}
						if (this._targetX > this.tileX) {
							this.tileX++;
						}
						if (this._targetY < this.tileY) {
							this.tileY--;
						}
						if (this._targetY > this.tileY) {
							this.tileY++;
						}
						this.tileZ = heightMap[this.tileX+','+this.tileY].surfaceZ;
						this.z = this.tileX + this.tileY + this.tileZ;
						console.log({
							action: 'Hero moving',
							x: this.tileX,
							y: this.tileY,
							z: this.tileZ,
							targetX: this._targetX,
							targetY: this._targetY
						});
					}
				}
			});
			hero = Crafty.e('2D, Canvas, Hero, heroSouth').setPos(0, 0, 0);
		})();
		(function() {
			//Handle HUD
			Crafty.sprite("assets/ui/music.png", {
				uiMusic: [0, 0, 256,256]
			});
			Crafty.e('2D, Canvas, Mouse, uiMusic, ViewportRelative').attr({
				x: 0,
				y: 0,
				z: 100,
				w: 64,
				h: 64
			});
		})();
		Crafty.viewport.clampToEntities = false;
		Crafty.audio.play('music/town', -1); //TODO: Uncomment this once muting is implemented.

		mouselook.start();
	});
	return undefined;
});
