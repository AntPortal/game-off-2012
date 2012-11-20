define([
	'config',
	'Crafty',
], function(config) {
	var TILE_SIZE = 16; // hardcoded size of a dialog tile.
	/**
	 * A dialog box with no capability for having any content. If you want to have text in the dialog, e.g. for dialogues,
	 * see the Dialog component instead.
	 */
	Crafty.c('BaseDialog', {
		TILE_SIZE: TILE_SIZE, // constant; size of each of the 3x3 tiles that make up the dialog.
		x: 0,
		y: 0,
		z: config.zOffset.dialog,
		w: TILE_SIZE * 2,
		h: TILE_SIZE * 2,
		dialogBg: 'speech',
		visible: true,
		init: function() {
			this.requires('WalkBlocker');
			this._d = [1,2,3,4,5,6,7,8,9];
			this._d[7] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.7');
			this._d[8] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.8');
			this._d[9] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.9');
			this._d[4] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.4');
			this._d[5] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.5');
			this._d[6] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.6');
			this._d[1] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.1');
			this._d[2] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.2');
			this._d[3] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.3');
			this.bind('Change', this._BaseDialog_attributeChanged);
			this.bind('Remove', this._BaseDialog_removed);
		},
		_BaseDialog_reinitializeSubDialogEntity: function(index, attr) {
			this._d[index].destroy();
			this._d[index] = Crafty.e('2D, Canvas, dialog.'+this.dialogBg+'.'+index);
			this._d[index].attr({ //defaults
				x: this.x,
				y: this.y,
				z: this.z,
				visible: this.visible,
			});
			if (attr) {
				this._d[index].attr(attr);
			}
		},
		_BaseDialog_attributeChanged: function() {
			this._BaseDialog_reinitializeSubDialogEntity(7);
			this._BaseDialog_reinitializeSubDialogEntity(8, {x : this.x + TILE_SIZE, w : this.w - (TILE_SIZE * 2)});
			this._BaseDialog_reinitializeSubDialogEntity(9, {x : this.x + this.w - TILE_SIZE});
			this._BaseDialog_reinitializeSubDialogEntity(4, {y: this.y + TILE_SIZE, h : this.h - (TILE_SIZE * 2)});
			this._BaseDialog_reinitializeSubDialogEntity(5, {
				x : this.x + TILE_SIZE,
				y : this.y + TILE_SIZE,
				w : this.w - (TILE_SIZE * 2),
				h : this.h - (TILE_SIZE * 2),
			});
			this._BaseDialog_reinitializeSubDialogEntity(6, {
				x : this.x + this.w - TILE_SIZE,
				y : this.y + TILE_SIZE,
				h : this.h - (TILE_SIZE * 2),
			});
			this._BaseDialog_reinitializeSubDialogEntity(1, {y : this.y + this.h - TILE_SIZE});
			this._BaseDialog_reinitializeSubDialogEntity(2, {
				x : this.x + TILE_SIZE,
				y : this.y + this.h - TILE_SIZE,
				w : this.w - (TILE_SIZE * 2),
			});
			this._BaseDialog_reinitializeSubDialogEntity(3, {x : this.x + this.w - TILE_SIZE, y : this.y + this.h - TILE_SIZE});
			
		},
		_BaseDialog_removed: function() {
			var i;
			for (i = 1; i <= 9; i++) {
				this._d[i].destroy();
			}
		}
	});
	return undefined;
});