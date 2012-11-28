define([
	'config',
	'utils',
	'Crafty',
	'components/ViewportRelative',
], function(config, utils) {

	function assert(cond, msg, vm) {
		if (!cond) {
			console.error(msg);
			try {
				console.error(vm.toString());
				//Allows the debugger keyword to get hit, even if toString throws an exception.
			} catch (e) {
				console.error(e);
			}
			debugger;
			throw new msg;
		}
	}

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
			assert(inst.label !== undefined && inst.label !== null, 'label instruction needs to have a field "label"', vm);
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
			assert(inst.params, 'dialog instruction needs parameters', vm);
			assert(inst.params.msg, 'dialog instruction must have some text', vm);
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			Crafty.e('2D, Canvas, Dialog, ViewportRelative').attr(inst.params);
			vm._curState++;
			vm.run();
		},
		toString: function(vm, inst) {
			return 'DIALOG: ' + inst.params.msg;
		},
	};

	instructions['menu'] = {
		validate: function(vm, inst) {
			assert(inst.params, 'menu instruction needs parameters', vm);
			//TODO: We can do more validation here if we want.
		},
		behaviour: function(vm, inst) {
			Crafty.e('2D, Canvas, ActionMenu, ViewportRelative').attr(inst.params);
			vm._curState++;
			vm.run();
		},
		toString: function(vm, inst) {
			return 'MENU: TODO'; //TODO
		},
	}

	instructions['PACADOC'] = {
		validate: function(vm, inst) {
			//Does nothing
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
			assert(inst.scene, 'loadScene instruction must speicyf a scene to load', vm);
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
			assert(inst.song, 'playMusic must specify a song to play', vm);
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
			assert(inst.params, 'TODO: document validation error', vm);
			assert(inst.duration, 'fade must speicfy a duration', vm);
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
			assert(inst.offset != 0, 'jump offset cannot be 0', vm);
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
			assert(inst.label !== undefined && inst.label !== null, 'jumpToLabel must have a label', vm);

			var targetState = -1;
			for (var i = 0, n = vm.script.length; i < n; i++) {
				var maybeLabel = vm.script[i];
				utils.assert(maybeLabel, 'maybeLabel should not be undefined');
				if (maybeLabel.action === 'label' && maybeLabel.label === inst.label) {
					targetState = i;
					break;
				}
			}
			assert(targetState !== -1, 'Invalid jump label', vm);
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
			assert(inst.code, 'arbitraryCode must have a code attribute', vm);
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
			this.bind("Remove", this._removed);
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
				utils.assert(instObj, 'undefined instruction found');
				var instName = instObj.action;
				var instEntry = instructions[instName];
				utils.assert(instEntry, 'Invalid instruction found');
				instEntry.validate(this, instObj);
			}
			return this;
		},
		run: function() {
			if (this._curState >= this.script.length) {
				this.destroy();
				return; //Done
			}
			var instObj = this.script[this._curState];
			var instName = instObj.action;
			var instEntry = instructions[instName];
			instructions[instName].behaviour(this, instObj);
			return this;
		},
		toString: function() {
			retVal = '';
			for (var i = 0; i < this.script.length; i++) {
				var instObj = this.script[i];
				var instEntry = instructions[instObj.action];
				retVal += i + '\t' + instEntry.toString(this, instObj) + '\n';
			}
			return retVal;
		},
		_removed: function() {
			this.script = null;
		}
	});
});
