require.config({
	paths : {
		Melon : '../libs/melonJS_0.9.4/melonJS-0.9.4'
	}
});

define(['Melon'], function() {
	var gameResources = [{
		name: "iso-64x64-outside",
		type: "image",
		src: "/assets/tiles/iso-64x64-outside.png"
	}, {
		name: "test",
		type: "tmx",
		src: "/assets/maps/test.tmx"
	}];

	var jsApp = {
		onload: function() {
			console.log("onload");
			if (!me.video.init(null, 640, 480, false, 1.0)) {
				alert("Sorry, but your browser does not support HTML 5 Canvas.");
				return;
			}
			console.log("initialized video");
			me.audio.init("mp3,ogg");
			me.loader.onload = this.loaded.bind(this);
			me.loader.preload(gameResources);
			me.state.change(me.state.LOADING);
		},
		loaded: function() {
			console.log("loaded");
			me.state.set(me.state.PLAY, new PlayScreen());
			me.state.change(me.state.PLAY);
		}
	};

	var PlayScreen = me.ScreenObject.extend({
		onResetEvent: function() {
			console.log("loading level");
			me.levelDirector.loadLevel("test");
		}
	});

	window.onReady(function() {
		jsApp.onload();
	});
});
