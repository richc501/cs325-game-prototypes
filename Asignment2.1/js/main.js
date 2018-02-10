"use strict";
let map;
let groundLayer;
let backgroundLayer;
let chicken_sprite;
let up;
let down;
let right;
let left;
var facing = 'idle_right';
var jumpTimer = 0;
let onWall = false;
window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    let game = new Phaser.Game( 800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
    	game.load.spritesheet('chicken','assets/chicken_sprite_sheet.png', 16, 16);//https://opengameart.org/content/solarus-chicken
    	game.load.tilemap('map', 'assets/chickenParkour2.json', null, Phaser.Tilemap.TILED_JSON);
    	game.load.image('tiles', 'assets/ground64.png');
    }
    
    function create() {
    	game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.restitution = 0.2;
        game.physics.arcade.gravity.y = 300;
    	game.stage.backgroundColor = "#a9f0ff";
    	map = game.add.tilemap('map');
    	map.addTilesetImage('ground64','tiles');
    	
    	groundLayer = map.createLayer('GroundLayer');
    	backgroundLayer = map.createLayer('BackGroundLayer');
    	groundLayer.resizeWorld();
    	map.setCollisionBetween(0,7, true, 'GroundLayer')
    	
    	
    	chicken_sprite = game.add.sprite(0,game.world.centerY, 'chicken');
    	game.physics.enable(chicken_sprite, Phaser.Physics.ARCADE);
    	
    	
    	chicken_sprite.body.collideWorldBounds = true;
    	chicken_sprite.animations.add('idle', [12,13], 4, true);
    	chicken_sprite.animations.add('right', [2,3,4,5], 7, true);
    	chicken_sprite.animations.add('left', [11,10,9,8], 7, true);
    	chicken_sprite.animations.add('jump_right', [15], 10, true);
    	chicken_sprite.animations.add('jump_left', [17], 10, true);
    	
    	chicken_sprite.body.fixedRotation = true;
    	
    	game.camera.follow(chicken_sprite);
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	
    	
    }
    
    function update() { //https://phaser.io/examples/v2/arcade-physics/platformer-basics
    	game.physics.arcade.collide(chicken_sprite, groundLayer, function(chicken_sprite, groundLayer) {//http://www.emanueleferonato.com/2017/06/16/the-basics-behind-wall-jump-in-platform-games-html5-prototype-made-with-phaser-and-arcade-physics/
    		if(chicken_sprite.body.blocked.down && !chicken_sprite.body.blocked.right && !chicken_sprite.body.blocked.left) {
    			onWall = false;
    		}
    		if(chicken_sprite.body.blocked.right && !chicken_sprite.body.blocked.down) {
    			onWall = true;
    		}
    		if(chicken_sprite.body.blocked.left && !chicken_sprite.body.blocked.down) {
    			onWall = true;
    		}
    	});
    	if(left.isDown && !onWall) {
    		chicken_sprite.body.velocity.x = -150;
    		if(facing != 'left') {
    			chicken_sprite.animations.play('left');
                facing = 'left';
    		}
    	} else if(right.isDown && !onWall) {
    		chicken_sprite.body.velocity.x = 150;
    		if(facing != 'right') {
    			chicken_sprite.animations.play('right');
    			facing = 'right';
    		}
    	} else {
    		if(chicken_sprite.body.onFloor())
    			chicken_sprite.body.velocity.x = 0;
    		if(chicken_sprite.body.onFloor() && facing != 'idle' && !(facing == 'jump_right' || facing == 'jump_left' || facing == 'jump_idle')) {
    			chicken_sprite.animations.stop();
    			facing = 'idle'
    			if(facing == 'left') {
    				chicken_sprite.frame = 6;
    				//facing = 'idle_left';
    			} else if (facing == 'right') {
    				chicken_sprite.frame = 0;
    				//facing = 'idle_right';
    			}
    			chicken_sprite.animations.play('idle');
    		}
    	}
        if (up.isDown && chicken_sprite.body.onFloor() && !onWall)
        {
        	chicken_sprite.animations.stop();
        	
        	chicken_sprite.body.velocity.y = -300;
        	if(facing == 'left'||left.isDown) {
        		facing = 'jump_right';
        	} else if (facing == 'right'||right.isDown) {
        		facing = 'jump_left';
        	} else if (facing == 'idle') {
        		facing = 'jump_idle';
        		chicken_sprite.frame = 16;
        	}
            jumpTimer = game.time.now + 750;
        } else if(chicken_sprite.body.onFloor() && (facing == 'jump_right' || facing == 'jump_left' || facing == 'jump_idle')) {
			facing = 'idle'
			chicken_sprite.animations.play('idle');
        }
        if(up.isDown && onWall && !chicken_sprite.body.onFloor())
        {
        	if(chicken_sprite.body.blocked.right) {
        		facing = 'jump_left';
        		chicken_sprite.animations.play('left');
        		chicken_sprite.body.velocity.y = -300;
        		chicken_sprite.body.velocity.x = -100;
        	}
        	if(chicken_sprite.body.blocked.left) {
        		facing = 'jump_right';
        		chicken_sprite.animations.play('right');
        		chicken_sprite.body.velocity.y = -300;
        		chicken_sprite.body.velocity.x = 100;
        	}
        }
    }
};
