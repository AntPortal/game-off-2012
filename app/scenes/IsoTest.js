define([
		'config',
		'maps/test-multi-tileset-two-baseheights.json',
		'mouselook',
		'utils',
		'Crafty',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
		'components/VersionHistory'
	], function(config, mapData, mouselook, utils) {
	Crafty.scene('IsoTest', function() {
		var initGameState = {
			hero: {position: [0, 0]}
		};
		var versions = Crafty.e('VersionHistory');

		var hero; //entity global to this scene
		var tileProperties = utils.loadTileset(mapData);
		var heightMap = utils.loadMap(mapData, tileProperties, function(tileEntity) {
			console.log('Clicked on');
			console.log({
				x: tileEntity.tileX,
				y: tileEntity.tileY,
				z: tileEntity.surfaceZ
			});
			if (hero) {
				hero.setWalkTarget(tileEntity.tileX, tileEntity.tileY);
				versions.commit({hero: {position: [tileEntity.tileX, tileEntity.tileY]}});
			}
		});
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			hero = Crafty.e('2D, Canvas, Character, heroSouth').Character(heightMap, worldToPixel, 0, 0);
		})();
		(function() {
			//Handle HUD
			utils.addMusicControlEntity(Crafty);
		})();

		(function() {
			/* Display a commit marker any time a commit is made. This currently only handles linear sequences of commits. */
			var markersByCommitId = {};
			var viewHeight = config.viewport.height;
			versions.bind('Commit', function(commit) {
				/* For now, commit markers are just squares. */
				console.log(commit);
				var marker = Crafty.e('2D, Canvas, Color, ViewportRelative').color('yellow').attr({w: 16, h: 16, z: config.zOffset.gitk});
				var parentMarkers = commit.parentRevIds.map(function(parentId) { return markersByCommitId[parentId] });
				if (parentMarkers.length === 0) {
					marker.attr({x: 8, y: viewHeight - 32 + 8});
				} else {
					parentMarkers[0].color('blue');
					marker.attr({x: parentMarkers[0].x + 32 + 8, y: parentMarkers[0].y});
				}
				markersByCommitId[commit.id] = marker;
			});
		})();
		/* Commit the initial game state. This needs to be done after the event handler above is installed,
		 * so that the handler will pick up this initial commit. */
		versions.commit(initGameState);
		Crafty.viewport.clampToEntities = false;
		mouselook.start();
	});
	return undefined;
});
