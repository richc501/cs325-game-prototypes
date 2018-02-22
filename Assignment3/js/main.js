"use strict";

window.onload = function() {
    
    let game = new Phaser.Game( 800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update} );
    
    let map;
    let background;
    let player;
    let bulletTime = 0;
    let up;
    let down;
    let right;
    let left;
    let rotateLeft;
    let rotateRight;
    let shoot;
    let bullets;
    let bullet;
    let asteroid1;
    let asteroid2;
    let asteroid3;
    let explode;
    let explosions;
    let explodeSound;
    let asteroidTime = 1000;
    let lives = 5;
    let lifeBar;
    let stars;
    let score = 0;
    let scoreString = '';
    let scoreText;
    let aliens;
    let alienTime = 1000;
    let livingEnemies = [];
    let enemyBullets;
    let firingTimer = 0;
    let stateText;
    let gameStart = false;
    let pickUpSound;
    let blasterSound;
    let themeSong;
    function preload() 
    {
    	game.load.image( 'star', 'assets/redStar.png');//https://opengameart.org/content/blue-star //made it red with photoshop
    	//https://phaser.io/examples/v2/arcade-physics/asteroids-movement
        game.load.image( 'asteroid1', 'assets/asteroid1.png' );
        game.load.image( 'asteroid2', 'assets/asteroid2.png' );
        game.load.image( 'asteroid3', 'assets/asteroid3.png' );
        game.load.image('ship', 'assets/ship.png');
        game.load.image('space', 'assets/deep-space.jpg');
        //https://phaser.io/examples/v2/games/invaders
        game.load.image( 'bullet', 'assets/bullets.png')
        game.load.image('enemyBullet', 'assets/enemy-bullet.png');
        game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
        game.load.spritesheet('invader', 'assets/invader32x32x4.png', 32, 32);
        game.load.tilemap('map', 'assets/stargazer2.json', null, Phaser.Tilemap.TILED_JSON);
    
        game.load.audio('explodeSound', 'assets/sounds/explosion.mp3');//https://freesound.org/people/ProjectsU012/sounds/334266/
        game.load.audio('pickUp', 'assets/sounds/pickup.mp3');//https://freesound.org/people/juancamiloorjuela/sounds/204318/
        game.load.audio('blasterSound', 'assets/sounds/laser.mp3');//https://freesound.org/people/steshystesh/sounds/336501/
        game.load.audio('themeSong', 'assets/sounds/loop.mp3');//https://freesound.org/people/zagi2/sounds/264778/
    }
      
    function create() 
    {
    	themeSong = game.add.audio('themeSong');
    	explodeSound = game.add.audio('explodeSound');
    	pickUpSound = game.add.audio('pickUp');
    	blasterSound = game.add.audio('blasterSound');
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	map = game.add.tilemap('map');
    	map.addTilesetImage('space','space');
    	background = map.createLayer('backgroundLayer');
    	background.resizeWorld();
    	
    	player = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
    	game.physics.enable(player, Phaser.Physics.ARCADE);
    	player.body.collideWorldBounds = true;
    	player.checkWorldBounds = true;
    	player.anchor.x = 0.5;
    	player.anchor.y = 0.5;
    	game.camera.follow(player);
    	
    	//https://phaser.io/examples/v2/arcade-physics/asteroids-movement
    	bullets = game.add.group();
    	bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        
        bullets.createMultiple(40, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        
        asteroid1 = game.add.group();
        asteroid1.enableBody = true;
        asteroid1.physicsBodyType = Phaser.Physics.ARCADE;
        asteroid1.createMultiple(60, 'asteroid1');
        asteroid1.setAll('anchor.x', 0.5);
        asteroid1.setAll('anchor.y', 0.5);
        asteroid1.setAll('checkWorldBounds', true);
        
        asteroid2 = game.add.group();
        asteroid2.enableBody = true;
        asteroid2.physicsBodyType = Phaser.Physics.ARCADE;
        asteroid2.createMultiple(60, 'asteroid2');
        asteroid2.setAll('anchor.x', 0.5);
        asteroid2.setAll('anchor.y', 0.5);
        asteroid2.setAll('checkWorldBounds', true);
        
        asteroid3 = game.add.group();
        asteroid3.enableBody = true;
        asteroid3.physicsBodyType = Phaser.Physics.ARCADE;
        asteroid3.createMultiple(60, 'asteroid3');
        asteroid3.setAll('anchor.x', 0.5);
        asteroid3.setAll('anchor.y', 0.5);
        asteroid3.setAll('checkWorldBounds', true);
    	
        spawnAsteroids();
        
        stars = game.add.group();
        stars.enableBody = true;
        stars.physicsBodyType = Phaser.Physics.ARCADE;
        stars.createMultiple(20, 'star');
        stars.setAll('anchor.x', 0.5);
        stars.setAll('anchor.y', 0.5);
        stars.setAll('checkWorldBounds', true);
    	
        spawnStars()
        
        //  The baddies! //https://phaser.io/examples/v2/games/invaders
        aliens = game.add.group();
        aliens.enableBody = true;
        aliens.physicsBodyType = Phaser.Physics.ARCADE;
        aliens.createMultiple(80, 'invader');
        aliens.setAll('anchor.x', 0.5);
        aliens.setAll('anchor.y', 0.5);
        aliens.setAll('checkWorldBounds', true);
        
        spawnAliens();
        
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
    	
    //  The score //https://phaser.io/examples/v2/games/invaders
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Comic Sans MS', fill: '#fff' });
    	scoreText.fixedToCamera = true;
        scoreText.cameraOffset.setTo(10,10);
        scoreText.visible = false;
        //  Text
        stateText = game.add.text(400,300,'Fighter Stargazer! \n  WASD = MOVE \n   QE = ROTATE \n Spacebar = FIRE \n    Click To Start...', { font: '84px Comic Sans MS', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.fixedToCamera = true;
        stateText.cameraOffset.setTo(400,300);        
        
    	lifeBar = game.add.group()
    	for (let i = 0; i < 5; i++) //https://phaser.io/examples/v2/games/invaders
        {
            let ship = lifeBar.create(650 + (32 * i), 20, 'ship');
            ship.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
            ship.cameraOffset.setTo(650 + (32 * i), 20);
            ship.anchor.setTo(0.5, 0.5);
            ship.alpha = 0.7;
        }
        
    	game.input.onDown.add(playGame, this);
    	
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	rotateLeft = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    	rotateRight = game.input.keyboard.addKey(Phaser.Keyboard.E);
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
    function spawnAliens()
    {
    	let badGuy;
    	let randomX;
    	let randomY;
    	for(let i=0; i<40; i++)
    	{

    		badGuy = aliens.getFirstExists(false);
    		
	    	if(badGuy)
	    	{
	    		randomX =game.rnd.integerInRange(0,game.world.centerX-50);
	    		randomY =game.rnd.integerInRange(0,game.world.centerY-50);
	    		//badGuy.body.collideWorldBounds = true;
	    		badGuy.reset(randomX, randomY);
	    		badGuy.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
	    		badGuy.play('fly');
	    	}
    	}
    	for(let i=0; i<40; i++)
    	{
    		badGuy = aliens.getFirstExists(false);
    		if(badGuy)
    		{
    			randomX =game.rnd.integerInRange(game.world.centerX+50,game.world.width);
    			randomY =game.rnd.integerInRange(game.world.centerY+50,game.world.height);
    			badGuy.reset(randomX, randomY);
    			//badGuy.body.collideWorldBounds = true;
	    		badGuy.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
	    		badGuy.play('fly');
    		}
    	}
    }
    function spawnStars()
    {   
    	let star;
    	let randomX;
        let randomY;
    	for(let i=0; i<10; i++)
    	{

    		star = stars.getFirstExists(false);
	    	if(star)
	    	{
	    		randomX =game.rnd.integerInRange(0,game.world.centerX-50);
	    		randomY =game.rnd.integerInRange(0,game.world.centerY-50);
	    		star.reset(randomX, randomY);
	    	}
    	}
    	for(let i=0; i<10; i++)
    	{
    		star = stars.getFirstExists(false);
    		if(star)
    		{
    			randomX =game.rnd.integerInRange(game.world.centerX+50,game.world.width);
    			randomY =game.rnd.integerInRange(game.world.centerY+50,game.world.height);
    			star.reset(randomX, randomY);
    		}
    	}
    }
    function spawnAsteroids()
    {
    	let randomX;
    	let randomY;
    	let asteroid_1;
    	let asteroid_2;
    	let asteroid_3;
    	for(let i=0; i<30; i++)
    	{
        	asteroid_1 = asteroid1.getFirstExists(false);
        	asteroid_2 = asteroid2.getFirstExists(false);
        	asteroid_3 = asteroid3.getFirstExists(false);
	    	if(asteroid_1)
	    	{
	    		randomX =game.rnd.integerInRange(0,game.world.centerX-50);
	    		randomY =game.rnd.integerInRange(0,game.world.centerY-50);
	    		//asteroid_1.body.collideWorldBounds = true;
	    		asteroid_1.reset(randomX, randomY);
	    	}
	    	if(asteroid_2)
	    	{
	    		randomX =game.rnd.integerInRange(0,game.world.centerX-50);
	    		randomY =game.rnd.integerInRange(0,game.world.centerY-50);
	    		//asteroid_2.body.collideWorldBounds = true;
	    		asteroid_2.reset(randomX, randomY);
	    	}
	    	if(asteroid_3)
	    	{
	    		randomX =game.rnd.integerInRange(0,game.world.centerX-50);
	    		randomY =game.rnd.integerInRange(0,game.world.centery-50);
	    		//asteroid_3.body.collideWorldBounds = true;
	    		asteroid_3.reset(randomX, randomY);
	    	}
    	}
    	for(let i=0; i<30; i++)
    	{
        	asteroid_1 = asteroid1.getFirstExists(false);
        	asteroid_2 = asteroid2.getFirstExists(false);
        	asteroid_3 = asteroid3.getFirstExists(false);
	    	if(asteroid_1)
	    	{
	    		randomX =game.rnd.integerInRange(game.world.centerX+50,game.world.width);
	    		randomY =game.rnd.integerInRange(game.world.centerY+50,game.world.height);
	    		//asteroid_1.body.collideWorldBounds = true;
	    		asteroid_1.reset(randomX, randomY);
	    	}
	    	if(asteroid_2)
	    	{
	    		randomX =game.rnd.integerInRange(game.world.centerX+50,game.world.width);
	    		randomY =game.rnd.integerInRange(game.world.centerY+50,game.world.height);
	    		//asteroid_2.body.collideWorldBounds = true;
	    		asteroid_2.reset(randomX, randomY);
	    	}
	    	if(asteroid_3)
	    	{
	    		randomX =game.rnd.integerInRange(game.world.centerX+50,game.world.width);
	    		randomY =game.rnd.integerInRange(game.world.centerY+50,game.world.height);
	    		//asteroid_3.body.collideWorldBounds = true;
	    		asteroid_3.reset(randomX, randomY);
	    	}
    	}
    }
    function restart () 
    {

        //  A new level starts
    	score = 0;
		scoreText.text = scoreString + score;
        lives = 5;
        //resets the life count
    	lifeBar.callAll('revive');
        //  And brings the aliens back from the dead :)
        aliens.callAll('kill');
        stars.callAll('kill');
        asteroid1.callAll('kill');
        asteroid2.callAll('kill');
        asteroid3.callAll('kill');
        enemyBullets.callAll('kill');
        spawnAliens();
        spawnStars();
        spawnAsteroids();
        //revives the player
        player.revive();
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
    function update() 
    {

    	game.physics.arcade.collide(asteroid1,asteroid1);
    	game.physics.arcade.collide(asteroid1,asteroid2);
    	game.physics.arcade.collide(asteroid1,asteroid3);
    	game.physics.arcade.collide(asteroid2,asteroid2);
    	game.physics.arcade.collide(asteroid2,asteroid3);
    	game.physics.arcade.collide(asteroid3,asteroid3);
    	game.physics.arcade.collide(player, asteroid1);
    	game.physics.arcade.collide(player, asteroid2);
    	game.physics.arcade.collide(player, asteroid3);
    	game.physics.arcade.collide(aliens, aliens);
    	game.physics.arcade.collide(aliens,asteroid1);
    	game.physics.arcade.collide(aliens,asteroid2);
    	game.physics.arcade.collide(aliens,asteroid3);
    	game.physics.arcade.collide(enemyBullets,enemyBullets);
    	game.physics.arcade.collide(aliens,enemyBullets);
    	game.physics.arcade.collide(aliens,player);
    	game.physics.arcade.overlap(player, enemyBullets, function(player, enemyBullets){
        	enemyBullets.kill();
        	lives--;
            let life = lifeBar.getFirstAlive();

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
            if (lives < 1)
            {
            	gameStart = false;
                player.kill();

                stateText.text="   GAME OVER \n Click to restart";
                
                stateText.visible = true;

                //the "click to restart" handler
                game.input.onTap.addOnce(restart,this);
            }
    	}, null, this);
    	game.physics.arcade.overlap(enemyBullets, asteroid1, function(enemyBullets, asteroid1){
    		enemyBullets.kill();
    	}, null, this);
    	game.physics.arcade.overlap(enemyBullets, asteroid2, function(enemyBullets, asteroid2){
    		enemyBullets.kill();
    	}, null, this);
    	game.physics.arcade.overlap(enemyBullets, asteroid3, function(enemyBullets, asteroid3){
    		enemyBullets.kill();
    	}, null, this);
    	game.physics.arcade.overlap(bullets, aliens, function(bullets, aliens){
    		aliens.kill();
    		bullets.kill();
    	    explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(aliens.body.x, aliens.body.y);
    	    explode.play('kaboom', 30, false, true);
    		score += 10;
    		scoreText.text = scoreString + score;
    	    explodeSound.play();
    	}, null, this);
    	game.physics.arcade.overlap(player, stars, function(player, stars){
    		stars.kill();
    		pickUpSound.play();
    		score += 100;
    		scoreText.text = scoreString + score;
    	}, null, this)
    	game.physics.arcade.overlap(bullets, asteroid1, function(bullets, asteroid1){
    		asteroid1.kill();
    		bullets.kill();
    	    explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(asteroid1.body.x, asteroid1.body.y);
    	    explode.play('kaboom', 30, false, true);
    	    explodeSound.play();
    	}, null, this);
    	game.physics.arcade.overlap(bullets, asteroid2, function(bullets, asteroid2){
    		asteroid2.kill();
    		bullets.kill();
    	    explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(asteroid2.body.x, asteroid2.body.y);
    	    explode.play('kaboom', 30, false, true);
    	    explodeSound.play();
    	}, null, this);
    	game.physics.arcade.overlap(bullets, asteroid3, function(bullets, asteroid3){
    		asteroid3.kill();
    		bullets.kill();
    	    explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(asteroid3.body.x, asteroid3.body.y);
    	    explode.play('kaboom', 30, false, true);
    	    explodeSound.play();
    	}, null, this);
    	//https://phaser.io/examples/v2/arcade-physics/asteroids-movement
    	if(gameStart)
    	{
    		if (up.isDown)
    		{
    			game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
    			player.body.velocity.y = -200;
    		}
    		else if(down.isDown)
    		{
    			player.body.velocity.y = 200;
        	}
    		else
    		{
    			player.body.acceleration.set(0);
    			player.body.velocity.y = 0;
    		}
    		if (left.isDown)
    		{
    			player.body.velocity.x = -200;
    		}
    		else if (right.isDown)
    		{
    			player.body.velocity.x = 200;
    		} 
    		else
    		{
    			player.body.velocity.x = 0;
    		}
    		
    		if (rotateLeft.isDown)
    		{
    			player.body.angularVelocity = -300;
    		}
    		else if (rotateRight.isDown)
    		{
    			player.body.angularVelocity = 300;
    		}
    		else
    		{
    			player.body.angularVelocity = 0;
    		}
    		
    		if (shoot.isDown)
    		{
    			fireBullet();
    		}
    	}
        if (game.time.now > firingTimer && gameStart)
        {
            enemyFires();
        }
    	
        if(game.time.now > asteroidTime && gameStart)
        {
        	//https://stackoverflow.com/a/24356149
        	asteroid1.forEach(function(item) {
        		item.body.velocity.x = game.rnd.integerInRange(-100,100);
        		item.body.velocity.y = game.rnd.integerInRange(-100,100);
        	}, this);
        	asteroid2.forEach(function(item) {
        		item.body.velocity.x = game.rnd.integerInRange(-200,200);
        		item.body.velocity.y = game.rnd.integerInRange(-200,200);
        	}, this);
        	asteroid3.forEach(function(item) {
        		item.body.velocity.x = game.rnd.integerInRange(-300,300);
        		item.body.velocity.y = game.rnd.integerInRange(-300,300);
        	}, this);
        	asteroidTime = game.time.now + 10000;
        }
        if(game.time.now > alienTime && gameStart)
        {
        	//https://stackoverflow.com/a/24356149
        	aliens.forEach(function(item) {
        		item.body.velocity.x = game.rnd.integerInRange(-100,100);
        		item.body.velocity.y = game.rnd.integerInRange(-100,100);
        	}, this);
        	alienTime = game.time.now + 10000;
        }
        aliens.forEach(function(item){
        	game.world.wrap(item, 0, true);
        });
        asteroid1.forEach(function(item){
        	game.world.wrap(item, 0, true);
        });
        asteroid2.forEach(function(item){
        	game.world.wrap(item, 0, true);
        });
        asteroid3.forEach(function(item){
        	game.world.wrap(item, 0, true);
        });
        if(aliens.countLiving()==0)
        {
        	winState();
        }
    }
    //https://phaser.io/examples/v2/arcade-physics/asteroids-movement
    function fireBullet () {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > bulletTime)
        {
            //  Grab the first bullet we can from the pool
            bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                bullet.reset(player.body.x + 16, player.body.y + 16);
                bullet.lifespan = 2000;
                bullet.rotation = player.rotation;
                game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
                blasterSound.play();
                bulletTime = game.time.now + 200;
            }
        }
    }
    function enemyFires()//https://phaser.io/examples/v2/games/invaders
    {
        //  Grab the first bullet we can from the pool
        let enemyBullet = enemyBullets.getFirstExists(false);

        livingEnemies.length=0;

        aliens.forEachAlive(function(alien){

            // put every living enemy in an array
            livingEnemies.push(alien);
        });


        if (enemyBullet && livingEnemies.length > 0)
        {
            
            let random=game.rnd.integerInRange(0,livingEnemies.length-1);

            // randomly select one of them
            let shooter=livingEnemies[random];
            // And fire the bullet from this enemy
            enemyBullet.reset(shooter.body.x, shooter.body.y);
            enemyBullet.lifespan = 10000;
            game.physics.arcade.moveToObject(enemyBullet,player,200);
            firingTimer = game.time.now + 100;
        }
    }
};
