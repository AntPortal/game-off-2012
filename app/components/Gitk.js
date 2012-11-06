define([ 'config', 'Crafty' ], function(config) {
	var DIALOG_TILE_SIZE = 16;
	var ORB_SRC_SIZE = 64;

	Crafty.c('Gitk', {
		_commitMarkersById: null,
		init: function() {
			this._commitMarkersById = {};
		},
		Gitk: function(baseElemId, x, y, w, h, versionHistory) {
			var refElem = document.getElementById(baseElemId);
			var canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			canvas.style.position = 'absolute';
			canvas.style.top = y+'px';
			canvas.style.left = x+'px';
			canvas.style.width = w+'px';
			canvas.style.height = h+'px';
			canvas.style.zIndex = 100;
			refElem.appendChild(canvas);

			this._assets = {
				orbs: Crafty.asset('assets/ui/OrbzPrw.png'),
				dialog: Crafty.asset('assets/ui/dialog.olive.png')
			}
			this._context = canvas.getContext('2d');

			var self = this;
			this._versionHistory = versionHistory;
			this._versionHistory.bind("Commit", function(commit) {
				var marker = {commit: commit, active: true};
				var parentMarkers = commit.parentRevIds.map(function(parentId) { return self._commitMarkersById[parentId]; });
				parentMarkers.forEach(function(marker) { marker.active = false; });
				if (parentMarkers.length === 0) {
					marker.x = 0;
					marker.y = 0;
				} else {
					marker.x = parentMarkers[0].x + 1;
					marker.y = parentMarkers[0].y + parentMarkers[0].commit.childRevIds.length - 1;
				}
				self._commitMarkersById[commit.id] = marker;
				self._redraw();
			});
			this._redraw();
		},
		_redraw: function() {
			this._drawDialog();
			this._drawMarkers();
		},
		_drawDialog: function() {
			var ctx = this._context;
			var canvasWidth = ctx.canvas.width;
			var canvasHeight = ctx.canvas.height;
			/* Draw upper-left part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				0, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				0, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw upper-center part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				DIALOG_TILE_SIZE, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				DIALOG_TILE_SIZE, 0, canvasWidth - 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw upper-right part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				2*DIALOG_TILE_SIZE, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				canvasWidth - DIALOG_TILE_SIZE, 0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw center-left part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				0, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, canvasHeight - 2*DIALOG_TILE_SIZE
			);
			/* Draw center part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, canvasWidth - 2*DIALOG_TILE_SIZE, canvasHeight - 2*DIALOG_TILE_SIZE
			);
			/* Draw center-right part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				canvasWidth - DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, canvasHeight - 2*DIALOG_TILE_SIZE
			);
			/* Draw lower-left part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				0, 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				0, canvasHeight - DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw lower-center part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				DIALOG_TILE_SIZE, 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				DIALOG_TILE_SIZE, canvasHeight - DIALOG_TILE_SIZE, canvasWidth - 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
			/* Draw lower-right part of dialog */
			ctx.drawImage(
				this._assets.dialog,
				2*DIALOG_TILE_SIZE, 2*DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE,
				canvasWidth - DIALOG_TILE_SIZE, canvasHeight - DIALOG_TILE_SIZE, DIALOG_TILE_SIZE, DIALOG_TILE_SIZE
			);
		},
		_drawMarkers: function() {
			var ctx = this._context;
			var commitMarkersById = this._commitMarkersById;
			for (id in commitMarkersById) {
				if (commitMarkersById.hasOwnProperty(id)) {
					var marker = commitMarkersById[id];
					var spriteX = marker.active ? 3 : 2;
					ctx.drawImage(
						this._assets.orbs,
						spriteX*ORB_SRC_SIZE, 0, ORB_SRC_SIZE, ORB_SRC_SIZE, /* for the blue orb */
						32*marker.x + 8, 32*marker.y + 8, 16, 16
					);
				}
			}
		}
	});
});