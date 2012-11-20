define([
	'config',
	'utils',
	'Crafty',
	'components/ViewportRelative',
], function(config, utils) {
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
			var method = this['_' + instruction.action];
			if (!method) {
				throw 'Unsupported scripting action: ' + instruction.action;
			} else {
				method.call(this, instruction);
			}
			return this;
		},
		_label: function(labelInst) {
			if (labelInst.action != 'label') {
				throw labelInst;
			}
			this._curState++;
			this.run();
		},
		_dialog: function(dialogInst) {
			if (dialogInst.action != 'dialog') {
				throw dialogInst;
			}
			Crafty.e('2D, Canvas, Dialog').attr(dialogInst.params);
			this._curState++;
			this.run();
		},
		_menu: function(menuInst) {
			if (menuInst.action != 'menu') {
				throw dialogInst;
			}
			Crafty.e('2D, Canvas, ActionMenu').attr(menuInst.params);
			this._curState++;
			this.run();
		},
		_PACADOC: function(pacadocInst) {
			if (pacadocInst.action != 'PACADOC') {
				throw pacadocInst;
			}
			var me = this;
			Crafty.e('2D, Mouse, ViewportRelative').attr({
				x: 0,
				y: 0,
				z: config.zOffset.meta,
				w: config.viewport.width,
				h: config.viewport.height,
				clicked: false,
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
			this._curState++;
			this.run();
		},
		_playMusic: function(inst) {
			if (inst.action != 'playMusic') {
				throw inst;
			}
			utils.stopAllMusic();
			Crafty.audio.play(inst.song, -1, utils.effectiveVolume(inst.song));
			this._curState++;
			this.run();
		},
		_fade: function(inst) {
			if (inst.action != 'fade') {
				throw inst;
			}
			var me = this;
			if (!this.fader) {
				this.fader = Crafty.e('2D, Canvas, Color, Tween, ViewportRelative').attr({
					x: 0, y: 0, z: 999, w: config.viewport.width, h: config.viewport.height, alpha: 0, color: '#000000'
				});
			}
			var curState = this._curState;
			this.fader.bind('TweenEnd', function() {
				this.unbind('TweenEnd');
				me._curState = curState + 1;
				me.run();
			});
			this.fader.tween(inst.params, inst.duration);
		},
		_jump: function(inst) {
			if (inst.action != 'jump') {
				throw inst;
			}
			utils.assert(inst.offset != 0, 'jump offset cannot be 0');

			this._curState += inst.offset;
			this.run();
		},
		_jumpToLabel: function(inst) {
			if (inst.action != 'jumpToLabel') {
				throw inst;
			}

			var targetState = -1;
			for (var i = 0, n = this.script.length; i < n; i++) {
				var maybeLabel = this.script[i];
				if (maybeLabel.action === 'label' && maybeLabel.label === inst.label) {
					targetState = i;
					break;
				}
			}

			utils.assert(targetState, 'Invalid jump label');
			this._curState = targetState;
			this.run();
		},
		_arbitraryCode: function(inst) {
			if (inst.action != 'arbitraryCode') {
				throw inst;
			}
			var me = this;
			inst.code(this._curState, function(newState) {
				me._curState = newState;
				me.run();
			});
		},
		_destroyVM: function(inst) {
			if (inst.action != 'destroyVM') {
				throw inst;
			}
			this.destroy();
		}
	});
});
