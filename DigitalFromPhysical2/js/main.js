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
    
    let game = new Phaser.Game( 960, 640, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render } );
    let map;
    let layer;
    let player;
    let catStartX = 0;
    let catStartY = 0;
    let up;
    let down;
    let left;
    let right;
    let pressed = false;
    let turn = [true, false, false, false, false];// [0] = player, [1] = skulls, [2] = mouse [3] = skulls [4] = mouse//
    let diceCount;
    let dice;
    let skulls;
    let skulls2;
    let skullArray = [];
    let mouse;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let stateText;
    let diceText;
    let diceCountText;
    let removeDiceUI_Timer = 0;
    let removeDiceUI_Bool = false;
    let crossBones1;
    let startTurn = false;
    let clicked = false;
    let gameOver = false;
    let catSound;
    let themeSong;
    function preload() {
        // https://opengameart.org/content/lpc-rat-cat-and-dog
        game.load.image( 'cat', 'assets/cat.png' );
        game.load.image( 'mouse','assets/mouse.png');
        
        // https://opengameart.org/content/white-dices
        game.load.spritesheet('dice', 'assets/dice.png', 128, 128);
        
        //https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Skull_and_crossbones.svg/2000px-Skull_and_crossbones.svg.png
        game.load.image('skull', 'assets/skull.png');
        game.load.image('skull2', 'assets/skull2.png');
        
        game.load.tilemap('map', 'assets/map2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('space', 'assets/space.png');
        
        game.load.audio('catSound','assets/sounds/cat1.mp3');//https://freesound.org/people/InspectorJ/sounds/415209/
        game.load.audio('themeSong','assets/sounds/themesong.mp3');//https://freesound.org/people/levelclearer/sounds/403380/
    }
    
    function create() {
    	themeSong = game.add.audio('themeSong');
    	catSound = game.add.audio('catSound');
    	
    	
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	
    	map = game.add.tilemap('map');
    	map.addTilesetImage('space','space');
    	layer = map.createLayer('layer');
    	
    	layer.resizeWorld();
    	
        mouseStartX = game.rnd.integerInRange(0,14);
        mouseStartY = game.rnd.integerInRange(0,9);
    	mouse = game.add.sprite(mouseStartX*64, mouseStartY*64, 'mouse');
    	game.physics.enable(mouse, Phaser.Physics.ARCADE);
    	do
    	{
    		catStartX = game.rnd.integerInRange(0,14);
    	}while(catStartX==mouseStartX);
    	
    	do
    	{
    		catStartY = game.rnd.integerInRange(0,9);
    	}while(catStartY==mouseStartY);
    	
    	player = game.add.sprite(catStartX*64, catStartY*64, 'cat');
    	game.physics.enable(player, Phaser.Physics.ARCADE);
    	
    	player.body.collideWorldBounds = true;
    	player.checkWorldBounds = true;
    	
    	skulls = game.add.group();
    	skulls.enableBody = true;
    	skulls.physicsBodyType = Phaser.Physics.ARCADE;
    	skulls.createMultiple(10, 'skull');	
    	skulls.setAll('outOfBoundsKill', true);
    	skulls.setAll('checkWorldBounds', true);
    	spawnSkulls();
    	
    	skulls2 = game.add.group()
    	skulls2.enableBody = true;
    	skulls2.physicsBodyType = Phaser.Physics.ARCADE;
    	skulls2.createMultiple(1000, 'skull2');	
    	skulls2.setAll('outOfBoundsKill', true);
    	skulls2.setAll('checkWorldBounds', true);
    	
    	stateText = game.add.text(415, 270, ' ',{ font: '84px Comic Sans MS', fill: '#0018ff' });
    	stateText.anchor.setTo(0.5, 0.5);
    	stateText.visible = false;
    	
        diceText = game.add.text(415,270,'        Player\'s Turn \n      WASD TO MOVE \n\n      Click To Roll Dice', { font: '84px Comic Sans MS', fill: '#0018ff'});
        diceText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        diceText.anchor.setTo(0.5, 0.5);
        diceCountText = game.add.text(60,100,' ', { font: '84px Comic Sans MS', fill: '#0018ff' });
        diceCountText.anchor.setTo(0.5, 0.5);
        diceCountText.visible = false;
    	dice = game.add.sprite(415, 250, 'dice');
    	dice.animations.add('roll', [0,4,2,5,1,0,5,3,4,0,2,1,2,5,0,3,1,5,4,2,5,1,0,2,5,1,3,4], 20, true)
    	dice.animations.play('roll');
    	diceCount = game.rnd.integerInRange(1,6);
    	game.input.onTap.addOnce(rollDice, this);
    	up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    	down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    	right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    	
    	 game.sound.setDecodedCallback(themeSong, start, this);//https://phaser.io/examples/v2/audio/loop
    }
    function start()
    {
    	themeSong.loopFull(0.5);
    }
    function rollDice()
    {
    	if(!gameOver)
    	{
	    	dice.animations.stop();
	    	dice.frame = diceCount-1;
	    	removeDiceUI_Timer = game.time.now+1500;
	    	removeDiceUI_Bool = true;
	    	clicked=true;
	    	diceCountText.visible = true;
	    	diceCountText.text=diceCount;
	    	if(!turn[0])
	    		startTurn=true;
    	}
    }
    
    function spawnSkulls()
    {
    	let crossBones;
    	let randomX;
    	if(catStartX==0)
    	{
	    	for(let i =0;i<10;i++)
	    	{
	    		crossBones = skulls.getFirstExists(false);
	    		if(crossBones)
	    		{
	    			randomX = game.rnd.integerInRange(1,14);
	    			crossBones.reset(randomX*64,i*64);
	    		}
	    	}
    	}
    	else if(catStartX==14)
    	{
	    	for(let i =0;i<10;i++)
	    	{
	    		crossBones = skulls.getFirstExists(false);
	    		if(crossBones)
	    		{
	    			randomX = game.rnd.integerInRange(0,13);
	    			crossBones.reset(randomX*64,i*64);
	    		}
	    	}
    	}
    	else
    	{
	    	for(let i =0;i<5;i++)
	    	{
	    		crossBones = skulls.getFirstExists(false);
	    		if(crossBones)
	    		{
	    			randomX = game.rnd.integerInRange(0,catStartX-1);
	    			crossBones.reset(randomX*64,i*64);
	    		}
	    	}
	
	    	for(let i =5;i<10;i++)
	    	{
	    		crossBones = skulls.getFirstExists(false);
	    		if(crossBones)
	    		{
	    			randomX = game.rnd.integerInRange(catStartX+1,14);
	    			crossBones.reset(randomX*64,i*64);
	    		}
	    	}
    	}

    }
    
    function nextTurn()
    {
    	clicked = false;
    	removeDiceUI_Bool = false;
    	diceCountText.visible = false;
    	if(turn[0])//skulls' turn
    	{
    		turn[0]=false;
    		turn[1]=true;
    		turn[2]=false;
    		turn[3]=false;
    		turn[4]=false;
    		diceText.text = "        Skulls' Turn \n\n\n      Click To Roll Dice";
        	diceText.visible = true;
        	dice.visible = true;
        	dice.animations.play('roll');
        	diceCount = game.rnd.integerInRange(1,6);
        	if(!gameOver)
        		game.input.onTap.addOnce(rollDice, this);
    	} 
    	else if(turn[1])//mouse's turn
    	{
    		turn[0]=false;
    		turn[1]=false;
    		turn[2]=true;
    		turn[3]=false;
    		turn[4]=false;
    		diceText.text = "        Mouse's Turn \n\n\n      Click To Roll Dice";
        	diceText.visible = true;
        	dice.visible = true;
        	dice.animations.play('roll');
        	diceCount = game.rnd.integerInRange(1,6);
        	if(!gameOver)
        		game.input.onTap.addOnce(rollDice, this);
    	} 
    	else if(turn[2])//skulls's turn
    	{
    		turn[0]=false;
    		turn[1]=false;
    		turn[2]=false;
    		turn[3]=true;
    		turn[4]=false;
    		diceText.text = "        Skulls' Turn \n\n\n      Click To Roll Dice";
        	diceText.visible = true;
        	dice.visible = true;
        	dice.animations.play('roll');
        	diceCount = game.rnd.integerInRange(1,6);
        	if(!gameOver)
        		game.input.onTap.addOnce(rollDice, this);
    		
    	}
    	else if(turn[3])//mouse's turn
    	{
    		turn[0]=false;
    		turn[1]=false;
    		turn[2]=false;
    		turn[3]=false;
    		turn[4]=true;
    		diceText.text = "        Mouse's Turn \n\n\n      Click To Roll Dice";
        	diceText.visible = true;
        	dice.visible = true;
        	dice.animations.play('roll');
        	diceCount = game.rnd.integerInRange(1,6);
        	if(!gameOver)
        		game.input.onTap.addOnce(rollDice, this);
    	}
    	else if(turn[4])//player's turn
    	{
    		turn[0]=true;
    		turn[1]=false;
    		turn[2]=false;
    		turn[3]=false;
    		turn[4]=false;
    		diceText.text = "        Player\'s Turn \n      WASD TO MOVE \n\n      Click To Roll Dice";
        	diceText.visible = true;
        	dice.visible = true;
        	dice.animations.play('roll');
        	diceCount = game.rnd.integerInRange(1,6);
        	if(!gameOver)
        		game.input.onTap.addOnce(rollDice, this);	
    	}
    }
    function restart() {
    	//if(gameOver)
    	//{
    		stateText.visible = false;
    		skulls.callAll('kill');
    		skulls2.callAll('kill');
            mouseStartX = game.rnd.integerInRange(0,14);
            mouseStartY = game.rnd.integerInRange(0,9);
        	mouse.x = mouseStartX*64;
        	mouse.y = mouseStartY*64;
        	game.physics.enable(mouse, Phaser.Physics.ARCADE);
        	do
        	{
        		catStartX = game.rnd.integerInRange(0,14);
        	}while(catStartX==mouseStartX);
        	
        	do
        	{
        		catStartY = game.rnd.integerInRange(0,9);
        	}while(catStartY==mouseStartY);
        	player.x = catStartX*64;
        	player.y = catStartY*64;
        	skulls.callAll('revive');
        	spawnSkulls();
        	gameOver=false;
    		turn[0]=false;
    		turn[1]=false;
    		turn[2]=false;
    		turn[3]=false;
    		turn[4]=true;
    		nextTurn();
    	//}
    }
    function spawnHorizontalSkulls(mousePosX, mousePosY)
    {
    	let crossBones = skulls2.getFirstExists(false);
    	if(crossBones)
    	{
    		crossBones.reset(mousePosX-64,mousePosY);	
    	}
    	crossBones = skulls2.getFirstExists(false);
    	if(crossBones)
    	{
    		crossBones.reset(mousePosX+64,mousePosY);	
    	}
    }
    function update() {
    	game.physics.arcade.overlap(player, mouse, function(player, mouse){
    		//game won
    		catSound.play();
    		diceCount = 0;
    		diceCountText.visable = false;
    		stateText.text = "     YOU WON!!! \n            :D \n      Double Click \n       To Restart!";
    		stateText.visible = true;
    		diceText.visible = false;
    		dice.visible = false;
    		clicked = false;
    		gameOver = true;
    		game.input.onTap.addOnce(restart, this);
    	}, null, this);
    	game.physics.arcade.overlap(player, skulls, function(player, skulls){
    		//game lost
    		catSound.play();
    		diceCount = 0;
    		diceCountText.visable = false;
    		stateText.text = "     YOU LOST \n            :( \n      Double Click \n       To Restart!";
    		stateText.visible = true;
    		dice.visible = false;
    		diceText.visible = false;
    		clicked = false;
    		gameOver = true;
    		game.input.onTap.addOnce(restart, this);
    	}, null, this);
    	game.physics.arcade.overlap(player, skulls2, function(player, skulls2){
    		//game lost
    		catSound.play();
    		diceCount = 0;
    		diceCountText.visable = false;
    		stateText.text = "     YOU LOST \n            :( \n      Double Click \n       To Restart!";
    		stateText.visible = true;
    		dice.visible = false;
    		diceText.visible = false;
    		clicked = false;
    		gameOver = true;
    		game.input.onTap.addOnce(restart, this);
    	});
    	game.physics.arcade.overlap(mouse, skulls, function(mouse, skulls){
    		//skulls.kill();
    		spawnHorizontalSkulls(mouse.x, mouse.y);
    	}, null, this);
    	game.physics.arcade.overlap(mouse, skulls2, function(mouse, skulls2){
    		skulls2.kill();
    		spawnHorizontalSkulls(mouse.x, mouse.y);
    	}, null, this);
    	if(game.time.now>removeDiceUI_Timer && removeDiceUI_Bool)
    	{
        	diceText.visible = false;
        	dice.visible = false;
        	removeDiceUI_Bool = false;
    	}
    	if(clicked)
    	{
	    	if(turn[0])
	    	{
		    	let beforeY = player.y;
		    	let beforeX = player.x;
		    	let canGoRight = true;
		    	let canGoLeft = true;
		    	let canGoDown = true;
		    	let canGoUp = true;
		    	if(beforeX/64==14)
		    	{
		    		canGoRight = false;
		    	} 
		    	else if(beforeX/64 == 0)
		    	{
		    		canGoLeft = false;
		    	}
		    	if(beforeY/64==9)
		    	{
		    		canGoDown = false;
		    	}
		    	else if(beforeY/64==0)
		    	{
		    		canGoUp = false;
		    	}
		    	if(pressed==false)
		    	{
		    		
		    		if(up.isDown&&canGoUp)
			    	{
		    			pressed = true;
		    			diceCount--;
			    		player.y = beforeY-64;
			    	} 
			    	else if(down.isDown&&canGoDown)
			    	{
			    		pressed = true;
			    		diceCount--;
			    		player.y = beforeY+64;
			    	}
			    	else if(left.isDown&&canGoLeft)
			    	{
			    		pressed = true;
			    		diceCount--;
			    		player.x = beforeX-64;
			    	}
			    	else if(right.isDown&&canGoRight)
			    	{
			    		pressed = true;
			    		diceCount--;
			    		player.x = beforeX+64;
			    	}
		    		diceCountText.text=diceCount;
		    	}
		    	if(pressed)
		    	{
		    		if(!(up.isDown||down.isDown||left.isDown||right.isDown))
		    		{	
		    			pressed=false;
		    		}
		    	}
		    	if(diceCount==0&&!gameOver)
		    	{
		    		nextTurn();
		    	}
	    	}
	    	else if(turn[1]||turn[3])
	    	{
	    		if(startTurn)
	    		{
	    			diceCountText.text=diceCount;
	    			skulls.forEach(function(item){
		    			let skullPosX = item.x/64;
		    			if(skullPosX==0)
		    			{
		    				skullPosX=skullPosX+diceCount;
		    				item.x = skullPosX*64;
		    			}
		    			else if(skullPosX==14)
		    			{
		    				skullPosX=skullPosX-diceCount;
		    				item.x = skullPosX*64;	    				
		    			}
		    			else
		    			{
		    				let random = game.rnd.integerInRange(0,1);
		    				if(random==0)//right
		    				{
			    				skullPosX=skullPosX+diceCount;
			    				if(skullPosX>14)
			    				{
			    					skullPosX=skullPosX-14;
			    				}
			    				item.x = skullPosX*64;
		    				}
		    				else//left
		    				{
			    				skullPosX=skullPosX-diceCount;
			    				if(skullPosX<0)
			    				{
			    					skullPosX=14+skullPosX;
			    				}
			    				item.x = skullPosX*64;
		    				}
		    			}
		    		});
	    			skulls2.forEach(function(item){
		    			let skullPosY = item.x/64;
		    			if(skullPosY==0)
		    			{
		    				skullPosY=skullPosY+diceCount;
		    				item.y = skullPosY*64;
		    			}
		    			else if(skullPosY==9)
		    			{
		    				skullPosY=skullPosY-diceCount;
		    				item.y = skullPosY*64;	    				
		    			}
		    			else
		    			{
		    				let random = game.rnd.integerInRange(0,1);
		    				if(random==0)//up
		    				{
			    				skullPosY=skullPosY-diceCount;
			    				if(skullPosY<0)
			    				{
			    					skullPosY=9+skullPosY;
			    				}
			    				item.y = skullPosY*64;
		    				}
		    				else//left
		    				{
			    				skullPosY=skullPosY+diceCount;
			    				if(skullPosY>9)
			    				{
			    					skullPosY=skullPosY-9;
			    				}
			    				item.y = skullPosY*64;
		    				}
		    			}
	    			});
	    			if(!gameOver)
	    				nextTurn();
			    	startTurn=false;
	    		}
		    } 
	    	else if(turn[2]||turn[4])
	    	{
	    		if(startTurn)
	    		{
	    			
	        		let newMouseX=0;
	        		let newMouseY=0;
	    			let mousePosX = mouse.x/64;
	    			let mousePosY = mouse.y/64;
	    			if(mousePosX==0&&mousePosY==0)
	    			{
	    				mouse.x = (mousePosX+diceCount)*64;
	    				mouse.y = (mousePosY+diceCount)*64;
	    			}
	    			else if(mousePosX==0&&mousePosY==9)
	    			{
	    				mouse.x = (mousePosX+diceCount)*64;
	    				mouse.y = (mousePosY-diceCount)*64;
	    			}
	    			else if(mousePosX==14&&mousePosY==0)
	    			{
	    				mouse.x = (mousePosX-diceCount)*64;
	    				mouse.y = (mousePosY+diceCount)*64;
	    			}
	    			else if(mousePosX==14&&mousePosY==9)
	    			{
	    				mouse.x = (mousePosX-diceCount)*64;
	    				mouse.y = (mousePosY-diceCount)*64;
	    			}
	    			else if(mousePosY==0&&mousePosX>0&&mousePosX<14)
	    			{
	    				switch(game.rnd.integerInRange(0,1))
	    				{
	    					case 0://left
	    						newMouseX = mousePosX-diceCount;
	    						newMouseY = mousePosY+diceCount;
	    						if(newMouseX<0)
	    						{
	    							newMouseX = newMouseX*-1;
	    						}
	    						break;
	    					case 1://right
	    						newMouseX = mousePosX+diceCount;
	    						newMouseY = mousePosY+diceCount;
	    						if(newMouseX>14)
	    						{
	    							newMouseX = newMouseX-14;
	    							newMouseX = mousePosX-newMouseX;
	    						}
	    						break;
	    				}
	    				mouse.x = newMouseX*64;
	    				mouse.y = newMouseY*64;
	    			}
	    			else if(mousePosY==9&&mousePosX>0&&mousePosY<14)
	    			{
	    				switch(game.rnd.integerInRange(0,1))
	    				{
	    					case 0://left
	    						newMouseX = mousePosX-diceCount;
	    						newMouseY = mousePosY-diceCount;
	    						if(newMouseX<0)
	    						{
	    							newMouseX = newMouseX*-1;
	    						}
	    						break;
	    					case 1://right
	    						newMouseX = mousePosX+diceCount;
	    						newMouseY = mousePosY-diceCount;
	    						if(newMouseX>14)
	    						{
	    							newMouseX = newMouseX-14;
	    							newMouseX = mousePosX-newMouseX;
	    						}
	    						break;
	    				}
	    				mouse.x = newMouseX*64;
	    				mouse.y = newMouseY*64;
	    			}
	    			else if(mousePosX==0&&mousePosY>0&&mousePosY<9)
	    			{
	    				switch(game.rnd.integerInRange(0,1))
	    				{
	    					case 0:
	    						newMouseX = mousePosX+diceCount;
	    						newMouseY = mousePosY+diceCount;
	    						if(newMouseX>14)
	    						{
	    							newMouseX = newMouseX-14;
	    							newMouseX = mousePosX-newMouseX;
	    						}
	    						break;
	    					case 1:
	    						newMouseX = mousePosX+diceCount;
	    						newMouseY = mousePosY-diceCount;
	    						if(newMouseX>14)
	    						{
	    							newMouseX = newMouseX-14;
	    							newMouseX = mousePosX-newMouseX;
	    						}
	    						break;
	    				}
	    				mouse.x = newMouseX*64;
	    				mouse.y = newMouseY*64;
	    			}
	    			else if(mousePosX==14&&mousePosY>0&&mousePosY<9)
	    			{
	    				switch(game.rnd.integerInRange(0,1))
	    				{
	    					case 0:
	    						newMouseX = mousePosX-diceCount;
	    						newMouseY = mousePosY-diceCount;
	    						if(newMouseX<0)
	    						{
	    							newMouseX = newMouseX*-1;
	    						}
	    						break;
	    					case 1:
	    						newMouseX = mousePosX-diceCount;
	    						newMouseY = mousePosY+diceCount;
	    						if(newMouseX<0)
	    						{
	    							newMouseX = newMouseX*-1;
	    						}
	    						break;
	    				}
	    				mouse.x = newMouseX*64;
	    				mouse.y = newMouseY*64;
	    			}
	    			else
	    			{
	    				switch(game.rnd.integerInRange(0,3))
	    				{
	    					case 0:
	    						newMouseX = mousePosX-diceCount;
	    						newMouseY = mousePosY-diceCount;
	    						if(newMouseX<0)
	    						{
	    							newMouseX = newMouseX*-1;
	    						}
	    						if(newMouseY<0)
	    						{
	    							newMouseY = newMouseY*-1;
	    						}
	    						break;
	    					case 1:
	    						newMouseX = mousePosX+diceCount;
	    						newMouseY = mousePosY-diceCount;
	    						if(newMouseX>14)
	    						{
	    							newMouseX = newMouseX-14;
	    							newMouseX = mousePosX-newMouseX;
	    						}
	    						if(newMouseY<0)
	    						{
	    							newMouseY = newMouseY*-1;
	    						}
	    						break;
	    					case 2:
	    						newMouseX = mousePosX+diceCount;
	    						newMouseY = mousePosY+diceCount;
	    						if(newMouseX>14)
	    						{
	    							newMouseX = newMouseX-14;
	    							newMouseX = mousePosX-newMouseX;
	    						}
	    						if(newMouseY>9)
	    						{
	    							newMouseY = newMouseY-9;
	    							newMouseY = mousePosY-newMouseY;
	    						}
	    						break;
	    					case 3:
	    						newMouseX = mousePosX-diceCount;
	    						newMouseY = mousePosY+diceCount;
	    						if(newMouseX<0)
	    						{
	    							newMouseX = newMouseX*-1;
	    						}
	    						if(newMouseY>9)
	    						{
	    							newMouseY = newMouseY-9;
	    							newMouseY = mousePosY-newMouseY;
	    						}
	    						break;
	    				}
	    				mouse.x = newMouseX*64;
	    				mouse.y = newMouseY*64;
	    			}
	    		}
	    		if(!gameOver)
	    			nextTurn();
	    		startTurn=false;
	    	}
    	}
    }
    
    function render() 
    {
    	//game.debug.text('Player X: ' + player.x + ' Player Y:' + player.y, 32, 40);
    	//game.debug.text('cat X: ' + catStartX + ' cat Y:' + catStartY, 32, 55);
    	//game.debug.text('mouse X: ' + mouseStartX + ' mouse Y:' + mouseStartY, 32, 75);
    	//game.debug.text('Dice Count: ' + diceCount, 32, 90);
    	//game.debug.text('cross x: ' + crossBones1.x + ' cross y: ' + crossBones1.y, 32, 100);
    	//game.debug.text('Camera x: ' + game.camera.x + 'Camera width: ' + game.camera.width , 32, 80);

    }
};
