define([], function() {
	var VersionHistory = function(initData) {
		this._headRevId = null;
		this._nextRevId = 1;
		this._revisions = {};

		this._revisions[this._nextRevId] = {
			id: this._nextRevId,
			parentRevIds: [],
			childRevIds: [],
			data: initData
		};
		this._headRevId = this._nextRevId;
		this._nextRevId += 1;
	}

	VersionHistory.prototype.show = function(revId) {
		if (revId === undefined) {
			return this._revisions[this._headRevId];
		} else {
			return this._revisions[revId].data;
		}
	};

	VersionHistory.prototype.commit = function(data) {
		this._revisions[this._headRevId].childRevIds.push(this._nextRevId);
		this._revisions[this._nextRevId] = {
			id: this._nextRevId,
			parentRevIds: [this._headRevId],
			childRevIds: [],
			data: data
		};
		this._headRevId = this._nextRevId
		this._nextRevId += 1;
		// console.log(JSON.stringify(this._revisions));
		return this._headRevId;
	};

	return VersionHistory;
});