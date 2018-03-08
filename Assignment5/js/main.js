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
    
    let game = new Phaser.Game( 800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render } );
    let map;
    let waterLayer;
    let islandLayer;
    let fortLayer;
    let rockLayer;
    let player;
    let up;
    let down;
    let rotateRight;
    let rotateLeft;
    let fireLeft;
    let fireRight;
    let cannonBall_Player;
    let cannonTimerRight = 0;
    let cannonTimerLeft = 0;
    let healthCount = 10;
    let lifeCount = 3;
    let healthBar;
    let lifeBar;
    let templars;
    let templarMoveTimer = 0;
    let enemyBalls;
    let firingTimer = 0;
    let livingEnemies = [];
    let explodeSound;
    let explosions;
    let deathSound;
    let gameOverSound;
    let gameStart = false;
    let score = 0;
    let scoreString = '';
    let scoreText;
    let stateText;
    let themeSong;
    function preload() 
    {
    	game.load.tilemap('map', 'assets/pirategame.json', null, Phaser.Tilemap.TILED_JSON);
    	//http://kenney.nl/assets/pirate-pack
    	game.load.image('tiles_sheet', 'assets/tiles_sheet.png');
    	game.load.image('cannon_ball', 'assets/cannonBall.png');
    	game.load.image('ship', 'assets/playership.png');
    	game.load.image('templar', 'assets/enemy.png');
    	game.load.image('heart', 'assets/health/heart.png');
    	game.load.image('lives', 'assets/health/lives.png');
    	
    	
    	
    	game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);//https://phaser.io/examples/v2/games/tanks
    	game.load.audio('explodeSound', 'assets/sounds/explosion.mp3');//https://freesound.org/people/ProjectsU012/sounds/334266/
    	game.load.audio('deathSound', 'assets/sounds/death-sound.mp3');//https://freesound.org/people/ProjectsU012/sounds/333785/
    	game.load.audio('gameOver', 'assets/sounds/game-over2.mp3');//https://freesound.org/people/deleted_user_877451/sounds/76376/
    	game.load.audio('themeSong', 'assets/sounds/loop.mp3')//https://freesound.org/people/ShadyDave/sounds/325407/
    }

    function create() 
    {
    	themeSong = game.add.audio('themeSong');
    	explodeSound = game.add.audio('explodeSound');
    	deathSound = game.add.audio('deathSound');
    	gameOverSound = game.add.audio('gameOver');
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	map = game.add.tilemap('map');
    	map.addTilesetImage('tiles_sheet','tiles_sheet');
    	waterLayer = map.createLayer('waterLayer');
    	islandLayer = map.createLayer('islandLayer');
    	fortLayer = map.createLayer('fortLayer');
    	rockLayer = map.createLayer('rockLayer');
    	waterLayer.resizeWorld();
    	map.setCollisionBetween(0,94, true, 'islandLayer');
    	map.setCollisionBetween(0,94, true, 'fortLayer');
    	
    	templars = game.add.group();
        templars.enableBody = true;
        templars.physicsBodyType = Phaser.Physics.ARCADE;
        templars.createMultiple(80, 'templar');
        templars.setAll('anchor.x', 0.5);
        templars.setAll('anchor.y', 0.5);
        templars.setAll('checkWorldBounds', true);
        
        spawnTemplars();
        
        explosions = game.add.group();//https://phaser.io/examples/v2/games/invaders
        explosions.enableBody = true;
        explosions.physicsBodyType = Phaser.Physics.ARCADE;
        explosions.createMultiple(50, 'kaboom');
        explosions.setAll('anchor.x', 0.5);
        explosions.setAll('anchor.y', 0.5);
    	explosions.setAll('checkWorldBounds', true);
        
    	enemyBalls = game.add.group();
    	enemyBalls.enableBody = true;
    	enemyBalls.physicsBodyType = Phaser.Physics.ARCADE;
    	enemyBalls.createMultiple(30, 'cannon_ball');
    	enemyBalls.setAll('anchor.x', 0.5);
    	enemyBalls.setAll('anchor.y', 0.5);
    	enemyBalls.setAll('checkWorldBounds', true);
        
        cannonBall_Player = game.add.group();
    	cannonBall_Player.enableBody = true;
    	cannonBall_Player.physicsBodyType = Phaser.Physics.ARCADE;
    	
    	cannonBall_Player.createMultiple(200, 'cannon_ball');
    	cannonBall_Player.setAll('anchor.x', 0.5);
    	cannonBall_Player.setAll('anchor.y', 0.5);
    	
    	player = game.add.sprite(100,game.world.centerY, 'ship');
    	game.physics.enable(player, Phaser.Physics.ARCADE);
    	player.checkWorldBounds = true;
    	player.anchor.x = 0.5;
    	player.anchor.y = 0.5;
    	game.camera.follow(player);
    	
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Comic Sans MS', fill: '#fff' });
    	scoreText.fixedToCamera = true;
        scoreText.cameraOffset.setTo(10,10);
        scoreText.visible = false;
    	
        //  Text
        stateText = game.add.text(400,300,'   The Lone Pirate! \n       W = MOVE \n S = DROP ANCHOR \n   AD = ROTATE \n      JK = FIRE \n   Click To Start...', { font: '50px Comic Sans MS', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.fixedToCamera = true;
        stateText.cameraOffset.setTo(400,300);  
    	
        healthBar = game.add.group();
    	lifeBar = game.add.group();
    	for(let i = 0; i < 10; i++)
    	{
    		let crew = healthBar.create(560+(25*i),20,'heart');
    		crew.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
    		crew.cameraOffset.setTo(560+(25*i), 20);
    		crew.anchor.setTo(0.5, 0.5);
    	}
        for (let i = 0; i < 3; i++) //https://phaser.io/examples/v2/games/invaders
        {
            let sail = lifeBar.create(620 + (70 * i), 70, 'lives');
            sail.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
            sail.cameraOffset.setTo(620 + (70 * i), 70);
            sail.anchor.setTo(0.5, 0.5);
        }
    	
        game.input.onDown.add(playGame, this);
        
    	//controls
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	rotateLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	rotateRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	fireLeft = game.input.keyboard.addKey(Phaser.Keyboard.J);
    	fireRight = game.input.keyboard.addKey(Phaser.Keyboard.K);
    	
    	game.sound.setDecodedCallback(themeSong, start, this);//https://phaser.io/examples/v2/audio/loop
    }
    function start() {
    	themeSong.loopFull(0.6);
    }
    function playGame()
    {
    	scoreText.visible = true;
    	stateText.visible = false;
    	gameStart = true;
    }
    
    function spawnTemplars()
    {
    	let badGuy;
    	let randomX;
    	let randomY;
    	let leftBound;
    	let rightBound;
    	for(let j = 1; j<5; j++)
    	{
    		switch(j)
    		{
	    		case 1:
	    			leftBound = 550;
	    			rightBound = 770;
	    			break;
	    		case 2:
	    			leftBound = 950;
	    			rightBound = 1000;
	    			break;
	    		case 3:
	    			leftBound = 1415;
	    			rightBound = 2000;
	    			break;
	    		case 4:
	    			leftBound = 2960;
	    			rightBound = game.world.width;
	    			break;
    		}
	    	for(let i = 0;i<20;i++)
	    	{
	    		badGuy = templars.getFirstExists(false);
	    		
		    	if(badGuy)
		    	{
		    		randomX =game.rnd.integerInRange(leftBound,rightBound);
		    		randomY =game.rnd.integerInRange(0,game.world.height);
		    		badGuy.reset(randomX, randomY);
		    	}
	    	}
    	}
    }
    function update() //https://phaser.io/examples/v2/arcade-physics/asteroids-movement
    {
    	game.physics.arcade.collide(player, islandLayer);
    	game.physics.arcade.collide(templars, player);
    	game.physics.arcade.collide(templars, templars);
    	game.physics.arcade.collide(templars, islandLayer);
    	game.physics.arcade.collide(templars, enemyBalls, function(fortLayer, enemyBalls){
    		enemyBalls.kill();
    	});
    	game.physics.arcade.collide(fortLayer, enemyBalls);
    	game.physics.arcade.collide(fortLayer, cannonBall_Player);
    	game.physics.arcade.overlap(templars, cannonBall_Player, function(templars, cannonBall_Player){
    		cannonBall_Player.kill();
            let explosion = explosions.getFirstExists(false);
            explosion.animations.add('kaboom');
            explosion.reset(templars.body.x, templars.body.y);
            explosion.play('kaboom', 30, false, true);
            explodeSound.play();
            templars.kill();
    		score += 100;
    		scoreText.text = scoreString + score;
    	}, null, this);
    	game.physics.arcade.overlap(player, enemyBalls, function(player, enemyBalls){
    		enemyBalls.kill();
        	healthCount--;
            let life = healthBar.getFirstAlive();

            if (life)
            {
            	life.kill();
            }

            //  And create an explosion :)
            let explosion = explosions.getFirstExists(false);
            explosion.animations.add('kaboom');
            explosion.reset(player.body.x, player.body.y);
            explosion.play('kaboom', 30, false, true);
            explodeSound.play();

            // When the player dies
            if (healthCount < 1)
            {
                player.kill();
                respawn(player);
            }
    	}, null, this);
    	if(gameStart == true)
    	{
	    	if(up.isDown)
	    	{
	    		game.physics.arcade.accelerationFromRotation(player.rotation, 100, player.body.acceleration);
	    	}
	    	else
	    	{
	    		player.body.acceleration.set(0);
	    	}
	    	if(down.isDown)
	    	{
				player.body.acceleration.set(0);
				player.body.velocity.y = 0;
				player.body.velocity.x = 0;
	    	}
			if (rotateLeft.isDown)
			{
				player.body.angularVelocity = -200;
			}
			else if (rotateRight.isDown)
			{
				player.body.angularVelocity = 200;
			}
			else
			{
				player.body.angularVelocity = 0;
			}
			
			if(fireLeft.isDown)
			{
				Player_FireCannonLeft();
			}
			
			if(fireRight.isDown)
			{
				Player_FireCannonRight();
			}
    	}
        if(game.time.now > templarMoveTimer && gameStart)//templar movement
        {
        	//https://stackoverflow.com/a/24356149
        	templars.forEach(function(item) {
        		let rng = game.rnd.integerInRange(1,3);
        		game.physics.arcade.accelerationFromRotation(item.rotation, 100, item.body.acceleration);
        		switch(rng)
        		{
        		case 1:
        			player.body.acceleration.set(0);
        			player.body.velocity.y = 0;
        			player.body.velocity.x = 0;
        			break;
        		case 2:
        			item.body.angularVelocity = game.rnd.integerInRange(-100,100);
        			break;
        		case 3:
        			item.body.angularVelocity = 0;
        			break;
        		}	
        	}, this);
        	templarMoveTimer = game.time.now + 5000;
        }
        if(game.time.now > firingTimer && gameStart)
        {
        	enemyFires();
        }
        templars.forEach(function(item){
        	game.world.wrap(item, 0, true);
        });
        game.world.wrap(player, 0, true);
        if(templars.countLiving()==0)
        {
        	winState();
        }
    }
    
    function Player_FireCannonLeft()
    {
        if (game.time.now > cannonTimerLeft)
        {
            //  Grab the first bullet we can from the pool
            let cannon = cannonBall_Player.getFirstExists(false);

            if (cannon)
            {
                //  And fire it
            	cannon.reset(player.body.x + 64, player.body.y + 16);
            	cannon.lifespan = 2000;
            	cannon.rotation = player.rotation;
                game.physics.arcade.velocityFromRotation(player.rotation, 400, cannon.body.velocity);
                // cannon blast sound here
                cannonTimerLeft = game.time.now + 500;
            }
        }
    }
    
    function Player_FireCannonRight()
    {
        if (game.time.now > cannonTimerRight)
        {
            //  Grab the first bullet we can from the pool
            let cannon = cannonBall_Player.getFirstExists(false);

            if (cannon)
            {
                //  And fire it
            	cannon.reset(player.body.x + 64, player.body.y + 48);
            	cannon.lifespan = 2000;
            	cannon.rotation = player.rotation;
                game.physics.arcade.velocityFromRotation(player.rotation, 400, cannon.body.velocity);
                // cannon blast sound here
                cannonTimerRight = game.time.now + 500;
            }
        }
    }
    
    function enemyFires()//https://phaser.io/examples/v2/games/invaders
    {
        //  Grab the first bullet we can from the pool
        let enemyCannonBall = enemyBalls.getFirstExists(false);

        livingEnemies.length=0;

        templars.forEachAlive(function(templar){

            // put every living enemy in an array
            livingEnemies.push(templar);
        });


        if (enemyCannonBall && livingEnemies.length > 0)
        {
            
            let random=game.rnd.integerInRange(0,livingEnemies.length-1);

            // randomly select one of them
            let shooter=livingEnemies[random];
            // And fire the bullet from this enemy
            enemyCannonBall.reset(shooter.body.x, shooter.body.y);
            enemyCannonBall.lifespan = 2500;
            game.physics.arcade.moveToObject(enemyCannonBall,player,200);
            firingTimer = game.time.now + 500;
        }
    }
    
    function respawn(sprite) {
    	lifeCount--;
    	let life = lifeBar.getFirstAlive();
    	if(life)
    		life.kill();
        // When the player dies
        if (lifeCount < 1)
        {	
        	player.kill();
            game.camera.y = 1300;
            game.camera.x = 0;
        	gameStart = false;
            gameOverSound.play();
            stateText.text="     Game Over! \n Click to restart";
            stateText.visible = true;            
            //the "click to restart" handler
            game.input.onTap.addOnce(restart,this);
        } else {
        	deathSound.play();
            game.camera.y = 1300;
            game.camera.x = 0;
            healthCount = 10;
            healthBar.callAll('revive');
            enemyBalls.callAll('kill');
            player.reset(100,game.world.centerY);
        }
    }
    
    function restart () 
    {

        //  A new level starts
    	score = 0;
		scoreText.text = scoreString + score;
        healthCount = 10;
		lifeCount = 3;
        //resets the life count
    	lifeBar.callAll('revive');
    	healthBar.callAll('revive');
        //  And brings the aliens back from the dead :)
        templars.callAll('kill');
        enemyBalls.callAll('kill');
        spawnTemplars();
        //revives the player
        player.revive();
        player.reset(100,game.world.centerY);
        if(game.camera.target == null)
        	game.camera.follow(chicken_sprite);
        //hides the text
        stateText.visible = false;
        gameStart = true;
    }
    
    function winState()
    {
        player.kill();
        gameStart = false;
		score += 900;
		scoreText.text = scoreString + score;
        
        stateText.text="     YOU WON! \n Click to restart";
        
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
    
    function render() 
    {
    	//game.debug.text('Active Templars: ' + templars.countLiving() + ' / ' + templars.length, 32, 40);
    	//game.debug.text('Camera x: ' + game.camera.x + 'Camera width: ' + game.camera.width , 32, 80);
//    	game.debug.text('X:'+ game.input.mousePointer.worldX + ' Y: ' + game.input.mousePointer.worldY,32,100); //MAKES PLACING SPRITES DOWN EASIER OMG
//    	game.debug.cameraInfo(game.camera, 32, 32);

    }
};
