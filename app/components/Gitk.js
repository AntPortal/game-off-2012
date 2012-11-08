define([
	'config',
	'utils',
	'Crafty',
	'components/ViewportRelative'
], function(config, utils) {
	var DIALOG_TILE_SIZE = 16;
	var PADDING = DIALOG_TILE_SIZE / 2;
	var ARROW_SRC_SIZE = 16;
	var SCROLL_BUTTON_SIZE = 16;
	var SCROLL_RIGHT_PADDING = 8;
	var SCROLL_VERT_PADDING = 8;
	var ORB_SRC_SIZE = 64;
	var ORB_DST_SIZE = 16;
	var ORB_DST_HORZ_PAD = 16;
	var ORB_DST_VERT_PAD = 8;
	var MERGE_BUTTON_LEFT_PADDING = 8;
	var MERGE_BUTTON_WIDTH = 40;
	var MERGE_BUTTON_HEIGHT = 16;

	Crafty.c('Gitk', {
		_commitMarkersById: null,
		_breadthsById: null,
		_scrollOffset: 0,
		_refElem: null, //the HTML DOM element that will contain any created canvases.
		_boundCommitFunction: null, //The function that is bound to the 'commit' event of the version history.
		init: function() {
			this.requires('2D, ViewportRelative, Mouse');
			this._commitMarkersById = {};
			this._breadthsById = {};
			this.bind('Remove', this._removed);
		},
		Gitk: function(baseElemId, x, y, w, h, versionHistory) {
			var self = this;
			this._refElem = document.getElementById(baseElemId);
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
				self._refElem.appendChild(canvas);
				return canvas;
			}

			this.attr({x: x, y: y, w: w, h: h, z: config.zOffset.gitk});
			this._assets = {
				orbs: Crafty.asset('assets/ui/OrbzPrw.png'),
				dialog: Crafty.asset('assets/ui/dialog.olive.png'),
				arrows: Crafty.asset('assets/ui/arrows.png')
			};
			this._dialogContext = makeCanvas(x, y, w, h, config.zOffset.gitk).getContext('2d');
			this._nodesContext = makeCanvas(
				x + PADDING,
				y + PADDING,
				w - 2*PADDING,
				h - 2*PADDING,
				config.zOffset.gitk + 1
			).getContext('2d');

			this._versionHistory = versionHistory;
			this._boundCommitFunction = function(commit) {
				var marker = {commit: commit};
				self._commitMarkersById[commit.id] = marker;
				self._calcBreadths();
				function setCoordsRecur(id, x, y) {
					var marker = self._commitMarkersById[id];
					marker.x = x;
					marker.y = y;
					var accum = y;
					marker.commit.childRevIds.forEach(function(id) {
						setCoordsRecur(id, x+1, accum);
						accum += self._breadthsById[id];
					});
				}
				setCoordsRecur(self._versionHistory.rootRevId(), 0, 0);

				self._forEachCommitMarker(function(marker) {
					marker.pixelCoords = {
						x: (ORB_DST_SIZE + ORB_DST_HORZ_PAD) * marker.x + (ORB_DST_HORZ_PAD / 2),
						y: (ORB_DST_SIZE + ORB_DST_VERT_PAD) * marker.y + (ORB_DST_VERT_PAD / 2),
						w: ORB_DST_SIZE,
						h: ORB_DST_SIZE};
				});
				self._drawNodes();
			};
			this._versionHistory.bind("Commit", this._boundCommitFunction);

			(function() {
				var canvas = self._dialogContext.canvas;
				var canvasWidth = canvas.width;
				var canvasHeight = canvas.height;
				self._upperButtonBounds = {
					x: canvasWidth - SCROLL_BUTTON_SIZE - SCROLL_RIGHT_PADDING,
					y: SCROLL_VERT_PADDING,
					w: SCROLL_BUTTON_SIZE,
					h: SCROLL_BUTTON_SIZE
				};
				self._lowerButtonBounds = {
					x: canvasWidth - SCROLL_BUTTON_SIZE - SCROLL_RIGHT_PADDING,
					y: canvasHeight - SCROLL_BUTTON_SIZE - SCROLL_VERT_PADDING,
					h: SCROLL_BUTTON_SIZE,
					w: SCROLL_BUTTON_SIZE
				};
				var scrollDir = 0;
				self.bind('MouseDown', function(ev) {
					var pos = Crafty.DOM.translate(ev.clientX, ev.clientY);
					/* Translate pos so that it's relative to the outer canvas (the one with the background). */
					pos.x -= self.x;
					pos.y -= self.y;
					var hitUpper = utils.pointInRect(pos, self._upperButtonBounds);
					var hitLower = utils.pointInRect(pos, self._lowerButtonBounds);
					if (hitUpper) {
						scrollDir = -1;
					} else if (hitLower) {
						scrollDir = 1;
					} else {
						scrollDir = 0;
					}
				});
				self.bind('MouseUp', function(ev) {
					scrollDir = 0;
				});
				self.bind('EnterFrame', function(ev) {
					var oldScrollOffset = self._scrollOffset;
					var maxScrollOffset = Math.max(0, this._maxNodeYCoord() - self._nodesContext.canvas.height);
					self._scrollOffset += scrollDir * 8;
					self._scrollOffset = Crafty.math.clamp(self._scrollOffset, 0, maxScrollOffset);
					if (oldScrollOffset !== self._scrollOffset) {
						self._drawNodes();
					}
				});
			})();

			this.bind('Click', function(ev) {
				var pos = Crafty.DOM.translate(ev.clientX, ev.clientY);
				var clickedMarker = null;
				var clickedMerge = false;
				/* Translate pos so that it's relative to the inner canvas (the one with the nodes). */
				pos.x -= (self.x + PADDING);
				pos.y -= (self.y + PADDING - self._scrollOffset);
				self._forEachCommitMarker(function(marker) {
					var coords = marker.pixelCoords;
					var hit = utils.pointInRect(pos, coords);
					if (hit) {
						clickedMarker = marker;
						return false;
					}

					var commitProps = self._commitProps(marker.commit);
					if (commitProps.isMergeable && utils.pointInRect(pos, self._getMergeButtonCoords(marker))) {
						clickedMarker = marker;
						clickedMerge = true;
						return false;
					}
				});
				if (clickedMarker) {
					if (clickedMerge) {
						self._versionHistory.merge(clickedMarker.commit.id);
					} else {
						self._versionHistory.checkout(clickedMarker.commit.id);
					}
					self._drawNodes(); /* may be redundant, as the merge will trigger a commit event if it's not a fast-forward */
				}
			});
			this._drawDialog();
			this._drawNodes();
		},
		_calcBreadths: function() {
			var self = this;
			this._breadthsById = {};
			function calcBreadthRecur(id) {
				var commit = self._versionHistory.getRev(id);
				commit.childRevIds.forEach(calcBreadthRecur);
				if (commit.childRevIds.length === 0) {
					self._breadthsById[commit.id] = 1;
				} else {
					var sum = 0;
					commit.childRevIds.forEach(function(id) {
						sum += self._breadthsById[id];
					});
					self._breadthsById[commit.id] = sum;
				}
			}
			calcBreadthRecur(this._versionHistory.rootRevId());
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
			/* Draw arrows */
			ctx.drawImage(
				this._assets.arrows,
				0, 0, ARROW_SRC_SIZE, ARROW_SRC_SIZE,
				this._upperButtonBounds.x, this._upperButtonBounds.y, this._upperButtonBounds.w, this._upperButtonBounds.h
			);
			ctx.drawImage(
				this._assets.arrows,
				0, ARROW_SRC_SIZE, ARROW_SRC_SIZE, ARROW_SRC_SIZE,
				this._lowerButtonBounds.x, this._lowerButtonBounds.y, this._lowerButtonBounds.w, this._lowerButtonBounds.h
			);
		},
		_drawNodes: function() {
			var self = this;
			var ctx = this._nodesContext;
			ctx.save();
			ctx.clearRect(0, 0, this.w, this.h);
			ctx.translate(0, -this._scrollOffset);
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
				var commitProps = self._commitProps(marker.commit);
				var spriteX = commitProps.isActive ? 1 : (commitProps.isLeaf ? 3 : 2);
				ctx.drawImage(
					self._assets.orbs,
					spriteX*ORB_SRC_SIZE, 0, ORB_SRC_SIZE, ORB_SRC_SIZE, /* for the blue orb */
					coords.x, coords.y, coords.w, coords.h
				);
				if (commitProps.isMergeable) {
					var mergeCoords = self._getMergeButtonCoords(marker);
					ctx.fillStyle = 'yellow';
					ctx.fillRect(mergeCoords.x, mergeCoords.y, mergeCoords.w, mergeCoords.h);
					ctx.fillStyle = 'black';
					ctx.fillText("Merge", mergeCoords.x + 2, mergeCoords.y + mergeCoords.h - 2);
				}
			});
			ctx.restore();
		},
		_maxNodeYCoord: function() {
			var retVal = 0;
			this._forEachCommitMarker(function(marker) {
				retVal = Math.max(retVal, marker.pixelCoords.y + marker.pixelCoords.h);
			});
			return retVal;
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
		},
		_commitProps: function(commit) {
			var isActive = this._versionHistory.headRevId() === commit.id;
			var isLeaf = commit.childRevIds.length === 0;
			return {
				isActive: isActive,
				isLeaf: isLeaf,
				isMergeable: !isActive && isLeaf /* TODO: account for other criteria, like timestamps */
			};
		},
		_getMergeButtonCoords: function(marker) {
			return {
				x: marker.pixelCoords.x + marker.pixelCoords.w + MERGE_BUTTON_LEFT_PADDING,
				y: marker.pixelCoords.y,
				w: MERGE_BUTTON_WIDTH,
				h: MERGE_BUTTON_HEIGHT
			};
		},
		_removed: function() {
			this._refElem.removeChild(this._dialogContext.canvas);
			this._refElem.removeChild(this._nodesContext.canvas);
			this._versionHistory.unbind("Commit", this._boundCommitFunction);
		}
	});
});
