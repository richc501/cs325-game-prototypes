"use strict";
let map;
let groundLayer;
let backgroundLayer;
let waterLayer;
let caveLayer;
let finishLayer;
let chicken_sprite;
let up;
let down;
let right;
let left;
let facing = 'idle_right';
let wallJumpTimerLeft = 0;
let wallJumpTimerRight = 0;
let onWall = false;
let health = 10;
let healthBar;
let lives = 3;
let lifeBar;
let stateText;
let explosions;
let cleavers;
let explodeBottles;
let explodeBottleTime=0;
let cleaverTime=0;
let cleaverDespawn=10000;
let gameStart = false;
let logo;
let logo2;
let door;
let themeSong;
let respawnSound;
let jumpSound;
let eggSound;
let deathSound;
let gameOverSound;
let gameWonSound;
let explodeSound;
let gameOverScreen;
let gameWonScreen;
let gameWonBool = false;
let gameOverBool = false;
let jumpSoundTimer=0;
//let cleaverSpawnSound;
let cleaverHitSound;
let donzenEggs;
let donzenEggs_Alpha;
let donzenEggs_UI;
let eggsCollected = 0;
let oil3sprite;//1
let oil5sprite;//2
let oil6sprite;//3
let oil3sprite2;//4
let water3sprite;
let water5sprite;
let water6sprite;
let water3sprite2;
let swimTimer = 0;
let oilTimer = 0;
let waterTimer = 5000;
let oilNumber;
let damageTimer = 0;
window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    //Hold w Press D to wall jump right
	//Hold w Press D let go of D then you wall jump left
    let game = new Phaser.Game( 800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render } );
    
    function preload() {
    	game.load.spritesheet('chicken','assets/chicken_sprite_sheet.png', 16, 16);//https://opengameart.org/content/solarus-chicken
    	game.load.tilemap('map', 'assets/chickenParkour2.json', null, Phaser.Tilemap.TILED_JSON);
    	game.load.image('tiles', 'assets/ground64.png');
    	game.load.image('heart_left', 'assets/hearts/Hearts_left.png');
    	game.load.image('heart_right', 'assets/hearts/Hearts_Right.png');
    	game.load.image('Lives', 'assets/lives/chicken_lives.png');
    	game.load.image('cleaver', 'assets/weapon/cleaver.png');
    	game.load.image('logo', 'assets/logo_2.png');
    	game.load.image('logo2', 'assets/logo.png');
    	game.load.image('finish', 'assets/door.png');
    	game.load.image('egg', 'assets/egg.png');
    	game.load.image('gameOverIMG', 'assets/gameOver.png');
    	game.load.image('gameWonIMG', 'assets/youWon.png');
    	game.load.spritesheet('kaboom', 'assets/weapon/explode.png', 128, 128);//https://phaser.io/examples/v2/games/tanks
    	game.load.image('explodebottle', 'assets/weapon/explodebottle.png');//https://opengameart.org/content/drink-icon-pack
    	game.load.spritesheet('oil_3', 'assets/oil/oil3wide.png', 192, 64);
    	game.load.spritesheet('oil_5', 'assets/oil/oil5wide.png', 320, 64);
    	game.load.spritesheet('oil_6', 'assets/oil/oil6wide.png', 384, 64);
    	game.load.spritesheet('water_3', 'assets/oil/water3wide.png', 192, 64);
    	game.load.spritesheet('water_5', 'assets/oil/water5wide.png', 320, 64);
    	game.load.spritesheet('water_6', 'assets/oil/water6wide.png', 384, 64);

    	//https://phaser.io/examples/v2/audio/sound-complete
    	game.load.audio('knife_HIT', 'assets/sounds/knife_HIT.mp3');//https://freesound.org/people/Gingie/sounds/181679/
    	game.load.audio('theme_song', 'assets/sounds/theme-loop.mp3');//https://freesound.org/people/Mrthenoronha/sounds/371516/ and https://freesound.org/people/Mrthenoronha/sounds/370294/
    	game.load.audio('8bitjump', 'assets/sounds/jump.mp3');//https://freesound.org/people/plasterbrain/sounds/399095/
    	game.load.audio('idle_sound', 'assets/sounds/chicken-idle.mp3');//https://freesound.org/people/Rudmer_Rotteveel/sounds/316920/
    	game.load.audio('egg_sound', 'assets/sounds/eggPickUpSound.mp3');//https://freesound.org/people/bradwesson/sounds/135936/
    	game.load.audio('gameOver', 'assets/sounds/game-over2.mp3');//https://freesound.org/people/deleted_user_877451/sounds/76376/
    	game.load.audio('gameWon', 'assets/sounds/level-complete.mp3');//https://freesound.org/people/jivatma07/sounds/122255/ and https://freesound.org/people/Kastenfrosch/sounds/162473/
    	game.load.audio('deathSound', 'assets/sounds/death-sound.mp3');//https://freesound.org/people/ProjectsU012/sounds/333785/
    	game.load.audio('explodeSound', 'assets/sounds/explosion.mp3');//https://freesound.org/people/ProjectsU012/sounds/334266/
    }
    
    function create() {
    	themeSong = game.add.audio('theme_song');
    	respawnSound = game.add.audio('idle_sound');
    	jumpSound = game.add.audio('8bitjump');
    	eggSound = game.add.audio('egg_sound');
    	gameOverSound = game.add.audio('gameOver');
    	gameWonSound = game.add.audio('gameWon');
    	deathSound = game.add.audio('deathSound');
    	cleaverHitSound = game.add.audio('knife_HIT');
    	explodeSound = game.add.audio('explodeSound');
    	
    	
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	game.physics.arcade.checkCollision.down = false;//http://thoughts.amphibian.com/2016/01/falling-down-disable-some-phaser-world.html
        game.physics.restitution = 0.2;
        game.physics.arcade.gravity.y = 300;
    	game.stage.backgroundColor = "#a9f0ff";
    	map = game.add.tilemap('map');
    	map.addTilesetImage('ground64','tiles');
    	
    	groundLayer = map.createLayer('GroundLayer');
    	backgroundLayer = map.createLayer('BackGroundLayer');
    	caveLayer = map.createLayer('CaveBackGroundLayer');
    	//waterLayer = map.createLayer('WaterLayer');
    	finishLayer = map.createLayer('FinishLayer');
    	groundLayer.resizeWorld();
    	map.setCollisionBetween(0,7, true, 'GroundLayer');
    	cleavers = game.add.group();
    	cleavers.enableBody = true;
    	cleavers.physicsBodyType = Phaser.Physics.ARCADE;
    	cleavers.createMultiple(300, 'cleaver');
    	cleavers.setAll('anchor.x', 0.5);
    	cleavers.setAll('anchor.y', 1);
    	cleavers.setAll('outOfBoundsKill', true);
    	cleavers.setAll('checkWorldBounds', true);
        
    	explodeBottles = game.add.group();//SODA BOTTLES
    	explodeBottles.enableBody = true;
    	explodeBottles.physicsBodyType = Phaser.Physics.ARCADE;
    	explodeBottles.createMultiple(100, 'explodebottle');
    	explodeBottles.setAll('anchor.x', 0.5);
    	explodeBottles.setAll('anchor.y', 1);
    	explodeBottles.setAll('outOfBoundsKill', true);
    	explodeBottles.setAll('checkWorldBounds', true);
    	
    	donzenEggs = game.add.group();
    	donzenEggs.enableBody = true;
    	donzenEggs.physicsBodyType = Phaser.Physics.ARCADE;
    	donzenEggs.createMultiple(12, 'egg');
    	donzenEggs.setAll('anchor.x', 0.5);
    	donzenEggs.setAll('anchor.y', 0.5);
    	donzenEggs.setAll('outOfBoundsKill', true);
    	donzenEggs.setAll('checkWorldBounds', true);
    	spawnEggs();
    	door = game.add.sprite(6208,1151, 'finish');
    	
    	game.physics.enable(door, Phaser.Physics.ARCADE)
    	
    	chicken_sprite = game.add.sprite(0,game.world.centerY, 'chicken');
    	game.physics.enable(chicken_sprite, Phaser.Physics.ARCADE);
    	
        explosions = game.add.group();//https://phaser.io/examples/v2/games/invaders
        explosions.enableBody = true;
        explosions.physicsBodyType = Phaser.Physics.ARCADE;
        explosions.createMultiple(50, 'kaboom');
        explosions.setAll('anchor.x', 0.5);
        explosions.setAll('anchor.y', 0.5);
        explosions.setAll('outOfBoundsKill', true);
    	explosions.setAll('checkWorldBounds', true);
        
    	chicken_sprite.body.collideWorldBounds = true;
    	chicken_sprite.checkWorldBounds = true;
    	chicken_sprite.events.onOutOfBounds.add(respawn, this);
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
    	
    	healthBar = game.add.group();
    	lifeBar = game.add.group();
    	donzenEggs_Alpha = game.add.group();
    	for(let i = 0; i < 10; i++)
    	{
    		let hearts;
    		if(i==0||i%2==0)
    			hearts = healthBar.create(665+(14*i),20,'heart_left');
    		else
    			hearts = healthBar.create(665+(14*i),20,'heart_right');
    		hearts.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
    		hearts.cameraOffset.setTo(665+(14*i), 20);
    		hearts.anchor.setTo(0.5, 0.5);
    	}
        for (let i = 0; i < 3; i++) //https://phaser.io/examples/v2/games/invaders
        {
            let chicken = lifeBar.create(750 + (16 * i), 50, 'Lives');
            chicken.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
            chicken.cameraOffset.setTo(750 + (16 * i), 50);
            chicken.anchor.setTo(0.5, 0.5);
        }
        let egg_Alpha;
        for(let i = 0; i < 12; i++)
        {
        	egg_Alpha = donzenEggs_Alpha.create(25+(16 * i),10, 'egg');
        	egg_Alpha.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
        	egg_Alpha.cameraOffset.setTo(25+(16 * i),10);
        	egg_Alpha.anchor.setTo(0.5, 0.5);
        	egg_Alpha.alpha = 0.4;
        }
        //donzen eggs for UI pick up
        donzenEggs_UI = game.add.group();
        explosions.createMultiple(12, 'egg');
    	donzenEggs.setAll('anchor.x', 0.5);
    	donzenEggs.setAll('anchor.y', 0.5);
        //  Text
        stateText = game.add.text(400,300,'', { font: '84px Comic Sans MS', fill: '#fff' });//https://phaser.io/examples/v2/games/invaders
        stateText.anchor.setTo(0.5, 0.5);
        stateText.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
        stateText.cameraOffset.setTo(400,300,game.world.centerY, 20);
        stateText.visible = false;
        
        
        water3sprite = game.add.sprite(192, 1280, 'water_3');
        water3sprite.animations.add('water3', [0,1], 5, true);
        water3sprite.animations.play('water3');
        
        water5sprite = game.add.sprite(2816, 1471, 'water_5');
        water5sprite.animations.add('water5', [0,1], 5, true);
        water5sprite.animations.play('water5');
        
        water6sprite = game.add.sprite(3456, 1471, 'water_6');
        water6sprite.animations.add('water6', [0,1], 5, true);
        water6sprite.animations.play('water6');
        
        water3sprite2 = game.add.sprite(5376, 1409, 'water_3');
        water3sprite2.animations.add('water3_2', [0,1], 5, true);
        water3sprite2.animations.play('water3_2');
        
        oil3sprite = game.add.sprite(192, 1280, 'oil_3');
        oil3sprite.animations.add('oil3', [0,1], 5, true);
        oil3sprite.animations.play('oil3');

        oil5sprite = game.add.sprite(2816, 1471, 'oil_5');
        oil5sprite.animations.add('oil5', [0,1], 5, true);
        oil5sprite.animations.play('oil5');
        
        oil6sprite = game.add.sprite(3456, 1471, 'oil_6');
        oil6sprite.animations.add('oil6', [0,1], 5, true);
        oil6sprite.animations.play('oil6');
        
        oil3sprite2 = game.add.sprite(5376, 1409, 'oil_3');
        oil3sprite2.animations.add('oil3_2', [0,1], 5, true);
        oil3sprite2.animations.play('oil3_2');
        
        oil3sprite.kill();
        oil5sprite.kill();
        oil6sprite.kill();
        oil3sprite2.kill();
        
        game.physics.enable(water3sprite, Phaser.Physics.ARCADE);
        game.physics.enable(water5sprite, Phaser.Physics.ARCADE);
        game.physics.enable(water6sprite, Phaser.Physics.ARCADE);
        game.physics.enable(water3sprite2, Phaser.Physics.ARCADE);
        
        game.physics.enable(oil3sprite, Phaser.Physics.ARCADE);
        game.physics.enable(oil5sprite, Phaser.Physics.ARCADE);
        game.physics.enable(oil6sprite, Phaser.Physics.ARCADE);
        game.physics.enable(oil3sprite2, Phaser.Physics.ARCADE);
        
        logo = game.add.sprite(400, 300, 'logo');//https://phaser.io/examples/v2/games/tanks
        logo.anchor.setTo(0.5, 0.5);
        logo.fixedToCamera = true;
        game.input.onDown.add(removeLogo, this);
        game.sound.setDecodedCallback(themeSong, start, this);//https://phaser.io/examples/v2/audio/loop
        

    }
    function removeLogo() {//https://phaser.io/examples/v2/games/tanks
        game.input.onDown.remove(removeLogo, this);
        logo.kill();
        logo2 = game.add.sprite(400,300, 'logo2');
        logo2.anchor.setTo(0.5, 0.5);
        logo2.fixedToCamera = true;
        game.input.onDown.add(removeLogo2, this);
    }
    function removeLogo2() {//https://phaser.io/examples/v2/games/tanks
        game.input.onDown.remove(removeLogo2, this);
        logo2.kill();
        
        gameStart = true;
    }
    function start() {
    	themeSong.loopFull(0.6);
    }
    function cleaverHitsChicken(cleavers, chicken_sprite) {
		health--;
    	let lifeHearts = healthBar.getFirstAlive();
    	if(lifeHearts)
    		lifeHearts.kill();
        // When the player dies
        if (health < 1)
        {
        	respawn(chicken_sprite);
        }
    }
    function throwBottle() {
    	let randomX;
    	if(game.time.now > explodeBottleTime && gameStart == true)
    	{
    		let bottle = explodeBottles.getFirstExists(false);
    		if(bottle)
    		{
    			let leftSide = game.camera.x-game.camera.width;
    			let rightSide = game.camera.x+game.camera.width;
    			if(leftSide < 0 && rightSide<game.world.width)
    				randomX =game.rnd.integerInRange(0,rightSide);//makes it so the cleaver spawn only in the area of chicken
    			else if (leftSide > 0 && rightSide < game.world.width)
    				randomX =game.rnd.integerInRange(leftSide,rightSide);
    			else if (leftSide > 0 && rightSide > game.world.width)
    				randomX =game.rnd.integerInRange(leftSide,game.world.width);
    			bottle.reset(randomX, 0);
    			
    			game.physics.arcade.moveToObject(bottle,chicken_sprite,120);
    			explodeBottleTime = game.time.now + 2500;
    		}
    	}
    }
    function throwCleaver() {//https://phaser.io/examples/v2/games/invaders
    	let randomX;
    	if(game.time.now > cleaverTime && gameStart == true)
    	{
    		let blade = cleavers.getFirstExists(false);
    		if(blade)
    		{
    			
    			let leftSide = game.camera.x-game.camera.width;
    			let rightSide = game.camera.x+game.camera.width;
    			if(leftSide < 0 && rightSide<game.world.width)
    				randomX =game.rnd.integerInRange(0,rightSide);//makes it so the cleaver spawn only in the area of chicken
    			else if (leftSide > 0 && rightSide < game.world.width)
    				randomX =game.rnd.integerInRange(leftSide,rightSide);
    			else if (leftSide > 0 && rightSide > game.world.width)
    				randomX =game.rnd.integerInRange(leftSide,game.world.width);
    			blade.lifespan = 12000;
    			blade.reset(randomX, 0);
    			
    			game.physics.arcade.moveToObject(blade,chicken_sprite,120);
    			cleaverTime = game.time.now + 1000;
    		}
    	}
    }
    function spawnEggs() {
    	let x = [86, 3440, 4440, 6300, 3873, 1305, 5600, 4898, 5330, 5720, 670, 1558];
    	let y = [1260, 1076, 560, 308, 305, 525, 1127, 560, 300, 560, 373, 1134];
    	let egg;
    	for(let b = 0;b<12;b++)
    	{
    		egg = donzenEggs.getFirstExists(false);
    		if(egg)
    			egg.reset(x[b],y[b]);
    	}
    }
    function resurrect() {//http://www.html5gamedevs.com/topic/27103-resetting-a-group/?do=findComment&comment=155490
        let deadEggs;
    	let x = [86, 3440, 4440, 6300, 3873, 1305, 5600, 4898, 5330, 5720, 670, 1558];
    	let y = [1260, 1076, 560, 308, 305, 525, 1127, 560, 300, 560, 373, 1134];
        //respawns all the eggs from death
        for(let b = 0;b<12;b++)
        {
        		deadEggs = donzenEggs.getFirstDead();
        		if (deadEggs) {
        			deadEggs.reset(x[b],y[b]);
        		}
        }
    }
    function respawn(sprite) {
    	lives--;
    	let life = lifeBar.getFirstAlive();
    	if(life)
    		life.kill();
        // When the player dies
        if (lives < 1)
        {	
        	chicken_sprite.kill();
            game.camera.y = 350;
            game.camera.x = 0;
        	gameOverScreen = game.add.sprite(400,300, 'gameOverIMG');
        	gameOverScreen.anchor.setTo(0.5, 0.5);
        	gameOverScreen.fixedToCamera = true;
        	gameOverBool = true;
        	gameStart = false;
            gameOverSound.play();
            //the "click to restart" handler
            game.input.onTap.addOnce(restart,this);
        } else {
        	deathSound.play();
            game.camera.y = 350;
            game.camera.x = 0;
            health = 10;
            healthBar.callAll('revive');
            cleavers.callAll('kill');
            explosions.callAll('kill');
            explodeBottles.callAll('kill');
            chicken_sprite.reset(0,game.world.centerY);
        }
    }
    function restart() {
    	respawnSound.play();
        //  A new level starts
    	if(gameWonBool == true)
    		gameWonScreen.kill();
    	if(gameOverBool == true)
    		gameOverScreen.kill();
    	eggsCollected = 0;
    	health = 10;
        lives = 3;
        donzenEggs.callAll('kill');
        resurrect();
        //donzenEggs.callAll('revive');
        //spawnEggs();
        //resets the life count
        lifeBar.callAll('revive');
        healthBar.callAll('revive');
        //cleaverTime = 0;
        explosions.callAll('kill');
        explodeBottles.callAll('kill');
        donzenEggs_UI.callAll('kill');
        cleavers.callAll('kill');
        //revives the player
        chicken_sprite.revive();
        chicken_sprite.reset(0,game.world.centerY);
        if(game.camera.target == null)
        	game.camera.follow(chicken_sprite);
        //hides the text
        gameStart = true;
        gameWonBool = false;
        gameOverBool = false;
    }    
    function finishChecker(sprite, door) {
    	if(eggsCollected==12)
    	{
    		game.camera.target = null //http://www.html5gamedevs.com/topic/2860-camera-unfollow/
    		chicken_sprite.kill();
    		game.camera.y = 350;
    		game.camera.x = 0;
    		gameStart = false;
        	gameWonScreen = game.add.sprite(400,300, 'gameWonIMG');
        	gameWonScreen.anchor.setTo(0.5, 0.5);
        	gameWonScreen.fixedToCamera = true;
        	gameWonSound.play();
        	gameWonBool = true;
    		game.input.onTap.addOnce(restart,this);
    	}
    }
    function updateEggUI() {
    	let getEgg;
    	getEgg = donzenEggs_UI.create(10 + (16 * eggsCollected),10, 'egg');
    	getEgg.fixedToCamera = true;//https://phaser.io/examples/v2/camera/fixed-to-camera
    	getEgg.cameraOffset.setTo(10 + (16 * eggsCollected),10);
    	getEgg.anchor.setTo(0.5, 0.5);
    	//play pick up sound
    	eggSound.play();
    }
    function oilDamage() {
    	if(game.time.now>damageTimer)
    	{
			health--;
			let lifeHearts = healthBar.getFirstAlive();
			if(lifeHearts)
				lifeHearts.kill();
			cleaverHitSound.play();
		    // When the player dies
		    if (health < 1)
		    {
		    	respawn(chicken_sprite);
		    }
		    damageTimer = game.time.now + 1000;
    	}
    }
    function update() { //https://phaser.io/examples/v2/arcade-physics/platformer-basics
    	game.physics.arcade.overlap(chicken_sprite, door, finishChecker, null, this);

    	game.physics.arcade.overlap(chicken_sprite, water3sprite, function(chicken_sprite, water3sprite){
    		chicken_sprite.body.velocity.x = 0;
    		if(game.time.now > swimTimer)
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(30,100);
    			swimTimer = game.time.now+100;
    		}
    		else 
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(-100,-30);
    		}
    	}, null, this);
    	game.physics.arcade.overlap(chicken_sprite, water5sprite, function(chicken_sprite, water5sprite){
    		chicken_sprite.body.velocity.x = 0;
    		if(game.time.now > swimTimer)
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(30,100);
    			swimTimer = game.time.now+100;
    		}
    		else 
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(-100,-30);
    		}
    	}, null, this);
    	
    	game.physics.arcade.overlap(chicken_sprite, water6sprite, function(chicken_sprite, water6sprite){
    		chicken_sprite.body.velocity.x = 0;
    		if(game.time.now > swimTimer)
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(30,100);
    			swimTimer = game.time.now+100;
    		}
    		else 
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(-100,-30);
    		}
    	}, null, this);
    	game.physics.arcade.overlap(chicken_sprite, water3sprite2, function(chicken_sprite, water3sprite2){
    		chicken_sprite.body.velocity.x = 0;
    		if(game.time.now > swimTimer)
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(30,100);
    			swimTimer = game.time.now+100;
    		}
    		else 
    		{
    			chicken_sprite.body.velocity.y = game.rnd.integerInRange(-100,-30);
    		}
    	}, null, this);
    	game.physics.arcade.overlap(chicken_sprite, oil3sprite2, function(chicken_sprite, oil3sprite2){
    		chicken_sprite.body.velocity.x = 0;
    		chicken_sprite.body.velocity.y = game.rnd.integerInRange(-3,-5);
    		oilDamage();
    	}, null, this);
    	game.physics.arcade.overlap(chicken_sprite, oil3sprite, function(chicken_sprite, oil3sprite){
    		chicken_sprite.body.velocity.x = 0;
    		chicken_sprite.body.velocity.y = game.rnd.integerInRange(-3,-5);
    		oilDamage();
    	}, null, this);
    	game.physics.arcade.overlap(chicken_sprite, oil5sprite, function(chicken_sprite, oil5sprite){
    		chicken_sprite.body.velocity.x = 0;
    		chicken_sprite.body.velocity.y = game.rnd.integerInRange(-3,-5);
    		oilDamage();
    	}, null, this);
    	
    	game.physics.arcade.overlap(chicken_sprite, oil6sprite, function(chicken_sprite, oil6sprite){
    		chicken_sprite.body.velocity.x = 0;
    		chicken_sprite.body.velocity.y = game.rnd.integerInRange(-3,-5);
    		oilDamage();
    	}, null, this);
    	
    	game.physics.arcade.collide(water3sprite, groundLayer);//1
    	game.physics.arcade.collide(water5sprite, groundLayer);//2
    	game.physics.arcade.collide(water6sprite, groundLayer);//3
    	game.physics.arcade.collide(water3sprite2, groundLayer);//4
    	
    	game.physics.arcade.collide(oil3sprite, groundLayer);//1
    	game.physics.arcade.collide(oil5sprite, groundLayer);//2
    	game.physics.arcade.collide(oil6sprite, groundLayer);//3
    	game.physics.arcade.collide(oil3sprite2, groundLayer);//4
    	
    	game.physics.arcade.collide(donzenEggs, groundLayer);
    	
    	if(game.time.now > oilTimer)
    	{
    		oilNumber = game.rnd.integerInRange(1,4);
    		switch(oilNumber)
    		{
	    		case 1:
	    			oil3sprite.revive();
	    			oil3sprite.reset(192, 1280);
	    			water3sprite.kill();
	    			break;
	    		case 2:
	    			oil5sprite.revive();
	    			oil5sprite.reset(2816, 1471);
	    			water5sprite.kill();
	    			break;
	    		case 3:
	    			oil6sprite.revive();
	    			oil6sprite.reset(3456, 1471);
	    			water6sprite.kill();
	    			break;
	    		case 4:
	    			oil3sprite2.revive();
	    			oil3sprite2.reset(5376, 1409);
	    			water3sprite2.kill();
	    			break;
    		}
    		oilTimer = game.time.now + 5000;
    	}
    	if(game.time.now > waterTimer)
    	{
    		switch(oilNumber)
    		{
	    		case 1:
	    			water3sprite.revive();
	    			water3sprite.reset(192, 1280);
	    			oil3sprite.kill();
	    			break;
	    		case 2:
	    			water5sprite.revive();
	    			water5sprite.reset(2816, 1471);
	    			oil5sprite.kill();
	    			break;
	    		case 3:
	    			water6sprite.revive();
	    			water6sprite.reset(3456, 1471);
	    			oil6sprite.kill();
	    			break;
	    		case 4:
	    			water3sprite2.revive();
	    			water3sprite2.reset(5376, 1409);
	    			oil3sprite2.kill();
	    			break;
    		}
    		waterTimer = game.time.now + 5000;
    	}
    	game.physics.arcade.overlap(donzenEggs, cleavers, function(donzenEggs, cleavers){//you need to be able to grab the eggs without being hurt from cleavers overlaping eggs
    		cleavers.kill();
    	}, null, this);
    	game.physics.arcade.overlap(donzenEggs, explodeBottles, function(donzenEggs, cleavers){//you need to be able to grab the eggs without being hurt from cleavers overlaping eggs
    		explodeBottles.kill();
    	}, null, this);
    	game.physics.arcade.collide(door, groundLayer);

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
    	game.physics.arcade.collide(explodeBottles, groundLayer, function(explodeBottles, groundLayer) {
    		//cleaverHitSound.play();
    		explodeBottles.body.velocity.x = 0;
    		explodeBottles.body.velocity.y = 0;
    	});
    	game.physics.arcade.collide(explodeBottles, explosions, function(explodeBottles, explosions){
    		explodeBottles.kill();
    		explosions.animations.add('kaboom');
    		explosions.reset(explodeBottles.body.x, explodeBottles.body.y);
    		explosions.play('kaboom', 30, false, true);
    		explodeSound.play();
    		explosions.body.velocity.y = -200;
    	});
    	game.physics.arcade.collide(explodeBottles, cleavers, function(explodeBottles, cleavers){
    		explodeBottles.kill();
    		cleavers.kill();
    	    let explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(cleavers.body.x, cleavers.body.y);
    	    explode.play('kaboom', 30, false, true);
    	    explodeSound.play();
    	    explode.body.velocity.y = -200;
    	});
    	game.physics.arcade.collide(explodeBottles, explodeBottles);
    	game.physics.arcade.collide(chicken_sprite, explosions, function(chicken_sprite, explosions){
    		chicken_sprite.body.velocity.y = -100;
    		chicken_sprite.body.velocity.x = 0;
    	});
    	game.physics.arcade.collide(explosions, cleavers, function(explosions, cleavers){
    		cleavers.kill();
    	});
    	game.physics.arcade.collide(explosions, groundLayer);
    	game.physics.arcade.collide(cleavers, groundLayer, function(cleavers, groundLayer) {
    		//cleaverHitSound.play();
    		cleavers.body.velocity.x = 0;
    		cleavers.body.velocity.y = 0;
    	});
    	game.physics.arcade.collide(chicken_sprite, cleavers, function(chicken_sprite, cleavers) {
    		cleavers.kill();
    		cleaverHitSound.play();
    		cleaverHitsChicken(cleavers, chicken_sprite);
    	});
    	game.physics.arcade.collide(chicken_sprite, explodeBottles, function(chicken_sprite, explodeBottles){
    		explodeBottles.kill();
    	    let explode = explosions.getFirstExists(false);
    	    explode.animations.add('kaboom');
    	    explode.reset(chicken_sprite.body.x, chicken_sprite.body.y);
    	    explode.play('kaboom', 30, false, true);
    	    explodeSound.play();
    	    explode.body.velocity.y = -200;
    		chicken_sprite.body.velocity.y = -200;
    		chicken_sprite.body.velocity.x = 0;
    	});
    	game.physics.arcade.collide(chicken_sprite, donzenEggs, function(chicken_sprite, donzenEggs){
        	donzenEggs.kill();
    		eggsCollected++;
        	//calls to up date UI
        	updateEggUI();
    	});
    	game.physics.arcade.collide(cleavers, cleavers);
        if (game.time.now > cleaverTime)
        {
        	throwCleaver();
        }
        if (game.time.now > explodeBottleTime)
        {
        	throwBottle();
        }
        if(left.isDown && !onWall && !chicken_sprite.body.onFloor()) {
        	chicken_sprite.body.velocity.x = -150;
        	if(facing != 'left') {
        		chicken_sprite.animations.play('left');
        		facing = 'left';
        	}
        } else if(right.isDown && !onWall && !chicken_sprite.body.onFloor()) {
        	chicken_sprite.body.velocity.x = 150;
        	if(facing != 'right') {
        		chicken_sprite.animations.play('right');
        		facing = 'right';
        	}
        } else if(left.isDown && !onWall && chicken_sprite.body.onFloor()) {
    		chicken_sprite.body.velocity.x = -150;
    		if(facing != 'left') {
    			chicken_sprite.animations.play('left');
                facing = 'left';
    		}
    	} else if(right.isDown && !onWall && chicken_sprite.body.onFloor()) {
    		chicken_sprite.body.velocity.x = 150;
    		if(facing != 'right') {
    			chicken_sprite.animations.play('right');
    			facing = 'right';
    		}
    	} else if(left.isDown && onWall && !chicken_sprite.body.onFloor()) {//allows for chicken to move in the air
    		chicken_sprite.body.velocity.x = -150;
    		if(facing != 'left') {
    			chicken_sprite.animations.play('left');
                facing = 'left';
    		}
    	} else if(right.isDown && onWall && !chicken_sprite.body.onFloor()) {
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
        	jumpSound.play();
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
        } else if(chicken_sprite.body.onFloor() && (facing == 'jump_right' || facing == 'jump_left' || facing == 'jump_idle')) {
			facing = 'idle'
			chicken_sprite.animations.play('idle');
        }
        if(up.isDown && onWall)
        {
        	if(chicken_sprite.body.blocked.right) {
        		facing = 'wall_jump_left';
        		chicken_sprite.animations.play('left');
        		chicken_sprite.body.velocity.y = -300;
        		chicken_sprite.body.velocity.x = -100;
        		if(right.isDown)
        		{
        			facing = 'wall_jump_right';
        			chicken_sprite.animations.play('right');
        			chicken_sprite.body.velocity.x = 100;//change animation here
        			
        			if(chicken_sprite.body.blocked.up)
        			{
                		chicken_sprite.body.velocity.y = 0;
                		chicken_sprite.body.velocity.x = 0;
        			}
        		}
        		if(game.time.now > jumpSoundTimer) {
        			jumpSound.play();
        			jumpSoundTimer = game.time.now + 150;
        		}
        	}
        	if(chicken_sprite.body.blocked.left) {
        		facing = 'wall_jump_right';
        		chicken_sprite.animations.play('right');
        		chicken_sprite.body.velocity.y = -300;
        		chicken_sprite.body.velocity.x = 100;
        		if(left.isDown)
        		{
        			facing = 'wall_jump_left';
        			chicken_sprite.animations.play('left');
        			chicken_sprite.body.velocity.x = -100;//change animation here
        			if(chicken_sprite.body.blocked.up)
        			{
                		chicken_sprite.body.velocity.y = 0;
                		chicken_sprite.body.velocity.x = 0;
        			}
        		}
            	if(game.time.now > jumpSoundTimer) {
            		jumpSound.play();
            		jumpSoundTimer = game.time.now + 150;
            	}
        	}
        }
    }
    function render() {
    	//game.debug.text('Active Cleavers: ' + cleavers.countLiving() + ' / ' + cleavers.length, 32, 40);
    	//game.debug.text('Active Explosions: ' + explosions.countLiving() + ' / ' + explosions.length, 32, 60);
    	//game.debug.text('Active Explode Bottles: ' + explodeBottles.countLiving() + ' / ' + explodeBottles.length, 32, 80);
    	//game.debug.text('Time: ' + game.time.now + ' Cleaver Timer: ' + cleaverTime, 32, 60); //Temporary will add to GUI latter
    	//game.debug.text('Camera x: ' + game.camera.x + 'Camera width: ' + game.camera.width , 32, 80);
    	//game.debug.text('X:'+ game.input.mousePointer.worldX + ' Y: ' + game.input.mousePointer.worldY,32,100); //MAKES PLACING SPRITES DOWN EASIER OMG
    	//game.debug.cameraInfo(game.camera, 32, 32);

    }
};
