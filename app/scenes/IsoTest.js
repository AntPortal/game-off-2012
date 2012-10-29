define([ 'config', 'Crafty' ], function(config) {
	Crafty.scene('IsoTest', function() {
		var x, y, tileType;
		Crafty.sprite(64, 'assets/tiles/iso-64x64-outside.png', {
			grass1 : [ 0, 0 ],
			grass2 : [ 1, 0 ],
			grass3 : [ 2, 0 ],
			grass4 : [ 3, 0 ],
			grass5 : [ 4, 0 ],
			grass6 : [ 5, 0 ],
			grass7 : [ 6, 0 ],
			grass8 : [ 0, 1 ],
			grass9 : [ 1, 1 ],
			grass10 : [ 2, 1 ],
			grass11 : [ 3, 1 ],
			grass12 : [ 4, 1 ],
			grass13 : [ 5, 1 ],
			grass14 : [ 6, 1 ],
			grass15 : [ 7, 1 ],
			grass16 : [ 0, 2 ],
			grass17 : [ 1, 2 ],
			grass18 : [ 2, 2 ],
			grass19 : [ 3, 2 ],
		});
		var map = new Array();
		for (y = 0; y < 35; y++) {
			map[y] = new Array();
			for (x = 0; x < 12; x++) {
				tileType = "grass" + Crafty.math.randomInt(1, 19);
				map[y][x] = tileType;
			}
		}
		var iso = Crafty.isometric.size(64);
		for (y = 0; y < map.length; y++) {
			var row = map[y];
			for (x = 0; x < row.length; x++) {
				tileType = row[x];
				var entity = Crafty.e('2D, Canvas, Mouse, ' + tileType + ', Tint').attr({
					w : 64,
					h : 64
				});
				entity.bind('MouseOver', function(event) {
					this.tint("#0000FF", 0.25);
				});
				entity.bind('MouseOut', function(event) {
					this.tint("#000000", 0);
				});
				iso.place(x, y, 0, entity);
			}
		}
	});
	return undefined;
});