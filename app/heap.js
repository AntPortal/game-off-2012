define([], function() {
	function Heap(comparator) {
		this._array = [];
		this._comparator = comparator;
	}

	Heap.prototype.isEmpty = function() {
		return this._array.length === 0;
	}

	Heap.prototype.add = function(item) {
		var newItemIndex = this._array.length;
		this._array.push(item);
		if (this._array.length === 1) { return; }


		var parentIndex = this._parentIndex(newItemIndex);
		while (this._compareAt(newItemIndex, parentIndex) < 0) {
			this._swapAt(newItemIndex, parentIndex);
			newItemIndex = parentIndex;
			parentIndex = this._parentIndex(newItemIndex);
		}
	}

	Heap.prototype.removeMin = function() {
		var retVal = this._array[0];
		this._array[0] = this._array.pop();
		this._reheapify(0);
		return retVal;
	}

	Heap.prototype._parentIndex = function(idx) {
		return Math.floor((idx - 1) / 2);
	}

	Heap.prototype._reheapify = function(startIndex) {
		var leftChildIndex = 2*startIndex + 1;
		var rightChildIndex = leftChildIndex + 1;
		var smallest = startIndex;
		if (leftChildIndex < this._array.length && this._compareAt(leftChildIndex, smallest) < 0) {
			smallest = leftChildIndex;
		}
		if (rightChildIndex < this._array.length && this._compareAt(rightChildIndex, smallest) < 0) {
			smallest = rightChildIndex;
		}
		if (smallest !== startIndex) {
			this._swapAt(smallest, startIndex);
			this._reheapify(smallest);
		}
	}

	Heap.prototype._swapAt = function(i1, i2) {
		var tmp = this._array[i1];
		this._array[i1] = this._array[i2];
		this._array[i2] = tmp;
	}

	Heap.prototype._compareAt = function(i1, i2) {
		return this._comparator(this._array[i1], this._array[i2]);
	}

	return Heap;
});