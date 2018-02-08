"use strict";

window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    var game = new Phaser.Game( 800, 640, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'background', 'assets/background.png' );
        game.load.image( 'green', 'assets/green.png');
        game.load.image( 'golfclub', 'assets/golfclub.png');
        game.load.image( 'golfball', 'assets/golfball.png');
        game.load.tilemap('map1', 'assets/tiles/tilesmap2_Tile Layer 1.csv', null, Phaser.Tilemap.CSV);
        game.load.tilemap('map2', 'assets/tiles/tilesmap2_Tile Layer 2.csv', null, Phaser.Tilemap.CSV);
        game.load.image('tiles', 'assets/ground.png');
        game.load.audio('golfhit1', 'assets/sounds/golfhit1.mp3');
        game.load.audio('golfhit2', 'assets/sounds/golfhit2.mp3');
        game.load.audio('golfhit3', 'assets/sounds/golfhit3.mp3');
        game.load.audio('golfhit4', 'assets/sounds/golfhit4.mp3');
    }
    
    let sprite_club;
    let sprite_ball;
    let map1;
    let map2;
    let layer1;
    let layer2;
    let up;
    let down;
    let left;
    let right;
    let rotateLeft;
    let rotateRight;
    let golfhit1;
    let golfhit2;
    let golfhit3;
    let golfhit4;
    function create() { //http://phaser.io/examples/v2/tilemaps/csv-map-with-p2
    	game.add.image(0,0,'background');
    	game.physics.startSystem(Phaser.Physics.P2JS);
    	golfhit1 = game.add.audio('golfhit1');//http://phaser.io/examples/v2/audio/sound-complete
    	golfhit2 = game.add.audio('golfhit2');
    	golfhit3 = game.add.audio('golfhit3');
    	golfhit4 = game.add.audio('golfhit4');
    	map1 = game.add.tilemap('map1', 32, 32);//https://www.youtube.com/watch?v=8a1uwG-Uefs&t=27s figured out how to use tiled and import tilemaps with this video.
    	map1.addTilesetImage('tiles');
    	map2 = game.add.tilemap('map2', 32, 32);
    	map2.addTilesetImage('tiles');
    	layer1 = map1.createLayer(0);
    	layer2 = map2.createLayer(0);
    	
    	layer1.resizeWorld();
    	layer2.resizeWorld();
    	
    	map1.setCollisionBetween(0, 1);
    	
    	game.physics.p2.convertTilemap(map1, layer1);
    	
    	game.physics.p2.restitution = 0.5;
    	
    	sprite_club = game.add.sprite(400,game.world.height-250, 'golfclub');
    	sprite_ball = game.add.sprite(400,game.world.height-400, 'golfball');
    	sprite_club.anchor.setTo( 0, 1 );
    	sprite_ball.scale.setTo(0.5,0.5);
    	game.physics.p2.enable(sprite_club);
    	game.physics.p2.enable(sprite_ball);
    	sprite_club.body.createBodyCallback(sprite_ball, hitBall, this); //https://phaser.io/examples/v2/p2-physics/impact-events
    	game.physics.p2.setImpactEvents(true);
        var help = game.add.text(16, 16, 'WASD TO MOVE | QE TO ROTATE', { font: '14px Arial', fill: '#ffffff' });
        help.fixedToCamera = true;
        
        //sets controls for wasd and qe //http://www.html5gamedevs.com/topic/7447-use-both-arrow-keys-and-wasd-controls/
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	rotateLeft = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    	rotateRight = game.input.keyboard.addKey(Phaser.Keyboard.E);
    }
    function hitBall(body1, body2)
    {
    	switch(game.rnd.integerInRange(1,4))//http://phaser.io/examples/v2/misc/random-generators
    	{
    	case 1:
    		golfhit1.play();
    		break;
    	case 2:
    		golfhit2.play();
    		break;
    	case 3:
    		golfhit3.play();
    		break;
    	case 4:
    		golfhit4.play();
    		break;
    	}
    }
    function update() { //https://phaser.io/examples/v2/p2-physics/world-move
    	sprite_club.body.setZeroVelocity();
    	if(left.isDown)
    	{
    		sprite_club.body.moveLeft(200);
    	} 
    	else if(right.isDown)
    	{
    		sprite_club.body.moveRight(200);
    	}
    	else if(down.isDown)
    	{
    		sprite_club.body.moveDown(200);
    	}
    	else if(up.isDown)
    	{
    		sprite_club.body.moveUp(200);
    	}
    	if(rotateLeft.isDown)
    	{
    		sprite_club.body.rotateLeft(100);
    	}
    	else if(rotateRight.isDown)
    	{
    		sprite_club.body.rotateRight(100);
    	}
    	else
    	{
    		sprite_club.body.setZeroRotation();
    	}
    		
    }
};
