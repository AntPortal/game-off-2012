define([
	'config',
	'utils',
	'Crafty',
	'components/ViewportRelative',
], function(config, utils) {
	/**
	 * Dictionary which defines every instruction this VM is aware of. The keys
	 * are the names of the instructions, and the values are functions which allow
	 * you to extract information about that instruction. There are 3 functions
	 * for each instruction:
	 *
	 * validate is a function which "does nothing" if the instruction is valid,
	 * and throws an exception if the instruction is invalid. It is used when the
	 * ScriptRunner initializes itself to perform a "compile-time" check of the
	 * script.
	 *
	 * behaviour is the function which actually "does the work" of the
	 * instruction. It is invoked by the VM when the script is run, and the
	 * instruction pointer points to the relevant instruction.
	 *
	 * toString is a function which returns a string representation of the
	 * instruction. This is to aid debugging failing scripts.
	 */
	var instructions = {};

	/**
	 * A label instruction, which a "jumpToLabel" instruction can jump to.
	 * Otherwise, acts as a NOOP. Label instructions are scoped to their owning
	 * VM, and must be unique within a VM or else undefined behaviour may occur.
	 */
	instructions['label'] = {
		validate: function(vm, inst) {
			if (! inst.label) {
				throw 'label instruction needs to have a field "label"';
			}
		},
		behaviour: function(vm, inst) {
			vm._curState++;
			vm.run();
		},
		toString: function(vm, inst) {
			return 'LABEL ' + inst.label;
		}
	};

	instructions['dialog'] = {
		validate: function(vm, inst) {
			if (!inst.params) {
				throw 'dialog instruction needs parameters';
			}
			if (! inst.params.msg) {
				throw 'dialog instruction must have some text';
			}
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			Crafty.e('2D, Canvas, Dialog').attr(inst.params);
			vm._curState++;
			vm.run();
		},
		toString: function(vm, inst) {
			return 'DIALOG: ' + inst.msg;
		},
	};

	instructions['menu'] = {
		validate: function(vm, inst) {
			if (!inst.params) {
				throw 'menu instruction needs parameters';
			}
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			Crafty.e('2D, Canvas, ActionMenu').attr(inst.params);
			vm._curState++;
			vm.run();
		},
		toString: function(vm, inst) {
			return 'MENU: TODO'; //TODO
		},
	}

	instructions['PACADOC'] = {
		validate: function(vm, inst) {
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			Crafty.e('2D, Mouse, ViewportRelative').attr({
				x: 0,
				y: 0,
				z: config.zOffset.meta,
				w: config.viewport.width,
				h: config.viewport.height,
			}).bind('Click', function() {
				Crafty('Dialog').destroy(); //Destroy all dialogs
				this.destroy(); //Destroy this mouse listener
				vm._curState++;
				vm.run();
			});
		},
		toString: function(vm, inst) {
			return 'PACADOC';
		},
	};

	instructions['loadScene'] = {
		validate: function(vm, inst) {
			if (! inst.scene) {
				throw 'loadScene instruction must specify a scene to load.';
			}
		},
		behaviour: function(vm, inst) {
			Crafty.scene(inst.scene);
			vm._curState++;
			vm.run();
		},
		toString: function(vm, isnt) {
			return 'LOAD_SCENE ' + inst.scene;
		}
	};

	instructions['playMusic'] = {
		validate: function(vm, inst) {
			if (! inst.song) {
				throw 'playMusic must specify a song to play.';
			}
		},
		behaviour: function(vm, inst) {
			utils.stopAllMusic();
			Crafty.audio.play(inst.song, -1, utils.effectiveVolume(inst.song));
			vm._curState++;
			vm.run();
		},
		toString: function(vm, isnt) {
			return 'PLAY_MUSIC ' + inst.song;
		}
	};

	instructions['fade'] = {
		validate: function(vm, inst) {
			if (! inst.params) {
				throw 'TODO: document validation error';
			}
			if (! inst.duration) {
				throw 'fade must speicfy a duration';
			}
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			if (!vm.fader) {
				vm.fader = Crafty.e('2D, Canvas, Color, Tween, ViewportRelative').attr({
					x: 0, y: 0, z: 999, w: config.viewport.width, h: config.viewport.height, alpha: 0, color: '#000000' //TODO: Replace z with a named constant from config
				});
			}
			var curState = vm._curState;
			vm.fader.bind('TweenEnd', function() {
				this.unbind('TweenEnd');
				vm._curState++;
				vm.run();
			});
			vm.fader.tween(inst.params, inst.duration);
		},
		toString: function(vm, isnt) {
			return 'FADE ' + inst.duration;
		}
	};

	instructions['jump'] = {
		validate: function(vm, inst) {
			if (inst.offset == 0) {
				throw 'jump offset cannot be 0';
			}
		},
		behaviour: function(vm, inst) {
			vm._curState += inst.offset;
			vm.run();
		},
		toString: function(vm, isnt) {
			return 'JUMP ' + inst.offset + ' (relative)';
		}
	};

	instructions['jumpToLabel'] = {
		validate: function(vm, inst) {
			if (! inst.label) {
				throw 'jumpToLabel must have a label';
			}

			var targetState = -1;
			for (var i = 0, n = vm.script.length; i < n; i++) {
				var maybeLabel = vm.script[i];
				if (maybeLabel.action === 'label' && maybeLabel.label === inst.label) {
					targetState = i;
					break;
				}
			}
			if (targetState == -1) {
				throw 'Invalid jump label ' + inst.label;
			}
		},
		behaviour: function(vm, inst) {
			var targetState = -1;
			for (var i = 0, n = vm.script.length; i < n; i++) {
				var maybeLabel = vm.script[i];
				if (maybeLabel.action === 'label' && maybeLabel.label === inst.label) {
					targetState = i;
					break;
				}
			}
			vm._curState = targetState;
			vm.run();
		},
		toString: function(vm, isnt) {
			return 'JUMP_TO_LABEL ' + inst.label;
		}
	};

	instructions['arbitraryCode'] = {
		validate: function(vm, inst) {
			if (! inst.code) {
				throw 'arbitraryCode must have a code attribute';
			}
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			inst.code(vm._curState, function(newState) {
				vm._curState = newState;
				vm.run();
			});
		},
		toString: function(vm, isnt) {
			return 'ARBITRARY_CODE'; //TODO more info here?
		}
	};

	instructions['destroyVM'] = {
		validate: function(vm, inst) {
			//Does nothing
		},
		behaviour: function(vm, inst) {
			vm.destroy();
		},
		toString: function(vm, isnt) {
			return 'DESTROY_VM';
		}
	};

	Crafty.c('ScriptRunner', {
		_curState: 0,
		init: function() {
			//Does nothing
			return this;
		},
		/**
		 * Initializes the ScriptRunner with a script. A script is an array of
		 * objects, with each object representing an instruction. These objects
		 * always have a field "action" which specifies which instruction the object
		 * represents. From there, the object may have other fields, the specifics
		 * of which depend on the instruction used.
		 */
		ScriptRunner: function(script) {
			this.script = script;
			for (var i = 0; i < script.length; i++) {
				var instObj = script[i];
				var instName = instObj.action;
				var instEntry = instructions[instName];
				instEntry.validate(this, instObj);
			}
			return this;
		},
		run: function() {
			if (this._curState >= this.script.length) {
				return; //Done
			}
			var instObj = this.script[this._curState];
			var instName = instObj.action;
			var instEntry = instructions[instName];
			instructions[instName].behaviour(this, instObj);
			return this;
		}
	});
});
