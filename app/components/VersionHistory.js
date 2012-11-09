define([ 'Crafty', 'underscore' ], function() {
	Crafty.c('VersionHistory', {
		mergeFunc: function(base, ours, theirs) { return ours; }, /* Meant to be changed by caller */
		init: function() {
			this._rootRevId = null;
			this._headRevId = null;
			this._revisions = [];
		},
		VersionHistory: function(depthLimit) {
			this._depthLimit = depthLimit;
			return this;
		},
		getDepthLimit: function() {
			return this._depthLimit;
		},
		rootRevId: function() {
			return this._rootRevId;
		},
		headRevId: function() {
			return this._headRevId;
		},
		getRev: function(revId) {
			if (revId === undefined) {
				return this._revisions[this._headRevId];
			} else {
				return this._revisions[revId];
			}
		},
		commit: function(data) {
			var newRevId = this._revisions.length;
			var newRevision = {
				id: newRevId,
				data: Crafty.clone(data),
				childRevIds: []
			};
			if (this._headRevId !== null) {
				this._revisions[this._headRevId].childRevIds.push(newRevId);
				newRevision.parentRevIds = [this._headRevId];
			} else {
				this._rootRevId = newRevision.id;
				newRevision.parentRevIds = [];
			}

			this._revisions.push(newRevision);
			this._headRevId = newRevId;
			this.trigger("Commit", newRevision);
			this.trigger('HeadRevChanged', newRevision);
			return this._headRevId;
		},
		checkout: function(revId) {
			var rev = Crafty.clone(this._revisions[revId]);
			this._headRevId = revId;
			this.trigger("Checkout", rev);
			this.trigger('HeadRevChanged', rev);
			return rev;
		},
		merge: function(revId) {
			/* Compute the nearest common ancestor of the head commit and the given commit.
			 * This implementation is probably inefficient, but it's not worth optimizing
			 * unless it causes serious performance problems. */
			var baseRevId = _.max(_.intersection(this._ancestors(revId), this._ancestors(this._headRevId)));
			if (baseRevId === revId || baseRevId === this._headRevId) {
				/* Fast-forward */
				this.checkout(Math.max(revId, this._headRevId));
				return this._headRevId;
			} else {
				var mergeResult = this.mergeFunc(this._revisions[baseRevId].data, this._revisions[this._headRevId].data, this._revisions[revId].data);
				var resultRevId = this._revisions.length;
				var resultRev = {
					id: resultRevId,
					data: mergeResult,
					childRevIds: [],
					parentRevIds: [this._headRevId, revId] /* these IDs are ordered like in git: the first one is the "receiving" branch */
				};
				this._revisions[this._headRevId].childRevIds.push(resultRevId);
				this._revisions[revId].childRevIds.push(resultRevId);
				this._revisions.push(resultRev);
				this._headRevId = resultRevId;
				this.trigger("Commit", resultRev);
				this.trigger('HeadRevChanged', resultRev);
				return this._headRevId;
			}
		},
		//Triggers the 'checkout' event on the current revision
		reset: function() {
			this.checkout(this._headRevId);
		},
		_ancestors: function(revId) {
			var self = this;
			function ancestorsRec(revId) {
				var parentIds = self._revisions[revId].parentRevIds;
				return _.union.apply(null, [revId].concat(parentIds.map(ancestorsRec)));
			}
			return ancestorsRec(revId);
		}
	});
});
