define([
		'config',
		'maps/level1.json',
		'mouselook',
		'utils',
		'script_utils',
		'interaction_dictionary',
		'components/GameState',
		'Crafty',
		'underscore',
		'components/ViewportRelative',
		'components/ClickNoDrag',
		'components/Character',
		'components/NPC',
		'components/Dialog',
		'components/ActionMenu',
		'components/TaskList',
		'components/Coins',
		'components/HelpText',
	], function(config, mapData, mouselook, utils, ScriptUtils, interactionDictionary, gameStates) {
	var taskListEntity = null;
	function init() {
		var tileProperties = utils.loadTileset(mapData);

		var gameState = gameStates.saveGames[config.curSaveSlot];
		var npcDictionary = {};

		var parsedMapData = utils.loadMap(mapData, tileProperties);
		(function() {
			//Add characters
			var worldToPixel = utils.makeWorldToPixelConverter(mapData.tilewidth, mapData.tileheight);
			var i = 0;
			for (i = 0; i < parsedMapData.objects.length; i++) {
				var object = parsedMapData.objects[i];
				if (object.type == 'npc') {
					var npcEnt = Crafty.e('2D, NPC, Mouse').
						NPC(
							worldToPixel,
							object.tileX,
							object.tileY,
							object.tileZ,
							object.properties,
							gameState
						).
						bind("Click", function() {
							var nearbyNPC = this;
							if (Crafty('TalkBlocker').length > 0) {
								return;
							}

							utils.profile('level1.js click handler', function() {
								var npcName = nearbyNPC.properties.name;
								var actionName = gameState.getOneInteraction(npcName);
								actionName = actionName || 'defaultInteraction';
								var action = interactionDictionary[actionName];
								utils.assert(action, 'action should not be undefined');
								console.log('About to run ', action);
								var scriptUtils = new ScriptUtils(
									interactionDictionary,
									npcDictionary,
									gameState,
									{
										npc: npcDictionary[nearbyNPC.properties.name],
										interaction: actionName,
										face: undefined,
										x: (config.viewport.width - 600) / 2,
										y: config.viewport.height - 210,
										heroName: gameState.getGithubName()
									}
								);
								action.doAction(scriptUtils);
							});
						});
					npcDictionary[object.properties.name] = npcEnt;
				} else {
					console.warn('Unknown object type: ', object.type);
				}
			}
		})();
		(function() {
			//Handle HUD
			// utils.addMusicControlEntity(Crafty);
			taskListEntity = Crafty.e('TaskList');
			taskListEntity.TaskList('cr-stage', config.viewport.width - 320, 0, config.zOffset.gitk, 320, 100, gameState);
			Crafty.e('Coins').Coins('cr-stage', config.viewport.width - 150, config.viewport.height - 32, config.zOffset.gitk, 150, 32, gameState);
			Crafty.e('HelpText').HelpText('cr-stage', 10, config.viewport.height - 40, config.zOffset.gitk, 250, 40);
		})();

		Crafty.viewport.clampToEntities = false;
		mouselook.start();
		// utils.ensureMusicIsPlaying('music/town');
		(function() { //Initial dialog from Linus to hero.
			utils.centerViewportOn(Crafty, npcDictionary['Linus'], 0);

			if (!gameState.hasNoInteractions()) {
				/* TODO: this is duplicated in the interaction dictionary */
				var helpTextEnt = Crafty(Crafty('HelpText')[0]);
				helpTextEnt.setLines(["Drag or slide to look around.", "Click or tap on someone to talk to them."]);
				setTimeout(function() { helpTextEnt.setLines([]); }, 120000);
				return;
			}

			var scriptUtils = new ScriptUtils(
				interactionDictionary,
				npcDictionary,
				gameState,
				{
					npc: npcDictionary['Linus'],
					interaction: 'linusIntro',
					face: undefined,
					x: (config.viewport.width - 600) / 2,
					y: config.viewport.height - 200,
					heroName: gameState.getGithubName()
				}
			);
			interactionDictionary['linusIntro'].doAction(scriptUtils);
		})();
	}
	function uninit() {
		mouselook.stop();
		if (taskListEntity) {
			taskListEntity.destroy();
		}
		taskListEntity = null;
	}
	Crafty.scene('level1', function() {
		utils.profile('level1.js init', init);
	}, uninit);
	return undefined;
});
