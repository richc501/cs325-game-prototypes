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
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'background', 'assets/background.png' );
        game.load.image( 'green', 'assets/green.png');
        game.load.image( 'golfclub', 'assets/golfclub.png');
        game.load.image( 'golfball', 'assets/golfball.png');
    }
    
    let sprite_club;
    let sprite_ball;
    let ground;
    let up;
    let down;
    let left;
    let right;
    let rotateLeft;
    let rotateRight;
    function create() {
    	game.add.image(0,0,'background');
    	
    	game.physics.startSystem(Phaser.Physics.P2JS);
    	game.physics.p2.restitution = 0.8;
    	ground = game.add.sprite(400,600,'green');

    	sprite_club = game.add.sprite(1,0, 'golfclub');
    	sprite_club.body.setZeroDamping();
    	sprite_club.body.fixedRotation = true;
    	sprite_ball = game.add.sprite(0,1, 'golfball');
    	sprite_club.anchor.setTo( 0, 1 );
    	game.physics.p2.enable(sprite_club);
    	game.physics.p2.enable(sprite_ball);
    	game.physics.p2.enable(ground);
    	ground.body.static = true;//makes ground not move
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	rotateLeft = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    	rotateRight = game.input.keyboard.addKey(Phaser.Keyboard.E);
    }
    
    function update() {
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
