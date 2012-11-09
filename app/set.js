define([], function() {
	function Set(keyFunc) {
		this._keyFunc = keyFunc;
		this._map = {};
	}

	Set.prototype.add = function(item) {
		this._map[this._keyFunc(item)] = 1;
	}

	Set.prototype.remove = function(item) {
		delete this._map[this._keyFunc(item)];
	}

	Set.prototype.contains = function(item) {
		return Object.prototype.hasOwnProperty.call(this._map, this._keyFunc(item));
	}

	return Set;
});