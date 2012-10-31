define([
		'config',
		'maps/level1-intro.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag'
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('level1-intro', function() {
		var hero; //entity global to this scene
		var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			console.log('Clicked on');
			console.log({
				x: tileEntity.tileX,
				y: tileEntity.tileY,
				z: tileEntity.surfaceZ
			});
			if (hero) {
				hero.setWalkTarget(tileEntity.tileX, tileEntity.tileY);
			}
		});
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
						y: bottomPixelCoord.pixelY - (config.TILE_IMAGE_SIZE / 4) - this.h
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
			utils.addMusicControlEntity(Crafty);
		})();
		Crafty.viewport.clampToEntities = false;
		Crafty.audio.play('music/town', -1, utils.effectiveVolume('music/town'));
		mouselook.start();
	});
	return undefined;
});
