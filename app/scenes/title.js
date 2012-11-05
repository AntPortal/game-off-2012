define([
		'config',
		'utils',
		'components/Dialog',
		'components/TextButton',
		'components/BetterText',
], function(config, utils) {
	Crafty.scene('title', function() {
		var i;
		var title = utils.createTitleEntity(Crafty);
		title.css('display', 'block');
		var slots = [0,1,2];
		function getMsgForSaveGameData(i) {
			return [
				"Save Game Slot " + (i + 1) +": " + (config.saveGames[i].name || "[Empty]"),
				(config.saveGames[i].level ? "Level: " + config.saveGames[i].level : "")
			];
		}
		for (i = 0; i < slots.length; i++) {
			slots[i] = Crafty.e('Dialog');
			slots[i].attr({
				x: 0,
				y: 120 * i + 150,
				w: config.viewport.width,
				h: 100,
				z: config.zOffset.dialog,
				msg: getMsgForSaveGameData(i),
				face: 'GithubAvatar' + i,
				faceWidth: 78,
				faceHeight: 78,
				saveIndex: i
			});
			slots[i].trigger('Change');
			slots[i].addComponent('Mouse');
			slots[i].bind('Click', function() {
				config.curSaveSlot = this.saveIndex;
				if (config.getCurLevel()) {
					//TODO Load the level
					Crafty.scene('level1-intro');
				} else {
					//Load new save creation system.
					Crafty.scene('newGame');
				}
			});
			var slotDelete = Crafty.e('2D, Canvas, ui_save_delete, Mouse');
			slotDelete.attr({
				x: config.viewport.width - 16 - 8,
				y: 120 * i + 150 + 10,
				w: 16,
				h: 16,
				z: config.zOffset.dialog,
				saveIndex: i,
			});
			slotDelete.bind('Click', function() {
				console.log('delete clicked');
				config.saveGames[this.saveIndex] = {};
				slots[this.saveIndex].face = 'DefaultGithubAvatar';
				slots[this.saveIndex].msg = getMsgForSaveGameData(this.saveIndex);
				slots[this.saveIndex].trigger('Change');
			});
		}
	});

	Crafty.scene('newGame', function() {
		var keyboard = [
		'1234567890-',
		'QWERTYUIOP',
		'ASDFGHJKL',
		'ZXCVBNM',
		'qwertyuiop',
		'asdfghjkl',
		'zxcvbnm',
		];
		var topMargin = 150;
		var sideMargin = 0;
		var xOffset = -30;
		var charSquareSizeMultiplier = 1.1;
		var fontSize = 45;
		var charSquareSize = fontSize * charSquareSizeMultiplier;
		var MAX_NAME_LENGTH = 40;
		var i, j;
		Crafty.e('Dialog').attr({
			x: 0,
			y: 0,
			w: config.viewport.width,
			h: config.viewport.height,
		});
		Crafty.e('2D, Canvas, BetterText').
			attr({
				text: "Enter your GitHub name:",
				textColor: '#FFFFFF',
				fontFamily: 'Patrick Hand',
				fontSize: fontSize+'px',
				x: 20,
				y: 0,
				z: config.zOffset.dialog + 1,
				w: config.viewport.width,
				h: fontSize
			});
		var name = '';
		var nameEntity = Crafty.e('2D, Canvas, BetterText');
		nameEntity.attr({
			text: ' ',
			textColor: '#FFFFFF',
			fontFamily: 'Patrick Hand',
			fontSize: fontSize+'px',
			x: 20,
			y: charSquareSize + 10,
			baseline: charSquareSize + 10 + charSquareSize * 0.75,
			z: config.zOffset.dialog + 1,
			w: config.viewport.width,
			h: charSquareSize * 1.25,
		});
		nameEntity.bind('KeyDown', function(keyEvent) {
			//Implements support for physical keyboard.
			var aKeycode = 65;
			var zKeycode = aKeycode + 25;
			var dashKeycode = 189;
			var backspaceKeycode = 8;
			var deleteKeycode = 46;
			var enterKeycode = 13;
			var zeroKeycode = 48;
			var nineKeycode = 57;
			var keycode = keyEvent.which || keyEvent.key || keyEvent.keyCode;
			var char = null;
			if (aKeycode <= keycode && keycode <= zKeycode) {
				char = String.fromCharCode(keycode);
				if (keyEvent.shiftKey) {
					char = char.toUpperCase();
				} else {
					char = char.toLowerCase();
				}
			} else if (zeroKeycode <= keycode && keycode <= nineKeycode) {
				char = String.fromCharCode(keycode);
			} else if (keycode == dashKeycode) {
				char = '-';
			} else if (keycode == backspaceKeycode || keycode == deleteKeycode) {
				char = 'DELETE';
			} else if (keycode == enterKeycode) {
				char = 'DONE';
			}
			if (char) {
				if (char == 'DELETE') {
					fnBackspace();
				} else if (char == 'DONE') {
					fnDone();
				} else {
					setNameHack(name + char);
				}
			}
		});
		function setNameHack(newValue) {
			name = newValue.substr(0, MAX_NAME_LENGTH);
			if (name.substr(0,1) == '-') {
				name = ''; //Github does not allow name to start with dash.
			}
			if (name.length == 0) {
				nameEntity.text = ' '; //Put a space, or else Crafty messes things up.
			} else {
				var shortName = utils.getShortName(name);
				if (name == shortName) {
					nameEntity.text = name;
				} else {
					nameEntity.text = name + ' ('+shortName+')';
				}
			}
			//Hack, because otherwise the refresh doesn't seme to work in Crafty.
			window.setTimeout(function() {
				nameEntity.trigger('Change');
			}, 50);
			window.setTimeout(function() {
				nameEntity.trigger('Change');
			}, 1000);
		}
		for (i = 0; i < keyboard.length; i++) {
			var line = keyboard[i];
			var lineWidth = line.length * charSquareSize;
			var lineXOffset = xOffset + sideMargin + (config.viewport.width - (2 * sideMargin) - lineWidth) / 2;
			for (j = 0; j < line.length; j++) {
				var char = line[j];
				var x = j * charSquareSize + lineXOffset;
				var y =i * charSquareSize + topMargin;
				var charEntity = Crafty.e('TextButton, Canvas');
				charEntity.TextButton(char);
				charEntity.attr({
					x: x,
					y: y,
					w: charSquareSize,
					h: charSquareSize,
					z: config.zOffset.dialog + 1,
					char: char,
				}).bind('Click', function() {
					setNameHack(name + this.char);
				});
			}
		}
		Crafty.e('TextButton, Canvas').
			TextButton("Backspace", {size: (fontSize/2)+'px'}).
			attr({
				x: config.viewport.width - 180,
				y: 300,
				w: 120,
				h: (charSquareSize/2),
				z: config.zOffset.dialog + 1,
			}).
			bind('Click', fnBackspace);
		Crafty.e('TextButton, Canvas').
			TextButton("Done", {size: (fontSize/2)+'px'}).
			attr({
				x: config.viewport.width - 180,
				y: 500,
				w: 120,
				h: (charSquareSize/2),
				z: config.zOffset.dialog + 1,
			}).
			bind('Click', fnDone);
		function fnBackspace() {
			if (name.length > 0) {
				var newValue = name.substr(0,name.length - 1);
				setNameHack(newValue);
			}
		}
		function fnDone() {
			if (name.length > 0) {
				config.setCurName(name);
				config.setCurShortName(utils.getShortName(name));
				config.setCurLevel(1);
				Crafty.scene('level1-intro');
			}
		}
		var tooltip = Crafty.e('2D, Canvas, BetterText, Mouse');
		tooltip.attr({
			text: '?',
			textColor: '#00FF00',
			fontFamily: 'Patrick Hand',
			fontSize: fontSize+'px',
			x: config.viewport.width - 24,
			y: 24,
			w: 16,
			h: 16,
			z: config.zOffset.dialog + 2,
		});
		var tip = Crafty.e('2D, Canvas, Dialog');
		tip.attr({
			msg: [
				"If you have a Github account, enter your Github account name, and the game will include some bonus content",
				"tailored specifically to you. If you don't have a Github account, feel free to use any name you want. You'll miss",
				"out on the bonus content, though!",
				"",
				"Note that github names are NOT case sensitive, and you can use this to influence the nickname the game will",
				"use to refer to you. For example, if your github name is johnsmith, and you wish to be referred to as John,",
				"enter your github name as JohnSmith."
			],
			x: 20,
			y: 120,
			w: config.viewport.width - 40,
			h: config.viewport.height - 180,
			z: config.zOffset.dialog + 2,
			visible: false,
		});
		tooltip.bind('MouseOver', function() {
			tip.visible = true;
		});
		tooltip.bind('MouseOut', function() {
			tip.visible = false;
			//Crafty bug? The letters need to be told to redraw themselves.
			Crafty('2D').each(function() {
				this.trigger('Change');
			});
		});
	});
});