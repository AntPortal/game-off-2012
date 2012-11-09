define(['heap', 'set'], function(Heap, Set) {
	/**
	 * Creates a new path-finder for a specific problem. problemParams
	 * must be an object with the following keys:
	 *
	 * actions: a function that accepts a state and returns an array containing the actions allowed there
	 * result: a function that accepts a state and action and returns the resulting state
	 * cost: a function that accepts a state and action and returns the action's cost
	 * stateKey: a function that accepts a state and returns a key uniquely identifying that state.
	 *           The key must be suitable for use as a JavaScript object property.
	 */
	function PathFinder(problemParams) {
		this._problemParams = problemParams;
	}

	PathFinder.prototype.findPath = function(initState, goalTest) {
		var self = this;
		var node = {
			state: initState,
			parent: null,
			action: null,
			pathCost: 0
		};
		var frontier = {
			_heap: new Heap(function(n1,n2) { return n1.pathCost - n2.pathCost; }),
			_set: new Set(function(node) { return self._problemParams.stateKey(node.state); }),
			add: function(node) {
				this._heap.add(node);
				this._set.add(node);
			},
			removeMin: function() {
				var result = this._heap.removeMin();
				this._set.remove(result);
				return result;
			},
			isEmpty: function() {
				return this._heap.isEmpty();
			},
			contains: function(node) {
				return this._set.contains(node);
			}
		};
		frontier.add(node);
		var explored = new Set(this._problemParams.stateKey);

		while (true) {
			if (frontier.isEmpty()) {
				return null;
			}
			node = frontier.removeMin();
			if (goalTest(node.state)) {
				return this._solution(node);
			}
			explored.add(node.state);

			this._problemParams.actions(node.state).forEach(function(action) {
				var child = self._childNode(node, action);
				if (!explored.contains(child.state) && !frontier.contains(child)) {
					frontier.add(child);
				}
			});
		}
	}

	PathFinder.prototype._childNode = function(node, action) {
		return {
			state: this._problemParams.result(node.state, action),
			parent: node,
			action: action,
			pathCost: this._problemParams.cost(node.state, action)
		};
	}

	PathFinder.prototype._solution = function(node) {
		var sol = [];
		for (var n = node; n.parent !== null; n = n.parent) {
			sol.unshift(n);
		}
		return sol;
	}

	return PathFinder;
});