define(['config', 'path_finder', 'Crafty'], function(config, PathFinder) {
	/**
	 * Defines a character, either a playable one, or an AI one. In the case of an
	 * AI one, consider using the NPC component instead.
	 */
	Crafty.c('Character', {
		_targetX: 0, //in world coordinates
		_targetY: 0, //in world coordinates
		_pathToTarget: null,
		_spriteName: '', //E.g. 'hero', from which 'sprite_hero_N0' will be derived.
		_facing: 'S', //One of 'N', 'E', 'S' or 'W'.
		_currentSprite: null,
		_frameOffset: 0,
		properties: null, //Must be set by caller!
		heightMap: null, //Must be set by caller!
		worldToPixel: null, //Must be set by caller!
		init: function() {
			this.requires('2D');
			this.bind('EnterFrame', this._enterFrame);
			this._frameOffset = Crafty.math.randomInt(0, 100); //So that not all characters are exactly in sync.
		},
		Character: function(heightMap, worldToPixel, initialX, initialY, properties) {
			this.properties = properties;
			this._spriteName = properties.sprite;
			this._currentSprite = 'sprite_' + this._spriteName + '_S0';
			this.addComponent(this._currentSprite);
			this.heightMap = heightMap;
			this.worldToPixel = worldToPixel;
			var initialZ = heightMap[initialX+','+initialY].surfaceZ;
			this.setPos(initialX,initialY,initialZ);
			this._targetX = initialX;
			this._targetY = initialY;
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
			var self = this;
			var startTile = this.heightMap[this.tileX+','+this.tileY];
			this._targetX = worldX;
			this._targetY = worldY;
			/* TODO: remove this method; characters don't walk anymore */
		},
		_getTopLeftPixelCoords: function(worldX, worldY, worldZ) {
			var bottomPixelCoord = this.worldToPixel(worldX, worldY, worldZ);
			return {
				x: bottomPixelCoord.pixelX - (this.w / 2),
				y: bottomPixelCoord.pixelY - (config.TILE_IMAGE_SIZE / 4) - this.h
			};
		},
		_updatePosition: function() {
			var curTilePixelTopLeft = this._getTopLeftPixelCoords(this.tileX, this.tileY, this.tileZ);
			if (curTilePixelTopLeft.x != this.x || curTilePixelTopLeft.y != this.y) {
				//Not aligned in tile, so move towards proper position within tile.
				var newX, newY;
				newX = Math.round(Crafty.math.lerp(curTilePixelTopLeft.x, this.x, 0.9));
				newY = Math.round(Crafty.math.lerp(curTilePixelTopLeft.y, this.y, 0.9));
				if (newY < this.y) {
					this._facing = 'N';
				} else if (newY > this.y) {
					this._facing = 'S';
				} else if (newX < this.x) {
					this._facing = 'W';
				} else if (newX > this.X) {
					this._facing = 'E';
				}
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
			} else if (this._pathToTarget !== null && this._pathToTarget.length > 0) {
				var nextTile = this._pathToTarget.shift();
				this.tileX = nextTile.state.tileX;
				this.tileY = nextTile.state.tileY;
				this.tileZ = this.heightMap[this.tileX+','+this.tileY].surfaceZ;
			}
		},
		_enterFrame: function(e) {
			this._updatePosition();
			var frame = Math.floor((e.frame + this._frameOffset) / 10) % 4;
			var frameMap = {
					0: 0,
					1: 1,
					2: 2,
					3: 1,
			};
			var newFacing = 'sprite_' + this._spriteName + '_' + this._facing + frameMap[frame];
			if (newFacing != this._currentSprite) {
				this.removeComponent(this._currentSprite);
				this._currentSprite = newFacing;
				this.addComponent(this._currentSprite);
			}
		}
	});
});