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
			var self = this;

			function makeCanvas(x, y, w, h, zIndex) {
				var canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;
				canvas.style.position = 'absolute';
				canvas.style.top = y+'px';
				canvas.style.left = x+'px';
				canvas.style.width = w+'px';
				canvas.style.height = h+'px';
				canvas.style.zIndex = zIndex;
				refElem.appendChild(canvas);
				return canvas;
			}

			this.attr({x: x, y: y, w: w, h: h, z: config.zOffset.gitk});
			this._assets = {
				orbs: Crafty.asset('assets/ui/OrbzPrw.png'),
				dialog: Crafty.asset('assets/ui/dialog.olive.png')
			}
			this._dialogContext = makeCanvas(x, y, w, h, 100).getContext('2d');
			this._nodesContext = makeCanvas(x, y, w, h, 101).getContext('2d');

			var self = this;
			this._versionHistory = versionHistory;

			function calcBreadths() {
				var breadthsById = {};
				function calcBreadthRecur(id) {
					var commit = self._versionHistory.getRev(id);
					console.log(commit);
					commit.childRevIds.forEach(calcBreadthRecur);
					if (commit.childRevIds.length === 0) {
						breadthsById[commit.id] = 1;
					} else {
						var sum = 0;
						commit.childRevIds.forEach(function(id) {
							sum += breadthsById[id];
						});
						breadthsById[commit.id] = sum;
					}
				}
				calcBreadthRecur(self._versionHistory.rootRevId());
				return breadthsById;
			}

			this._versionHistory.bind("Commit", function(commit) {
				var marker = {commit: commit};
				self._commitMarkersById[commit.id] = marker;

				var breadthsById = calcBreadths();
				function setCoordsRecur(id, x, y) {
					var marker = self._commitMarkersById[id];
					marker.x = x;
					marker.y = y;
					var accum = y;
					marker.commit.childRevIds.forEach(function(id) {
						setCoordsRecur(id, x+1, accum);
						accum += breadthsById[id];
					});
				}
				setCoordsRecur(self._versionHistory.rootRevId(), 0, 0);

				self._forEachCommitMarker(function(marker) {
					marker.pixelCoords = {x: 32*marker.x + 8, y: 32*marker.y + 8, w: 16, h: 16};
				});
				self._drawNodes();
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
					self._drawNodes();
				}
			});
			this._drawDialog();
			this._drawNodes();
		},
		_drawDialog: function() {
			var ctx = this._dialogContext;
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
		_drawNodes: function() {
			var self = this;
			var ctx = this._nodesContext;
			ctx.clearRect(0, 0, this.w, this.h);
			/* Draw lines making up the graph */
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			this._forEachCommitMarker(function(marker) {
				var coords = marker.pixelCoords;
				marker.commit.childRevIds.forEach(function(childId) {
					var childMarker = self._commitMarkersById[childId];
					var childCoords = childMarker.pixelCoords;
					ctx.moveTo(coords.x + coords.w/2, coords.y + coords.h/2);
					ctx.lineTo(childCoords.x + childCoords.w/2, childCoords.y + childCoords.h/2);
				});
			});
			ctx.stroke();
			/* Draw commit symbols */
			this._forEachCommitMarker(function(marker) {
				var coords = marker.pixelCoords;
				var isActive = self._versionHistory.headRevId() === marker.commit.id;
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