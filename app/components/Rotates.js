define(['Crafty'], function() {
	Crafty.c('Rotates', {
		init : function() {
			var me = this;
			me.requires('2D');
			me.origin('center');
			me.bind('EnterFrame', function() {
				me.rotation = (me.rotation + 1) % 360;
			});
			me.bind('Change', function() {
				me.origin('center');
			});
		}
	});
	return undefined;
});