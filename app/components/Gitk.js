define([
	'config',
	'Crafty',
	'components/ViewportRelative'
], function(config) {
	var DIALOG_TILE_SIZE = 16;
	var ORB_SRC_SIZE = 64;

	Crafty.c('Gitk', {
		_commitMarkersById: null,
		init: function() {
			this.requires('2D, ViewportRelative, Mouse');
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

			this.attr({x: x, y: y, w: w, h: h, z: config.zOffset.gitk});
			this._assets = {
				orbs: Crafty.asset('assets/ui/OrbzPrw.png'),
				dialog: Crafty.asset('assets/ui/dialog.olive.png')
			}
			this._context = canvas.getContext('2d');

			var self = this;
			this._versionHistory = versionHistory;
			this._versionHistory.bind("Commit", function(commit) {
				var marker = {commit: commit};
				var parentMarkers = commit.parentRevIds.map(function(parentId) { return self._commitMarkersById[parentId]; });
				if (parentMarkers.length === 0) {
					marker.x = 0;
					marker.y = 0;
				} else {
					marker.x = parentMarkers[0].x + 1;
					marker.y = parentMarkers[0].y + parentMarkers[0].commit.childRevIds.length - 1;
				}
				marker.pixelCoords = {x: 32*marker.x + 8, y: 32*marker.y + 8, w: 16, h: 16};
				self._commitMarkersById[commit.id] = marker;
				self._redraw();
			});

			this.bind('Click', function(ev) {
				var pos = Crafty.DOM.translate(ev.clientX, ev.clientY);
				var clickedMarker = null;
				pos.x -= self.x;
				pos.y -= self.y;
				self._forEachCommitMarker(function(marker) {
					var coords = marker.pixelCoords;
					var hit = (
						Crafty.math.withinRange(pos.x, coords.x, coords.x + coords.w)
						&& Crafty.math.withinRange(pos.y, coords.y, coords.y + coords.h)
					);
					if (hit) {
						clickedMarker = marker;
						return false;
					}
				});
				if (clickedMarker) {
					self._versionHistory.checkout(clickedMarker.commit.id);
					self._redraw();
				}
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
			var self = this;
			var ctx = this._context;
			this._forEachCommitMarker(function(marker) {
				var coords = marker.pixelCoords;
				var isActive = self._versionHistory.headRev() === marker.commit.id;
				var isLeaf = marker.commit.childRevIds.length === 0;
				var spriteX = isActive ? 1 : (isLeaf ? 3 : 2);
				ctx.drawImage(
					self._assets.orbs,
					spriteX*ORB_SRC_SIZE, 0, ORB_SRC_SIZE, ORB_SRC_SIZE, /* for the blue orb */
					coords.x, coords.y, coords.w, coords.h
				);
			});
		},
		_forEachCommitMarker: function(func) {
			var commitMarkersById = this._commitMarkersById;
			for (id in commitMarkersById) {
				if (commitMarkersById.hasOwnProperty(id)) {
					var marker = commitMarkersById[id];
					var funcRetVal = func(marker);
					if (funcRetVal === false) {
						break;
					}
				}
			}
		}
	});
});