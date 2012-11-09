define([
	'config',
	'utils',
	'Crafty',
	'components/ViewportRelative',
	'components/IndependentCanvas',
	'components/IndependentCanvasDialog',
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
		_scrollOffset: 0,
		_boundCommitFunction: null, //The function that is bound to the 'commit' event of the version history.
		init: function() {
			this.requires('2D, ViewportRelative, Mouse, IndependentCanvas, IndependentCanvasDialog');
			this.bind('Remove', this._removed);
		},
		Gitk: function(baseElemId, x, y, w, h, versionHistory) {
			var self = this;
			this.IndependentCanvas(baseElemId);
			this.attr({x: x, y: y, w: w, h: h, z: config.zOffset.gitk});
			this._assets = {
				orbs: Crafty.asset('assets/ui/OrbzPrw.png'),
				dialog: Crafty.asset('assets/ui/dialog.olive.png'),
				arrows: Crafty.asset('assets/ui/arrows.png')
			};
			this._dialogContext = this.createCanvas(x, y, config.zOffset.gitk, w, h).getContext('2d');
			this._nodesContext = this.createCanvas(
				x + PADDING,
				y + PADDING,
				config.zOffset.gitk + 1,
				w - 2*PADDING,
				h - 2*PADDING
			).getContext('2d');

			this._versionHistory = versionHistory;
			this._boundCommitFunction = function(commit) {
				self._cachedCommitMarkersById = null; //invalidate cache
				self._drawNodes();
			};
			this._versionHistory.bind("Commit", this._boundCommitFunction);

			(function() {
				// Scroll buttons
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
				self._getCommitMarkersById().forEach(function(marker) {
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
					self._drawNodes(); /*TODO may be redundant, as the merge will trigger a commit event if it's not a fast-forward */
				}
			});
			this._drawDialog();
			this._drawNodes();
		},
		/**
		 * Converts from the marker's logical coordinates ((0,0) is the root, (1,0) is that root's first child, etc.), to
		 * pixel coordinates.
		 */
		_logicalCoordToPixelCoord: function(x, y) {
			return {
				x: (ORB_DST_SIZE + ORB_DST_HORZ_PAD) * x + (ORB_DST_HORZ_PAD / 2),
				y: (ORB_DST_SIZE + ORB_DST_VERT_PAD) * y + (ORB_DST_VERT_PAD / 2),
				w: ORB_DST_SIZE,
				h: ORB_DST_SIZE
			};
		},
		_drawDialog: function() {
			var ctx = this._dialogContext;
			var canvasWidth = ctx.canvas.width;
			var canvasHeight = ctx.canvas.height;
			this.drawDialog(ctx, this._assets.dialog, DIALOG_TILE_SIZE, 0, 0, canvasWidth,canvasHeight);
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
		_cachedCommitMarkersById: null,
		/**
		 * Returns a list of markers. Each marker is an object with the
		 * following structure:
		 * {
		 * 	commit: {...},
		 * 	breadth: 1,
		 * 	x: 1,
		 * 	y: 2,
		 * 	pixelCoord: {
		 * 		x: 100,
		 * 		y: 200,
		 * 	}
		 * }
		 */
		_getCommitMarkersById: function() {
			if (this._cachedCommitMarkersById != null) {
				return this._cachedCommitMarkersById;
			}
			var self = this;
			var allRevs = this._versionHistory.getAllRevs();
			if (allRevs.length == 0) {
				return [];
			}
			var i;
			// Convert to simply markers
			var retVal = [];
			for (i = 0; i < allRevs.length; i++) {
				retVal[i] = {
					commit : allRevs[i]
				};
			}
			// Calculate breadth
			function calcBreadthRecur(id) {
				var commit = allRevs[id];
				commit.childRevIds.forEach(calcBreadthRecur);
				if (commit.childRevIds.length === 0) {
					retVal[commit.id].breadth = 1;
				} else {
					var sum = 0;
					commit.childRevIds.forEach(function(id) {
						sum += retVal[id].breadth;
					});
					retVal[commit.id].breadth = sum;
				}
			}
			calcBreadthRecur(this._versionHistory.rootRevId());
			// Calculate x and y coordinates
			function setCoordsRecur(id, x, y) {
				var marker = retVal[id];
				marker.x = x;
				marker.y = y;
				var accum = y;
				marker.commit.childRevIds.forEach(function(id) {
					setCoordsRecur(id, x + 1, accum);
					accum += retVal[id].breadth;
				});
			}
			setCoordsRecur(self._versionHistory.rootRevId(), 0, 0);
			// Calculate pixelCoord
			retVal.forEach(function(marker) {
				marker.pixelCoords = self._logicalCoordToPixelCoord(
						marker.x, marker.y);
			});
			this._cachedCommitMarkersById = retVal;
			return retVal;
		},
		_drawNodes: function() {
			var self = this;
			var ctx = this._nodesContext;
			var commitMarkersById = this._getCommitMarkersById();
			ctx.save();
			ctx.clearRect(0, 0, this.w, this.h);
			ctx.translate(0, -this._scrollOffset);
			/* Draw lines making up the graph */
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			commitMarkersById.forEach(function(marker) {
				var coords = marker.pixelCoords;
				marker.commit.childRevIds.forEach(function(childId) {
					var childMarker = commitMarkersById[childId];
					var childCoords = childMarker.pixelCoords;
					ctx.moveTo(coords.x + coords.w/2, coords.y + coords.h/2);
					ctx.lineTo(childCoords.x + childCoords.w/2, childCoords.y + childCoords.h/2);
				});
			});
			ctx.stroke();
			/* Draw commit symbols */
			commitMarkersById.forEach(function(marker) {
				var maxDepth = self._versionHistory.getDepthLimit();
				var coords = marker.pixelCoords;
				var commitProps = self._commitProps(marker.commit);
				var spriteX, spriteY;
				if (marker.x >= maxDepth) {
					spriteX = 0;
					spriteY = 1;
				} else if (commitProps.isActive) {
					spriteX = 1;
					spriteY = 0;
				} else if (commitProps.isLeaf) {
					spriteX = 3;
					spriteY = 0;
				} else {
					spriteX = 2;
					spriteY = 0;
				}
				ctx.drawImage(
					self._assets.orbs,
					spriteX*ORB_SRC_SIZE, spriteY*ORB_SRC_SIZE, ORB_SRC_SIZE, ORB_SRC_SIZE,
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
			/* Draw depth limit line */
			var limitPixelCoord = this._logicalCoordToPixelCoord(5, 0);
			var limitX = limitPixelCoord.x + (limitPixelCoord.w / 2);
			ctx.strokeStyle = 'red';
			ctx.beginPath();
			ctx.moveTo(limitX, 0);
			//TODO: Probably better to draw this on another layer which ignores the canvas transforms?
			ctx.lineTo(limitX, 9999);
			ctx.stroke();
			ctx.restore();
		},
		_maxNodeYCoord: function() {
			var retVal = 0;
			this._getCommitMarkersById().forEach(function(marker) {
				retVal = Math.max(retVal, marker.pixelCoords.y + marker.pixelCoords.h);
			});
			return retVal;
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
			this._versionHistory.unbind("Commit", this._boundCommitFunction);
		}
	});
});
