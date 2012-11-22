define([
	'config',
	'utils',
	'interaction_dictionary',
	'Crafty',
	'components/ViewportRelative',
	'components/IndependentCanvas',
	'components/IndependentCanvasDialog',
], function(config, utils, interactionDictionary) {
	var NUM_FRAMES = 8; //There are 8 frames in our coin sprites.
	var FONT_SIZE = 20;
	Crafty.c('Coins', {
		_canvasContext: null,
		_coppers: 0,
		_w: 0,
		_h: 0,
		_asset_copper: null,
		_asset_silver: null,
		_asset_gold: null,
		Coins: function(baseElemId, x, y, cssZ, w, h, gameState) {
			this.requires('IndependentCanvas');
			this.IndependentCanvas(baseElemId);
			this._canvasContext = this.createCanvas(x, y, cssZ, w, h).getContext('2d');
			this._canvasContext.canvas.id = 'Coins';
			this._w = w;
			this._h = h;
			this._asset_copper = Crafty.asset('assets/ui/coin_copper.png');
			this._asset_silver = Crafty.asset('assets/ui/coin_silver.png');
			this._asset_gold = Crafty.asset('assets/ui/coin_gold.png');
			gameState.bind('CopperUpdated', _.bind(this._copperUpdated, this));
			this.bind('EnterFrame', this._redraw);
			this._copperUpdated(gameState);
		},
		_redraw: function() {
			var curTime = Date.now();
			var selectedFrame = Math.floor(curTime / 100) % NUM_FRAMES; //there 
			var ctx = this._canvasContext;
			ctx.clearRect(0, 0, this._w,this._h);
			ctx.save();
			ctx.font = FONT_SIZE+'px Patrick Hand';
			ctx.strokeStyle = 'black';
			ctx.fillStyle = 'white';
			ctx.textBaseline = 'top';
			function strokeFill(msg, x, y) {
				ctx.strokeText(msg, x, y);
				ctx.fillText(msg, x, y);
			}
			strokeFill(this._gold, 0, 0);
			ctx.drawImage(this._asset_gold,
				32 * selectedFrame, 0, 32, 32, //source
				10, 0, 32, 32); //destination
			strokeFill(this._silver, 42, 0);
			ctx.drawImage(this._asset_silver,
				32 * selectedFrame, 0, 32, 32, //source
				52, 0, 32, 32); //destination
			strokeFill(this._copper, 84, 0);
			ctx.drawImage(this._asset_copper,
				32 * selectedFrame, 0, 32, 32, //source
				94, 0, 32, 32); //destination
			ctx.restore();
		},
		_copperUpdated: function(gameState) {
			var rawCopper = gameState.getCopper();
			this._gold = Math.floor(rawCopper / config.coinValues.gold);
			rawCopper -= this._gold * config.coinValues.gold;
			this._silver = Math.floor(rawCopper / config.coinValues.silver);
			rawCopper -= this._silver * config.coinValues.silver;
			this._copper = rawCopper;
		}
	});
	return undefined;
});