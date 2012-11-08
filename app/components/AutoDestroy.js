define([
	'Crafty',
	'components/BaseDialog',
	'components/BetterText',
], function() {
	/**
	 * Entities with AutoDestroy will automatically destroy themselves when a scene change occurs.
	 */
	Crafty.c('AutoDestroy', {
		init: function() {
			var me = this;
			Crafty.bind('SceneChange', function() {
				me.destroy();
			});
		},
	});
	return undefined;
});