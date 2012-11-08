define([ 'Crafty' ], function() {
	Crafty.c('VersionHistory', {
		init: function() {
			this._rootRevId = null;
			this._headRevId = null;
			this._revisions = [];
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
				data: data,
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
			// console.log(JSON.stringify(this._revisions));
			this.trigger("Commit", newRevision);
			return this._headRevId;
		},
		checkout: function(revId) {
			var rev = this._revisions[revId];
			this._headRevId = revId;
			this.trigger("Checkout", rev);
			return rev;
		},
		//Triggers the 'checkout' event on the current revision
		reset: function() {
			this.checkout(this._headRevId);
		}
	});
});
