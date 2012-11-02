define([ 'Crafty' ], function() {
	Crafty.c('VersionHistory', {
		init: function() {
			this._headRevId = null;
			this._nextRevId = 1;
			this._revisions = {};
		},
		show: function(revId) {
			if (revId === undefined) {
				return this._revisions[this._headRevId];
			} else {
				return this._revisions[revId].data;
			}
		},
		commit: function(data) {
			var newRevision = {
				id: this._nextRevId,
				data: data,
				childRevIds: [],
			};
			if (this._headRevId !== null) {
				this._revisions[this._headRevId].childRevIds.push(this._nextRevId);
				newRevision.parentRevIds = [this._headRevId];
			} else {
				newRevision.parentRevIds = [];
			}

			this._revisions[this._nextRevId] = newRevision;
			this._headRevId = this._nextRevId
			this._nextRevId += 1;
			// console.log(JSON.stringify(this._revisions));
			return this._headRevId;
		}
	});
});