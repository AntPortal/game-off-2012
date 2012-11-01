define([
	'config',
	'Crafty'
], function(config) {
	Crafty.c('ScriptRunner', {
		_curState: 0,
		init: function() {
			//Does nothing
			return this;
		},
		ScriptRunner: function(script) {
			this.script = script;
			return this;
		},
		run: function() {
			if (this._curState >= this.script.length) {
				return; //Done
			}
			var instruction = this.script[this._curState];
			switch (instruction.action) {
			case 'dialog':
				this._dialog(instruction);
				break;
			case 'PACADOC': //Pause and close all dialogs on click
				this._PACADOC(instruction);
				break;
			case 'loadScene':
				this._loadScene(instruction);
				break;
			default:
				throw 'Unsupported scripting action: ' + instruction.action;
			}
			return this;
		},
		_dialog: function(dialogInst) {
			if (dialogInst.action != 'dialog') {
				throw dialogInst;
			}
			Crafty.e('2D, Canvas, Dialog').Dialog(dialogInst.params);
			this._curState++;
			this.run();
		},
		_PACADOC: function(pacadocInst) {
			if (pacadocInst.action != 'PACADOC') {
				throw pacadocInst;
			}
			var me = this;
			Crafty.e('2D, Mouse').attr({
				x: 0, y: 0, w: config.viewport.width, h: config.viewport.height, clicked: false
			}).bind('Click', function() {
				Crafty('Dialog').destroy(); //Destroy all dialogs
				this.destroy(); //Destroy this mouse listener
				me._curState++;
				me.run();
			});
		},
		_loadScene: function(inst) {
			if (inst.action != 'loadScene') {
				throw inst;
			}
			Crafty.scene(inst.scene);
		}
	});
});