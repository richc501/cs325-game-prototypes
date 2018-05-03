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
    let player2;
    let player3;
    let up;
    let down;
    let left;
    let right;
    let switchKey;
    let oneKey;
    let twoKey;
    let threeKey;
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
    let pressed2 = false;
    let firingTimer = 0;
    let enemyBullets;
    let livingEnemies = [];
    let healthBar;
    let healthBar2;
    let healthBar3;
    let health = 20;
    let healthArray = [20, 20, 20];
    let playerArray = [true, false, false];
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
    	
    	player.checkWorldBounds = true;
    	
    	player.anchor.x = 0.5;
    	player.anchor.y = 0.5;
    	  	
    	game.camera.follow(player);
    	
    	player2 = game.add.sprite(game.world.centerX, game.world.centerY+50,'armyDude');
    	game.physics.enable(player2, Phaser.Physics.ARCADE);
    	
    	player2.checkWorldBounds = true;
    	
    	player2.anchor.x = 0.5;
    	player2.anchor.y = 0.5;
    	
    	player3 = game.add.sprite(game.world.centerX, game.world.centerY-50,'armyDude');
    	game.physics.enable(player3, Phaser.Physics.ARCADE);
    	
    	player3.checkWorldBounds = true;
    	
    	player3.anchor.x = 0.5;
    	player3.anchor.y = 0.5;
    	
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
        healthBar2 = game.add.group();
        healthBar3 = game.add.group();
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
    	
    	for(let i = 0; i < 20; i++)
    	{
    		let hearts;
    		if(i==0||i%2==0)
    			hearts = healthBar2.create(520+(14*i),55,'heart_left');
    		else
    			hearts = healthBar2.create(520+(14*i),55,'heart_right');
    		hearts.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
    		hearts.cameraOffset.setTo(520+(14*i), 55);
    		hearts.anchor.setTo(0.5, 0.5);
    	}
    	
    	for(let i = 0; i < 20; i++)
    	{
    		let hearts;
    		if(i==0||i%2==0)
    			hearts = healthBar3.create(520+(14*i),90,'heart_left');
    		else
    			hearts = healthBar3.create(520+(14*i),90,'heart_right');
    		hearts.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
    		hearts.cameraOffset.setTo(520+(14*i), 90);
    		hearts.anchor.setTo(0.5, 0.5);
    	}
    	
    	healthBar2.setAll('alpha', 0.3);
    	healthBar3.setAll('alpha', 0.3);
        
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Comic Sans MS', fill: '#fff' });
    	scoreText.fixedToCamera = true;
        scoreText.cameraOffset.setTo(10,10);
        scoreText.visible = false;
    	
        stateText = game.add.text(400,300,'      Soldiers V. Robots! \n       WASD = MOVE \n   MOVE MOUSE = AIM \n     LEFT CLICK = FIRE \n       F or 1 2 3 = switch \n        Click To Start...', { font: '60px Comic Sans MS', fill: '#fff', boundsAlignH: "center", boundsAlignV: "middle"});
        stateText.anchor.setTo(0.5, 0.5);
        stateText.fixedToCamera = true;
        stateText.cameraOffset.setTo(400,300); 
    	
        game.input.onDown.add(playGame, this);
        
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    	switchKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
    	oneKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    	twoKey = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    	threeKey = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
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
        healthArray = [20, 20, 20];
        //resets the life count
    	healthBar.callAll('revive');
    	healthBar2.callAll('revive');
    	healthBar3.callAll('revive');
    	healthBar.setAll('alpha', 1);
    	healthBar2.setAll('alpha', 0.3);
    	healthBar3.setAll('alpha', 0.3);
        //  And brings the aliens back from the dead :)
        robots.callAll('kill');
        enemyBullets.callAll('kill');
        spawnRobots();
        //revives the player
        player.revive();
        player2.revive();
        player3.revive();
        player.reset(game.world.centerX, game.world.centerY);
        player2.reset(game.world.centerX, game.world.centerY+50);
        player3.reset(game.world.centerX, game.world.centerY-50);
		playerArray = [true, false, false];
		game.camera.follow(player);
        //hides the text
        stateText.visible = false;
        gameStart = true;
    }
    
    function winState()
    {
    	let countAlive = 0;
    	if(player.alive)
    		countAlive++;
    	if(player2.alive)
    		countAlive++;
    	if(player3.alive)
    		countAlive++;
    	switch(countAlive)
    	{
    		case 1:
    		score += 100;
    		scoreText.text = scoreString + score;
    		break;
    		case 2:
    		score += 250;
    		scoreText.text = scoreString + score;
    		break;
    		case 3:
    		score += 500;
    		scoreText.text = scoreString + score;
    		break
    	}
        player.kill();
        player2.kill();
        player3.kill();
        gameStart = false;
        stateText.text="     YOU WON! \n Click to restart";
        
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
    
    function gameOver()
    {
    	gameStart = false;
        player.kill();
        player2.kill();
        player3.kill();
        stateText.text="   GAME OVER \n Click to restart";
        
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
    
    function update() {
    	game.physics.arcade.collide(robots, robots);
    	game.physics.arcade.collide(robots, player);
    	game.physics.arcade.collide(robots, player2);
    	game.physics.arcade.collide(robots, player3);
    	game.physics.arcade.collide(player, player2);
    	game.physics.arcade.collide(player, player3);
    	game.physics.arcade.collide(player3, player2);
    	game.physics.arcade.overlap(player, enemyBullets, function(player, enemyBullets) {
    		enemyBullets.kill();
    		healthArray[0]--;
        	let lifeHearts = healthBar.getFirstAlive();
        	if(lifeHearts)
        		lifeHearts.kill();
            // When the player dies
            if (healthArray[0] < 1)
            {
            	player.kill();
            	if(player2.alive&&playerArray[0])
            	{
            		//switch to player 2
					playerArray = [false, true, false];
					game.camera.follow(player2);
					healthBar.setAll('alpha', 0.3);
			    	healthBar2.setAll('alpha', 1);
			    	healthBar3.setAll('alpha', 0.3);
            	}
            	else if(player3.alive&&playerArray[0])
            	{
            		//switch to player 3
					playerArray = [false, false, true];
					game.camera.follow(player3);
					healthBar.setAll('alpha', 0.3);
			    	healthBar2.setAll('alpha', 0.3);
			    	healthBar3.setAll('alpha', 1);
            	}
            }
    	}, null, this);
    	game.physics.arcade.overlap(player2, enemyBullets, function(player2, enemyBullets) {
    		enemyBullets.kill();
    		healthArray[1]--;
        	let lifeHearts = healthBar2.getFirstAlive();
        	if(lifeHearts)
        		lifeHearts.kill();
            // When the player dies
            if (healthArray[1] < 1)
            {
            	player2.kill();
            	if(player3.alive&&playerArray[1])
            	{
            		//switch to player 3
					playerArray = [false, false, true];
					game.camera.follow(player3);
					healthBar.setAll('alpha', 0.3);
			    	healthBar2.setAll('alpha', 0.3);
			    	healthBar3.setAll('alpha', 1);
            	}
            	else if(player.alive&&playerArray[1])
            	{
            		//switch to player 1
					playerArray = [true, false, false];
					game.camera.follow(player);
					healthBar.setAll('alpha', 1);
			    	healthBar2.setAll('alpha', 0.3);
			    	healthBar3.setAll('alpha', 0.3);
            	}
            }
    	}, null, this);
    	game.physics.arcade.overlap(player3, enemyBullets, function(player3, enemyBullets) {
    		enemyBullets.kill();
    		healthArray[2]--;
        	let lifeHearts = healthBar3.getFirstAlive();
        	if(lifeHearts)
        		lifeHearts.kill();
            // When the player dies
            if (healthArray[2] < 1)
            {
            	player3.kill();
            	if(player.alive&&playerArray[2])
	            {
	            	//switch to player 1
					playerArray = [true, false, false];
					game.camera.follow(player);
					healthBar.setAll('alpha', 1);
			    	healthBar2.setAll('alpha', 0.3);
			    	healthBar3.setAll('alpha', 0.3);
	            }
	            else if(player2.alive&&playerArray[2])
	            {
	            	//switch to player 2
					playerArray = [false, true, false];
					game.camera.follow(player2);
					healthBar.setAll('alpha', 0.3);
			    	healthBar2.setAll('alpha', 1);
			    	healthBar3.setAll('alpha', 0.3);
	            }
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
    	
    	if(healthArray[0]<1&&healthArray[1]<1&&healthArray[2]<1)
    	{
    		gameOver();
    	}
    	
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		player2.body.velocity.x = 0;
		player2.body.velocity.y = 0;
		player3.body.velocity.x = 0;
		player3.body.velocity.y = 0;
		if(gameStart)
		{
			if(playerArray[0])
			{
				player.rotation = game.physics.arcade.angleToPointer(player);
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
			else if(playerArray[1])
			{
				player2.rotation = game.physics.arcade.angleToPointer(player2);
		    	if(up.isDown)
		    	{
		    		player2.body.velocity.y = -250;
		    	}
		    	else if(down.isDown)
		    	{
		    		player2.body.velocity.y = 250;
		    	}
		    	else
		    	{
					player2.body.acceleration.set(0);
					player2.body.velocity.y = 0;
		    	}
		    	if(left.isDown)
		    	{
		    		player2.body.velocity.x = -250;
		    	} 
		    	else if(right.isDown)
		    	{
		    		player2.body.velocity.x = 250;
		    	}
			}
			else if(playerArray[2])
			{
				player3.rotation = game.physics.arcade.angleToPointer(player3);
		    	if(up.isDown)
		    	{
		    		player3.body.velocity.y = -250;
		    	}
		    	else if(down.isDown)
		    	{
		    		player3.body.velocity.y = 250;
		    	}
		    	else
		    	{
					player3.body.acceleration.set(0);
					player3.body.velocity.y = 0;
		    	}
		    	if(left.isDown)
		    	{
		    		player3.body.velocity.x = -250;
		    	} 
		    	else if(right.isDown)
		    	{
		    		player3.body.velocity.x = 250;
		    	}
			}
		}
		if(game.input.activePointer.isDown && gameStart)//shoot.isDown)
		{
			fireBullet();
		}
		if(switchKey.isDown && gameStart)
		{
			if(!pressed)
			{
				if(playerArray[0]&&player2.alive)
				{
					//switch to player 2
					playerArray = [false, true, false];
					game.camera.follow(player2);
					healthBar.setAll('alpha', 0.3);
			    	healthBar2.setAll('alpha', 1);
			    	healthBar3.setAll('alpha', 0.3);
				}
				else if(playerArray[1]&&player3.alive)
				{
					//switch to player 3
					playerArray = [false, false, true];
					game.camera.follow(player3);
					healthBar.setAll('alpha', 0.3);
			    	healthBar2.setAll('alpha', 0.3);
			    	healthBar3.setAll('alpha', 1);
				}
				else if(playerArray[2]&&player.alive)
				{
					//switch to player 1
					playerArray = [true, false, false];
					game.camera.follow(player);
					healthBar.setAll('alpha', 1);
			    	healthBar2.setAll('alpha', 0.3);
			    	healthBar3.setAll('alpha', 0.3);
				}

				pressed = true;
			}
		}
		if(!pressed2&&gameStart)
		{
			if(oneKey.isDown&&player.alive)
			{
				//switch to player 1
				playerArray = [true, false, false];
				game.camera.follow(player);
				healthBar.setAll('alpha', 1);
		    	healthBar2.setAll('alpha', 0.3);
		    	healthBar3.setAll('alpha', 0.3);
			}
			else if(twoKey.isDown&&player2.alive)
			{
				//switch to player 2
				playerArray = [false, true, false];
				game.camera.follow(player2);
				healthBar.setAll('alpha', 0.3);
		    	healthBar2.setAll('alpha', 1);
		    	healthBar3.setAll('alpha', 0.3);
			}
			else if(threeKey.isDown&&player3.alive)
			{
				//switch to player 3
				playerArray = [false, false, true];
				game.camera.follow(player3);
				healthBar.setAll('alpha', 0.3);
		    	healthBar2.setAll('alpha', 0.3);
		    	healthBar3.setAll('alpha', 1);
			}
			pressed2=true;
		}

		if(switchKey.isUp)
		{
			pressed = false;
		}
		
		if(oneKey.isUp||twoKey.isUp||threeKey.isUp)
		{
			pressed2 = false;
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
        game.world.wrap(player2, 0, true);
        game.world.wrap(player3, 0, true);
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
            	if(playerArray[0])
            	{
	                bullet.reset(player.body.x+20, player.body.y+20);
	                bullet.lifespan = 2000;
	                bullet.rotation = player.rotation;
	                game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
	                game.physics.arcade.moveToPointer(bullet, 500)
	                blasterSound.play();
	                bulletTime = game.time.now + 500;
            	}
            	else if(playerArray[1])
            	{
	                bullet.reset(player2.body.x+20, player2.body.y+20);
	                bullet.lifespan = 2000;
	                bullet.rotation = player2.rotation;
	                game.physics.arcade.velocityFromRotation(player2.rotation, 400, bullet.body.velocity);
	                game.physics.arcade.moveToPointer(bullet, 500)
	                blasterSound.play();
	                bulletTime = game.time.now + 500;
            	}
            	else if(playerArray[2])
            	{
	                bullet.reset(player3.body.x+20, player3.body.y+20);
	                bullet.lifespan = 2000;
	                bullet.rotation = player.rotation;
	                game.physics.arcade.velocityFromRotation(player3.rotation, 400, bullet.body.velocity);
	                game.physics.arcade.moveToPointer(bullet, 500)
	                blasterSound.play();
	                bulletTime = game.time.now + 500;
            	}
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
