define([
	'config',
	'utils',
	'interaction_dictionary',
	'Crafty',
	'components/ViewportRelative',
	'components/IndependentCanvas',
	'components/IndependentCanvasDialog',
], function(config, utils, interactionDictionary) {
	var FONT_SIZE = 20;
	Crafty.c('TaskList', {
		_canvasContext: null,
		/**
		 * An array of objects, each object representing a task. The objects have the following structure:
		 * 
		 * {
		 * 	label: 'Deliver newspapers (2/6)',
		 * 	done: false
		 * }
		 */
		tasks: null,
		_w: 0,
		_h: 0,
		_dialogAsset: null,
		init: function() {
			this.tasks = [];
		},
		TaskList: function(baseElemId, x, y, cssZ, w, h, gameState) {
			this.requires('IndependentCanvas');
			this.IndependentCanvas(baseElemId);
			this.requires('IndependentCanvasDialog');
			this._canvasContext = this.createCanvas(x, y, cssZ, w, h).getContext('2d');
			this._canvasContext.canvas.id = 'TaskList';
			this._w = w;
			this._h = h;
			this._dialogAsset = Crafty.asset('assets/ui/dialog.olive.png');
			gameState.bind('InteractionsUpdated', _.bind(this._interactionsUpdated, this));
			this.bind('Change', this._redraw);
			this._interactionsUpdated(gameState);
		},
		_redraw: function() {
			var i;
			var ctx = this._canvasContext;
			//this.drawDialog(ctx, this._dialogAsset, DIALOG_TILE_SIZE, 0, 0, this._w,this._h);
			ctx.clearRect(0, 0, this._w,this._h);
			if (this.tasks.length > 0) {
				ctx.save();
				ctx.font = FONT_SIZE+'px Patrick Hand';
				ctx.strokeStyle = 'black';
				ctx.fillStyle = 'white';
				ctx.textBaseline = 'top';
				function strokeFill(msg, x, y) {
					ctx.strokeText(msg, x, y);
					ctx.fillText(msg, x, y);
				}
				strokeFill("Objectives:", 0, 0);
				for (i = 0; i < this.tasks.length; i++) {
					var task = this.tasks[i];
					var prefix = task.done ? '[X] ' : '[ ] ';
					strokeFill(prefix + task.label, 0, FONT_SIZE * (i + 1));
				}
				ctx.restore();
			}
		},
		_interactionsUpdated: function(gameState) {
			var interactionCounts = gameState.getInteractionCounts();
			this.tasks = [];
			_.each(interactionCounts, function(num, interactionId) {
				var humanString = utils.interpolate(
					interactionDictionary[interactionId].taskString,
					{ num: num }
				);
				this.push({
					label: humanString ,
					done: false
				})
			}, this.tasks);
			console.log('Updated task list to be ', this.tasks);
			this.trigger('Change');
		}
	});
	return undefined;
});