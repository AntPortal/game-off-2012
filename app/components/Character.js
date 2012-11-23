define([
	'config',
	'Crafty',
	'components/IndependentCanvas'
], function(config) {
	var PIXEL_PER_CHAR = 20;
	var canvas = (
		Crafty.e('IndependentCanvas')
			.IndependentCanvas('cr-stage')
			.createCanvas(0, 0, config.zOffset.game, config.viewport.width, config.viewport.height)
	);
	canvas.id = 'Characters';
	var canvasContext = canvas.getContext('2d');

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
		worldToPixel: null, //Must be set by caller!
		init: function() {
			this.requires('2D');
			this._frameOffset = Crafty.math.randomInt(0, 100); //So that not all characters are exactly in sync.
		},
		Character: function(worldToPixel, initialX, initialY, initialZ, properties) {
			this.properties = properties;
			this._spriteName = properties.sprite;
			this._asset = Crafty.asset('assets/sprites/' + this._spriteName + '.png');
			this.w = Math.round(this._asset.width / 3);
			this.h = Math.round(this._asset.height / 4);
			this.worldToPixel = worldToPixel;
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
		_getTopLeftPixelCoords: function(worldX, worldY, worldZ) {
			var bottomPixelCoord = this.worldToPixel(worldX, worldY, worldZ);
			return {
				x: bottomPixelCoord.pixelX - (this.w / 2),
				y: bottomPixelCoord.pixelY - (config.TILE_IMAGE_SIZE / 4) - this.h
			};
		}
	});

	var characterDrawer = Crafty.e('');
	Crafty.bind("SceneChange", function(e) {
		if (e.newScene === "level1") {
			var backgroundAsset = Crafty.asset('assets/maps/level1.png');
			var dialogIconAsset = Crafty.asset('assets/ui/comment_new_large.png');
			console.log(backgroundAsset);
			characterDrawer.bind("EnterFrame", function(e) {
				var chars = Crafty('NPC');
				var MAGIC_BACKGROUND_X_OFFSET = 1871; /* Determined empirically; not related to the year Babbage invented his computer. */
				var bgsx = Crafty.math.clamp(MAGIC_BACKGROUND_X_OFFSET - Crafty.viewport.x, 0, config.background.width);
				var bgsy = Crafty.math.clamp(-Crafty.viewport.y, 0, config.background.height);
				var bgsw = Crafty.math.clamp(config.background.width - bgsx, 0, config.viewport.width);
				var bgsh = Crafty.math.clamp(config.background.height - bgsy, 0, config.viewport.height);
				var bgdx = Crafty.math.clamp(Crafty.viewport.x - MAGIC_BACKGROUND_X_OFFSET, 0, config.viewport.width);
				var bgdy = Crafty.math.clamp(Crafty.viewport.y, 0, config.viewport.height);

				canvasContext.clearRect(0, 0, config.viewport.width, config.viewport.height);
				canvasContext.drawImage(
					backgroundAsset,
					bgsx, bgsy, bgsw, bgsh,
					bgdx, bgdy, bgsw, bgsh
				);
				canvasContext.font = PIXEL_PER_CHAR+'px Patrick Hand';
				canvasContext.strokeStyle = 'black';
				canvasContext.fillStyle = 'white';
				canvasContext.textBaseline = 'top';
				for (var i = 0, n = chars.length; i < n; i++) {
					var c = Crafty(chars[i]);
					var frame = Math.floor((e.frame + c._frameOffset) / 10) % 4;
					var frameMap = {
						0: 0,
						1: 1,
						2: 2,
						3: 1,
					};

					var w = Math.round(c._asset.width / 3);
					var h = Math.round(c._asset.height / 4);
					var sx = frameMap[frame]*w;
					var sy = h*2;
					var dx = Math.round(c.x + Crafty.viewport.x - w + (config.TILE_IMAGE_SIZE/2));
					var dy = Math.round(c.y + Crafty.viewport.y);

					if (c.hasReferrableInteraction) {
						canvasContext.drawImage(dialogIconAsset, dx - 8, dy - 16); // empirical values
					}

					canvasContext.drawImage(c._asset, sx, sy, w, h, dx, dy, w, h);

					var estimatedLabelWidth = c.properties.name.length * PIXEL_PER_CHAR / 2.5 //2.5 was determined empirically
					var labelX = dx + ((w - estimatedLabelWidth)/ 2);
					canvasContext.strokeText(c.properties.name, labelX, dy + 30);
					canvasContext.fillText(c.properties.name, labelX, dy + 30);
				}
			});
		}
	});
});