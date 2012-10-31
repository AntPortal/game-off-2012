define(['config', 'utils', 'Crafty'], function(config) {
	/**
	 * Defines a character, either a playable one, or an AI one.
	 */
	Crafty.c('Character', {
		_targetX: 0, //in world coordinates
		_targetY: 0, //in world coordinates
		heightMap: null, //Must be set by caller!
		worldToPixel: null, //Must be set by caller!
		init: function() {
			this.requires('2D');
			this.bind('EnterFrame', this._enterFrame);
		},
		Character: function(heightMap, worldToPixel, initialX, initialY) {
			this.heightMap = heightMap;
			this.worldToPixel = worldToPixel;
			var initialZ = heightMap[initialX+','+initialY].surfaceZ;
			this.setPos(initialX,initialY,initialZ);
			return this;
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
			var bottomPixelCoord = this.worldToPixel(worldX, worldY, worldZ);
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
				newX = Crafty.math.lerp(curTilePixelTopLeft.x, this.x, 0.9);
				newY = Crafty.math.lerp(curTilePixelTopLeft.y, this.y, 0.9);
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
				/* 192 is the squared distance between the center of a tile "diamond" and the midpoint of any of its edges. */
				if (Crafty.math.squaredDistance(curTilePixelTopLeft.x, curTilePixelTopLeft.y, this.x, this.y) < 192) {
					this.z = this.tileX + this.tileY + Math.ceil(this.tileZ);
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
				this.tileZ = this.heightMap[this.tileX+','+this.tileY].surfaceZ;
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
	console.log('Character component defined.');
});