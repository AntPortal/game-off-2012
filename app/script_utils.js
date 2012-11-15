/* Utility methods for building scripts for the ScriptRunner component.
 * TODO: document.
 */
define([
	'underscore'
], function() {
	function ScriptUtils() {
		this.x = 0;
		this.y = 0;
		this.env = {};
	}

	ScriptUtils.prototype.dialogAndPause = function(msg) {
		var self = this;
		var interpolated = msg.replace(/@(\w+)@/, function(_, name) { return self.env[name]; });
		return [
			{
				action: 'dialog',
				params: {
					x: this.x,
					y: this.y,
					w: 400,
					h: 70,
					face: undefined, /* TODO */
					msg: interpolated
				},
			},
			{action: 'PACADOC'}
		];
	}

	ScriptUtils.prototype.actionBranch = function(actions, menuCallback) {
		var self = this;
		var chosenAction = null;
		var actionCallback = null;

		var script = [
			{
				action: 'menu',
				params: {
					x: this.x,
					y: this.y,
					w: 400,
					h: 90,
					actions: actions.map(function(action, index) {
						var jump = 1;
						for (var i = 0; i < index; i++) {
							jump += actions[i].result.length + 1;
						}
						return {
							label: action.label,
							onClick: function() { actionCallback(jump); }
						};
					})
				}
			},
			{
				action: 'arbitraryCode',
				code: function(curState, callback) {
					menuCallback(true);
					actionCallback = function(jump) { menuCallback(false); callback(curState+jump); };
				}
			}
		];

		actions.forEach(function(action, index) {
			script = script.concat(action.result);

			var jump = 1;
			for (var i = index + 1, n = actions.length; i < n; i++) {
				jump += actions[i].result.length + 1;
			}

			script.push({
				action: 'arbitraryCode',
				code: function(curState, callback) { callback(curState + jump); }
			});
		});

		return script;
	}

	return ScriptUtils;
});
