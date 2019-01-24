var config = {
	type: Phaser.AUTO,
	width: 640,
	height: 480,
	backgroundColor: '#afafcf',
	parent: 'phaser-example',
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

var snake;
var food;
var cursors;

var up = 0;
var down = 1;
var left = 2;
var right = 3;

function preload(){
	this.load.image('food', 'assets/food.png');
	this.load.image('body', 'assets/body.png');
}

function create(){
	
    var Food = new Phaser.Class({

		Extends: Phaser.GameObjects.Image,

		initialize:

		function Food(scene,x,y){
			Phaser.GameObjects.Image.call(this,scene)

			this.setTexture('food');
			this.setPosition(x*16,y*16);
			this.setOrigin(0);

			this.total = 0;

			scene.children.add(this);
		},

		eat: function (){

			this.total++;

		}
	});

	var Snake = new Phaser.Class({

        initialize:


        function Snake (scene, x, y)
        {
            this.headPosition = new Phaser.Geom.Point(x, y);

            this.body = scene.add.group();

            this.head = this.body.create(x * 16, y * 16, 'body');
            this.head.setOrigin(0);

            this.alive = true;

            this.speed = 100;

            this.moveTime = 0;

            this.tail = new Phaser.Geom.Point(x, y);

            this.heading = right;
            this.direction = right;
        },



        update: function (time)
        {
            if (time >= this.moveTime)
            {
                return this.move(time);
            }
        },

        faceLeft: function ()
        {
            if (this.direction === up || this.direction === down)
            {
                this.heading = left;
            }
        },

        faceRight: function ()
        {
            if (this.direction === up || this.direction === down)
            {
                this.heading = right;
            }
        },

        faceUp: function ()
        {
            if (this.direction === left || this.direction === right)
            {
                this.heading = up;
            }
        },

        faceDown: function ()
        {
            if (this.direction === left || this.direction === right)
            {
                this.heading = down;
            }
        },

        move: function (time)
        {
            /**
            * Based on the heading property (which is the direction the pgroup pressed)
            * we update the headPosition value accordingly.
            * 
            * The Math.wrap call allow the snake to wrap around the screen, so when
            * it goes off any of the sides it re-appears on the other.
            */
            switch (this.heading)
            {
                case left:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40);
                    break;

                case right:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;

                case up:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;

                case down:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }

            this.direction = this.heading;

            //  Update the body segments and place the last coordinate into this.tail
            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

            var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(),{ x: this.head.x, y: this.head.y},1);

            if (hitBody){ // || this.headPosition.x === 640
            	console.log('dead');
            
            	this.alive = false;

            	return false;
            } else {
            	//  Update the timer ready for the next movement
            	this.moveTime = time + this.speed;

            	return true;
            } 
        },

        grow: function ()
        {
            var newPart = this.body.create(this.tail.x, this.tail.y, 'body');

            newPart.setOrigin(0);
        },

        collideWithFood: function (food)
        {
            if (this.head.x === food.x && this.head.y === food.y)
            {
                this.grow();

                food.eat();

                //  For every 5 items of food eaten we'll increase the snake speed a little
                if (this.speed > 20 && food.total % 5 === 0)
                {
                    this.speed -= 5;
                }

                return true;
            }
            else
            {
                return false;
            }
        },

        updateGrid: function (grid)
        {
            //  Remove all body pieces from valid positions list
            this.body.children.each(function (segment) {

                var bx = segment.x / 16;
                var by = segment.y / 16;

                grid[by][bx] = false;

            });

            return grid;
        }

    });

	food = new Food(this,3,4);

	snake = new Snake(this,8,8);

	cursors = this.input.keyboard.createCursorKeys();

}

function update(time, delta){
	if(!snake.alive){
		return;
	}
	if (cursors.left.isDown)
    {
        snake.faceLeft();
    }
    else if (cursors.right.isDown)
    {
        snake.faceRight();
    }
    else if (cursors.up.isDown)
    {
        snake.faceUp();
    }
    else if (cursors.down.isDown)
    {
        snake.faceDown();
    }

    if (snake.update(time)){
    	if(snake.collideWithFood(food)){
    		repositionFood();
    	}
    }
}

function repositionFood(){
	var testGrid = [];

	for (var y = 0 ; y < 30 ; y++){
		testGrid [y] = [];

		for (var x = 0; x < 40; x++){
			testGrid[y][x] = true;
		}
	}

	snake.updateGrid(testGrid);

	var validLocations = [];

	for (var y = 0; y < 30 ; y++){
		for (var x = 0; x <40; x++){
			if (testGrid[y][x] === true){
				validLocations.push({x:x, y:y});
			}
		}
	}

	if (validLocations.length > 0){
		var pos = Phaser.Math.RND.pick(validLocations);

		food.setPosition(pos.x*16,pos.y*16);

		return true;
	} else {
		return false;
	}
}



var game = new Phaser.Game(config);