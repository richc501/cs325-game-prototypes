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
    
    let game = new Phaser.Game( 800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update } );
    let map;
    let layer;
    let player;
    let up;
    let down;
    let left;
    let right;
    let bullets;
    let bulletTime = 0;
    let shoot;
    let blasterSound;
    let robots;
    let robotTimer = 0;
    let explode;
    let explosions;
    let explodeSound;
    let pressed = false;
    let firingTimer = 0;
    let enemyBullets;
    let livingEnemies = [];
    let healthBar;
    let health = 20;
    let gameStart = false;
    let stateText;
    let scoreString;
    let scoreText;
    let score = 0;
    let themeSong;
    function preload() {
    	game.load.tilemap('map', 'assets/topDown.json', null, Phaser.Tilemap.TILED_JSON);
    	game.load.image('ground', 'assets/ground.png');
    	
    	game.load.image('armyDude', 'assets/armyDude.png');//https://opengameart.org/content/army-sheet
    	game.load.image( 'bullet', 'assets/bullets.png');

    	game.load.image('heart_left', 'assets/Hearts_left.png');
    	game.load.image('heart_right', 'assets/Hearts_right.png');
        
    	game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    	game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    	game.load.image('invader', 'assets/robot.png');
    	
    	game.load.audio('blasterSound', 'assets/laser.mp3');//https://freesound.org/people/steshystesh/sounds/336501/
    	game.load.audio('explodeSound', 'assets/explosion.mp3');//https://freesound.org/people/ProjectsU012/sounds/334266/
    	game.load.audio('themeSong', 'assets/themeSong.mp3');//https://freesound.org/people/Vicces1212/sounds/86758/
    }
    
    function create() {
    	blasterSound = game.add.audio('blasterSound');
    	explodeSound = game.add.audio('explodeSound');
    	themeSong = game.add.audio('themeSong');
    	
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	
    	map = game.add.tilemap('map');
    	map.addTilesetImage('ground','ground');

    	layer = map.createLayer('groundLayer');
    
    	layer.resizeWorld();
    	
    	bullets = game.add.group();
    	bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        
        bullets.createMultiple(40, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
    	player = game.add.sprite(game.world.centerX, game.world.centerY,'armyDude');
    	game.physics.enable(player, Phaser.Physics.ARCADE);
    	
//    	player.body.collideWorldBounds = true;
    	player.checkWorldBounds = true;
    	
    	player.anchor.x = 0.5;
    	player.anchor.y = 0.5;
    	  	
    	game.camera.follow(player);
    	
        robots = game.add.group();
        robots.enableBody = true;
        robots.physicsBodyType = Phaser.Physics.ARCADE;
        robots.createMultiple(40, 'invader');
        robots.setAll('anchor.x', 0.5);
        robots.setAll('anchor.y', 0.5);
        robots.setAll('checkWorldBounds', true);
        
        spawnRobots();
    	
        explosions = game.add.group();//https://phaser.io/examples/v2/games/invaders
        explosions.enableBody = true;
        explosions.physicsBodyType = Phaser.Physics.ARCADE;
        explosions.createMultiple(50, 'kaboom');
        explosions.setAll('anchor.x', 0.5);
        explosions.setAll('anchor.y', 0.5);
    	explosions.setAll('checkWorldBounds', true);
    	
    	enemyBullets = game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(30, 'enemyBullet');
        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 0.5);
        enemyBullets.setAll('checkWorldBounds', true);
        
        healthBar = game.add.group();
    	for(let i = 0; i < 20; i++)
    	{
    		let hearts;
    		if(i==0||i%2==0)
    			hearts = healthBar.create(520+(14*i),20,'heart_left');
    		else
    			hearts = healthBar.create(520+(14*i),20,'heart_right');
    		hearts.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
    		hearts.cameraOffset.setTo(520+(14*i), 20);
    		hearts.anchor.setTo(0.5, 0.5);
    	}
        
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Comic Sans MS', fill: '#fff' });
    	scoreText.fixedToCamera = true;
        scoreText.cameraOffset.setTo(10,10);
        scoreText.visible = false;
    	
        stateText = game.add.text(400,300,'      Soldier V. Robots! \n       WASD = MOVE \n   MOVE MOUSE = AIM \n     LEFT CLICK = FIRE \n        Click To Start...', { font: '60px Comic Sans MS', fill: '#fff', boundsAlignH: "center", boundsAlignV: "middle"});
        stateText.anchor.setTo(0.5, 0.5);
        stateText.fixedToCamera = true;
        stateText.cameraOffset.setTo(400,300); 
    	
        game.input.onDown.add(playGame, this);
        
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 
   	 	game.sound.setDecodedCallback(themeSong, start, this);//https://phaser.io/examples/v2/audio/loop
    }
    function start() {
    	themeSong.loopFull(0.3);
    }
    
    function playGame()
    {
    	scoreText.visible = true;
    	stateText.visible = false;
    	gameStart = true;
    }
    
    function spawnRobots()
    {
    	let badGuy;
    	let randomX;
    	let randomY;
    	for(let i=0; i<20; i++)
    	{

    		badGuy = robots.getFirstExists(false);
    		
	    	if(badGuy)
	    	{
	    		randomX =game.rnd.integerInRange(0,game.world.centerX-50);
	    		randomY =game.rnd.integerInRange(0,game.world.centerY-50);
	    		badGuy.reset(randomX, randomY);
	    	}
    	}
    	for(let i=0; i<20; i++)
    	{
    		badGuy = robots.getFirstExists(false);
    		if(badGuy)
    		{
    			randomX =game.rnd.integerInRange(game.world.centerX+50,game.world.width);
    			randomY =game.rnd.integerInRange(game.world.centerY+50,game.world.height);
    			badGuy.reset(randomX, randomY);
    		}
    	}
    }
    
    function restart()
    {
        //  A new level starts
    	score = 0;
		scoreText.text = scoreString + score;
        health = 20;
        //resets the life count
    	healthBar.callAll('revive');
        //  And brings the aliens back from the dead :)
        robots.callAll('kill');
        enemyBullets.callAll('kill');
        spawnRobots();
        //revives the player
        player.revive();
        player.reset(game.world.centerX, game.world.centerY);
        //hides the text
        stateText.visible = false;
        gameStart = true;
    }
    
    function winState()
    {
        player.kill();
        gameStart = false;
        stateText.text="     YOU WON! \n Click to restart";
        
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
    
    function update() {
    	game.physics.arcade.collide(robots, robots);
    	game.physics.arcade.collide(robots, player);
    	game.physics.arcade.overlap(player, enemyBullets, function(player, enemyBullets) {
    		enemyBullets.kill();
    		health--;
        	let lifeHearts = healthBar.getFirstAlive();
        	if(lifeHearts)
        		lifeHearts.kill();
            // When the player dies
            if (health < 1)
            {
            	gameStart = false;
                player.kill();

                stateText.text="   GAME OVER \n Click to restart";
                
                stateText.visible = true;

                //the "click to restart" handler
                game.input.onTap.addOnce(restart,this);
            }
    	}, null, this);
    	game.physics.arcade.overlap(bullets, robots, function(bullets, robots){
    		robots.kill();
    		bullets.kill();
    	    explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(robots.body.x, robots.body.y);
    	    explode.play('kaboom', 30, false, true);
    		score += 10;
    		scoreText.text = scoreString + score;
    	    explodeSound.play();
    	}, null, this);
    	player.rotation = game.physics.arcade.angleToPointer(player);
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		if(gameStart)
		{
	    	if(up.isDown)
	    	{
	    		player.body.velocity.y = -250;
	    	}
	    	else if(down.isDown)
	    	{
	    		player.body.velocity.y = 250;
	    	}
	    	else
	    	{
				player.body.acceleration.set(0);
				player.body.velocity.y = 0;
	    	}
	    	if(left.isDown)
	    	{
	    		player.body.velocity.x = -250;
	    	} 
	    	else if(right.isDown)
	    	{
	    		player.body.velocity.x = 250;
	    	}
		}
		if(game.input.activePointer.isDown && gameStart)//shoot.isDown)
		{
			fireBullet();
		}
        if (game.time.now > firingTimer && gameStart)
        {
            enemyFires();
        }
		if(game.time.now > robotTimer && gameStart)
		{
			robots.forEach(function(item){
				switch(game.rnd.integerInRange(1,5))
				{
					case 1:
						item.body.velocity.x = game.rnd.integerInRange(-200,-100);
						item.body.velocity.y = game.rnd.integerInRange(-200,-100);
						break;
					case 2:
						item.body.velocity.x = game.rnd.integerInRange(100,200);
						item.body.velocity.y = game.rnd.integerInRange(-200,-100);
						break;	
					case 3:
						item.body.velocity.x = game.rnd.integerInRange(100,200);
						item.body.velocity.y = game.rnd.integerInRange(100,200);
						break;
					case 4:
						item.body.velocity.x = game.rnd.integerInRange(-200,-100);
						item.body.velocity.y = game.rnd.integerInRange(100,200);
						break;
					case 5:
						item.body.velocity.x = 0;
						item.body.velocity.y = 0;
						break;
				}
			}, this);
			robotTimer = game.time.now + 5000;
		}
		
		robots.forEach(function(item){
			game.world.wrap(item, 0, true);
		}, this);
		
        if(robots.countLiving()==0)
        {
        	winState();
        }
        
        game.world.wrap(player, 0, true);
    }
    
    function fireBullet () {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > bulletTime)
        {
            //  Grab the first bullet we can from the pool
            let bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                bullet.reset(player.body.x+20, player.body.y+20);
                bullet.lifespan = 2000;
                bullet.rotation = player.rotation;
                //game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
                game.physics.arcade.moveToPointer(bullet, 500)
                blasterSound.play();
                bulletTime = game.time.now + 500;
            }
        }
    }
    function enemyFires()//https://phaser.io/examples/v2/games/invaders
    {
        //  Grab the first bullet we can from the pool
        

        livingEnemies.length=0;

        robots.forEachAlive(function(alien){

            // put every living enemy in an array
            livingEnemies.push(alien);
        });
        let random=game.rnd.integerInRange(0,livingEnemies.length-1);
        let shooter=livingEnemies[random];
        
        for(let i=0;i<4;i++)
        {
	        let enemyBullet = enemyBullets.getFirstExists(false);
	        if (enemyBullet && livingEnemies.length > 0)
	        {	            
	            enemyBullet.reset(shooter.body.x, shooter.body.y);
	            enemyBullet.lifespan = 3000;
	            //game.physics.arcade.moveToObject(enemyBullet,player,200);
	            switch(i)
	            {
	            	case 0:
	            		enemyBullet.body.velocity.x = -200;
	            		enemyBullet.body.velocity.y = -200;
	            		break;
	            	case 1:
	            		enemyBullet.body.velocity.x = 200;
	            		enemyBullet.body.velocity.y = -200;
	            		break;
	            	case 2:
	            		enemyBullet.body.velocity.x = -200;
	            		enemyBullet.body.velocity.y = 200;
	            		break;
	            	case 3:
	            		enemyBullet.body.velocity.x = 200;
	            		enemyBullet.body.velocity.y = 200;
	            		break;
	            }
	            
	            firingTimer = game.time.now + 100;
	        }
        }
    }
};
