define([
		'config',
		'utils',
		'components/GameState',
		'Crafty',
		'scenes/Title-intro',
		'scenes/SpriteTest',
		'components/BetterText',
], function(config, utils, gameStates) {
	function loadAntifareaCharacterSprite(id, url) {
		var NUM_FRAMES = 3;
		var asset = Crafty.asset(url);
		if (!asset) {
			throw "Could not load " + url;
		}
		var w = asset.width / 3;
		var h = asset.height / 4;
		var directions = ['N', 'E', 'S', 'W'];
		var spriteParam = {};
		var i, j;
		for (i = 0; i < directions.length; i++) {
			var direction = directions[i];
			for (j = 0; j < NUM_FRAMES; j++) {
				var key = 'sprite_'+id+'_'+direction+j;
				spriteParam[key] = [j, i];
			}
		}
		Crafty.sprite(w, h, url, spriteParam);
	}
	Crafty.scene('Loading', function() {
		Crafty.background('#000');
		Crafty.e('2D, DOM, BetterText').attr({
			text: "Loading...",
			fillStyle: 'white',
			w : config.viewport.width,
			x : 0,
			y : config.viewport.height / 2
		}).css({
			'text-align' : 'center',
		});
		for (key in config.music) {
			var ogg = config.music[key].prefix + '.ogg';
			var mp3 = config.music[key].prefix + '.mp3';
			Crafty.audio.add(key, [ ogg, mp3 ]);
		}
		function makeSleepUntilFontsLoaded(doneCallback) {
			var func = function() {
				if (fontsLoaded) {
					doneCallback();
				} else {
					window.setTimeout(func, 500);
				}
			};
			return func;
		}
		var githubAccountNames = [
			gameStates.saveGames[0].getGithubName(),
			gameStates.saveGames[1].getGithubName(),
			gameStates.saveGames[2].getGithubName()
		];
		utils.withGitHubAvatarUrls(githubAccountNames, function(githubAvatarUrls) {
			var i;
			var assets = [ //Try to keep alphabetical
				'assets/faces/48x48_Faces_4th_Sheet_Update_CharlesGabriel_OGA_0.png',
				'assets/faces/faces1.png',
				'assets/maps/level1.jpg',
				'assets/maps/level1.png',
				'assets/maps/karayom_title_small.png',
				'assets/sprites/bunny.png',
				'assets/sprites/ceeveeus.png',
				'assets/sprites/charsets_warrior.png',
				'assets/sprites/childF.png',
				'assets/sprites/childM.png',
				'assets/sprites/dancerF.png',
				'assets/sprites/dog.png',
				'assets/sprites/dog2.png',
				'assets/sprites/healerF.png',
				'assets/sprites/junio.png',
				'assets/sprites/mom.png',
				'assets/sprites/oldman.png',
				'assets/sprites/oldwoman.png',
				'assets/sprites/scott.png',
				'assets/sprites/townfolkM.png',
				'assets/tiles/iso-64x64-building_2.png',
				'assets/tiles/iso-64x64-outside.png',
				'assets/ui/action_stop24.png',
				'assets/ui/arrows.png',
				'assets/ui/bg-blue.png',
				'assets/ui/coin_copper.png',
				'assets/ui/coin_gold.png',
				'assets/ui/coin_silver.png',
				'assets/ui/comment_new.gif',
				'assets/ui/comment_new_large.png',
				'assets/ui/dialog.blue.png',
				'assets/ui/dialog.brown.png',
				'assets/ui/dialog.olive.png',
				'assets/ui/music.png',
				'assets/ui/OrbzPrw.png',
				config.DEFAULT_GITHUB_AVATAR_URL,
			];
			//Adds Github avatars to the list of assets to load.
			for (i = 0; i < githubAvatarUrls.length; i++) {
				var url = githubAvatarUrls[i];
				if (url) {
					assets.push(url);
				}
			}
			assets = utils.removeDuplicates(assets);
			Crafty.load(assets, function() {
				makeSleepUntilFontsLoaded(function() {
					loadAntifareaCharacterSprite('hero', 'assets/sprites/charsets_warrior.png');
					loadAntifareaCharacterSprite('oldwoman', 'assets/sprites/oldwoman.png');
					loadAntifareaCharacterSprite('dog', 'assets/sprites/dog.png');
					loadAntifareaCharacterSprite('dog2', 'assets/sprites/dog2.png');
					loadAntifareaCharacterSprite('oldman', 'assets/sprites/oldman.png');
					loadAntifareaCharacterSprite('ceeveeus', 'assets/sprites/ceeveeus.png');
					loadAntifareaCharacterSprite('childF', 'assets/sprites/childF.png');
					loadAntifareaCharacterSprite('childM', 'assets/sprites/childM.png');
					loadAntifareaCharacterSprite('junio', 'assets/sprites/junio.png');
					loadAntifareaCharacterSprite('scott', 'assets/sprites/scott.png');
					loadAntifareaCharacterSprite('bunny', 'assets/sprites/bunny.png');
					loadAntifareaCharacterSprite('dancerF', 'assets/sprites/dancerF.png');
					loadAntifareaCharacterSprite('mom', 'assets/sprites/mom.png');
					loadAntifareaCharacterSprite('healerF', 'assets/sprites/healerF.png');
					loadAntifareaCharacterSprite('townfolkM', 'assets/sprites/townfolkM.png');
					Crafty.sprite('assets/maps/karayom_title_small.png', {
						karayom_title: [0, 0, config.viewport.width, config.viewport.height]
					});
					Crafty.sprite(917, 'assets/ui/bg-blue.png', {
						ui_bg_blue: [0, 0]
					});
					(function() { // Create sprite for dialog boxes
						var temp = {
							'speech' : 'assets/ui/dialog.blue.png',
							'forkUi' : 'assets/ui/dialog.olive.png',
							'actionUi' : 'assets/ui/dialog.brown.png',
						};
						for (name in temp) {
							var url = temp[name];
							var spriteParams = {};
							spriteParams['dialog.' + name + '.7'] = [ 0, 0 ];
							spriteParams['dialog.' + name + '.8'] = [ 1, 0 ];
							spriteParams['dialog.' + name + '.9'] = [ 2, 0 ];
							spriteParams['dialog.' + name + '.4'] = [ 0, 1 ];
							spriteParams['dialog.' + name + '.5'] = [ 1, 1 ];
							spriteParams['dialog.' + name + '.6'] = [ 2, 1 ];
							spriteParams['dialog.' + name + '.1'] = [ 0, 2 ];
							spriteParams['dialog.' + name + '.2'] = [ 1, 2 ];
							spriteParams['dialog.' + name + '.3'] = [ 2, 2 ];
							Crafty.sprite(16, url, spriteParams);
						}
					})();
					Crafty.sprite(24, 'assets/ui/comment_new_large.png', {
						dialogMore : [ 0, 0 ]
					});
					Crafty.sprite(24, 'assets/ui/action_stop24.png', {
						ui_save_delete : [ 0, 0 ]
					});
					Crafty.sprite(64, 'assets/ui/OrbzPrw.png', {
						'gitk_commit_current' : [3,0],
						'gitk_commit_old' : [2, 0],
						'gitk_commit_dead' : [0, 1],
					});
					(function() {
						//Loads the faces as face_warriorM, face_warriorF, face_mageM, etc.
						var temp = ['warrior', 'mage', 'healer', 'ninja', 'ranger', 'townfolk'];
						var spriteParam = {};
						for (i = 0; i < temp.length; i++) {
							spriteParam['face_'+temp[i]+'M'] = [i, 0];
							spriteParam['face_'+temp[i]+'F'] = [i, 1];
						}
						Crafty.sprite(48, 'assets/faces/faces1.png', spriteParam);
						
						Crafty.sprite(48, 'assets/faces/48x48_Faces_4th_Sheet_Update_CharlesGabriel_OGA_0.png', {
							face_bunny: [5, 7],
							face_childF: [1,7],
							face_childM: [1,6],
							face_dancerF: [5, 6],
							face_oldman: [4, 6],
							face_oldwoman: [4, 7],
						});
					})();
					//Create sprites for github avatars from save files.
					for (i = 0; i < githubAvatarUrls.length; i++) {
						var url = githubAvatarUrls[i];
						if (url != null) {
							var img = Crafty.asset(url);
							var spriteParams = {};
							spriteParams['GithubAvatar' + i] = [0,0,img.width,img.height];
							Crafty.sprite(url, spriteParams);
						}
					}
					(function() { //Create sprite for default github avatars
						var url = config.DEFAULT_GITHUB_AVATAR_URL;
						var img = Crafty.asset(url); 
						Crafty.sprite(url, {
							DefaultGithubAvatar: [0,0,img.width,img.height]
						});
					})();
					// When done loading, transition to Title-intro scene.
					//Crafty.scene('Title-intro');
					Crafty.scene('title'); //TODO
				})();
			});
		});
	});
	return undefined;
});
