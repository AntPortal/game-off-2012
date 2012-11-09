define(
	[ 'Crafty'],
function() {
	/**
	 * Implements drawing a dialog on an canvas not managed by Crafty.
	 */
	Crafty.c('IndependentCanvasDialog', {
		init : function() {
			//Does nothing
		},
		drawDialog: function(ctx, dialogAsset, DIALOG_TILE_SIZE, x, y, w, h) {
			/* Draw upper-left part of dialog */
			ctx.drawImage(
				dialogAsset,
				0, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x, y, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw upper-center part of dialog */
			ctx.drawImage(
				dialogAsset,
				DIALOG_TILE_SIZE, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x+DIALOG_TILE_SIZE, y, w - 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw upper-right part of dialog */
			ctx.drawImage(
				dialogAsset,
				2*DIALOG_TILE_SIZE, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x+w-DIALOG_TILE_SIZE, y, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw center-left part of dialog */
			ctx.drawImage(
				dialogAsset,
				0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x, y+DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, h - 2*DIALOG_TILE_SIZE
			);
			/* Draw center part of dialog */
			ctx.drawImage(
				dialogAsset,
				DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x+DIALOG_TILE_SIZE, y+DIALOG_TILE_SIZE, w - 2*DIALOG_TILE_SIZE, h - 2*DIALOG_TILE_SIZE
			);
			/* Draw center-right part of dialog */
			ctx.drawImage(
				dialogAsset,
				2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x + w - DIALOG_TILE_SIZE, y+DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, h - 2*DIALOG_TILE_SIZE
			);
			/* Draw lower-left part of dialog */
			ctx.drawImage(
				dialogAsset,
				0, 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x, y+h - DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw lower-center part of dialog */
			ctx.drawImage(
				dialogAsset,
				DIALOG_TILE_SIZE, 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x+DIALOG_TILE_SIZE, y+h - DIALOG_TILE_SIZE, w - 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw lower-right part of dialog */
			ctx.drawImage(
				dialogAsset,
				2*DIALOG_TILE_SIZE, 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				x+w - DIALOG_TILE_SIZE, y+h - DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
		},
	});
	return undefined;
});
