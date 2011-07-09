YUI.add('jsnake', function(Y){
    
    function JSnake(config) { 
        // Invoke Base constructor, passing through arguments
        JSnake.superclass.constructor.apply(this, arguments);
    }
    
    var STATI = {
            INIT: 0,
            PLAY: 1,
            PAUSE: 2,
            OVER: 3
        },
        STATI_LABELS = {
        	0: '<space>',
        	1: '',
        	2: '<pause>',
        	3: '<over>'
        },
        TILES_NUM = 40,
        TILES_SIZE = 10, //px
        BASE_SPEED = 700,
        DIRS = {
            // maps to keycodes
            LEFT:   37,
            RIGHT:  39,
            UP:     38,
            DOWN:   40
        },
        STEPS = {
            37: [-1, 0],
            39: [+1, 0],
            38: [0, -1],
            40: [0, +1]
        };

    JSnake.NAME = "JSNake";

    JSnake.ATTRS = {
    	tilesNum: {value: 20, setOnce: true},
    	tilesSize: {value: 20, setOnce: true},
    	drawGrid: {value: false},
        snakeDir: {value: DIRS.RIGHT},
        score: {value: 0},
        apple: {},
        status: {value: STATI.INIT},
        size: { getter: function(e) { return this.get('tilesNum') * this.get('tilesSize'); }}
        	
    };

    Y.extend(JSnake, Y.Widget, {
        // Prototype methods for your new class
        initializer: function(cfg) {
            // The snake is just a list of positions [x, y]
            this.setAttrs(cfg);
            this.initGame();
        },
        initGame: function() {
            this._snake = [
                    [3, 1],
                    [2, 1],
                    [1, 1]
                ];
            this.dropApple();
            this.set('score', 0);
        },
        writeText: function(text) {
        	var ctx = this.canvas,
        		size = this.get('size');
			ctx.save();
			ctx.font = 'bold 102px sans-serif';
			ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, size / 2, size / 2);
			ctx.restore();
        },
        dropApple: function() {
            var tilesNum = this.get('tilesNum'),
            	apple = [Math.floor(Math.random() * tilesNum), Math.floor(Math.random() * tilesNum)];
            this.set('apple', apple);
        },
        renderUI: function() {
            var size = this.get('size'),
                contentBox = this.get('contentBox'),
                canvas = Y.Node.create('<canvas></canvas>');
 
            canvas.setAttribute('width', size);
            canvas.setAttribute('height', size);
             contentBox.appendChild(canvas);
            this.canvas = Y.Node.getDOMNode(canvas).getContext('2d');
        },
        bindUI: function() {
            var boundingBox = this.get("boundingBox");
            Y.on('key', this._moveSnake, document, "down:37,38,39,40", this);
            Y.on('key', function(e) {
                    var status = this.get('status');
                    if (status === STATI.INIT) {
                        this.set('status', STATI.PLAY);
                    } else if (status === STATI.PLAY) {
                    	this.set('status', STATI.PAUSE);
                    } else if (status === STATI.PAUSE) {
                    	this.set('status', STATI.PLAY);
                    } else if (status === STATI.OVER) {
                    	this.initGame();
                        this.set('status', STATI.INIT);   
                    }
                }, document, "down:32", this);
        	Y.on('key', function(e) {
        			this.set('drawGrid', !this.get('drawGrid'));
        		}, document, "down:71", this);
            
        },
        syncUI: function() {
                /* Draw a different page depending on the status */
                var self = this,
                    status = this.get('status'),
                    speed = BASE_SPEED - (this.get('score') * 20);
                    
                if (status === 1) {
                    //PLAY
                    this._playState();
                }
                this._clearBoard();
                this._drawApple();
                this._drawSnake();
                this._drawStatus();
                /* kicks next frame */
                setTimeout(function() { self.syncUI.apply(self); }, speed);
            },
        _moveSnake: function(e) {
            var axis = (this.get('snakeDir') === DIRS.LEFT || this.get('snakeDir') === DIRS.RIGHT) ? 'H' : 'V',
                nextAxis = (e.keyCode === DIRS.LEFT || e.keyCode === DIRS.RIGHT) ? 'H' : 'V';
            // Validate the desired direction and stores it in the object for the next cycle.
            if (axis !== nextAxis) {
                this.set('snakeDir', e.keyCode);
            }
        },
        _clearBoard: function() {
        	var size = this.get('size'),
        		ctx = this.canvas;
            ctx.clearRect(0, 0, size, size);
            if (this.get('drawGrid')) {
            	this._drawGrid();
            }
        },
        _drawGrid: function() {
        	var size = this.get('size'),
        		tilesNum = this.get('tilesNum'),
        		tilesSize = this.get('tilesSize'),
        		x, y,
        		ctx = this.canvas;
            ctx.save();
            ctx.strokeStyle = "AAA";
            for (x = 0; x < tilesNum; x++) {
            	for (y = 0; y < tilesNum; y++) {
            		ctx.strokeRect(x * tilesSize, y * tilesSize, (x + 1) * tilesSize, (y + 1) * tilesSize);
            	}
            }
            ctx.restore();
        },
        _drawApple: function() {
            var c = this.canvas,
                a = this.get('apple'),
                tilesSize = this.get('tilesSize'),
                radius = tilesSize / 2,
                x = a[0] * tilesSize + radius,
                y = a[1] * tilesSize + radius;
            c.save();
            c.fillStyle = '0a0'; //apple green
            c.beginPath();
            c.arc(x, y, radius, 0, Math.PI * 2, true);
            c.fill();
            c.restore();
        },
        _drawSnake: function() {
            var c = this.canvas,
            	s = this.get('tilesSize');
		    c.save();  
		    c.fillStyle = '000';
            Y.Array.each(this._snake, function(pos, i) {
                var x0 = pos[0] * s,
                    y0 = pos[1] * s,
                    x1 = (pos[0] + 1) * s,
                    y1 = (pos[1] + 1) *s;
                c.fillRect(x0, y0, s, s);
            }, this);
	        c.restore();
        },
        _drawStatus: function() {
        	var status = this.get('status');
        	if (status === STATI.PLAY) {
				this.writeText(this.get('score'));
			} else {      	
        		this.writeText(STATI_LABELS[status]);
        	}

        },
        _playState: function() {
            var dir = this.get('snakeDir'),
                apple = this.get('apple'),
                head = this._snake[0].slice(),
                nextHead = [head[0] + STEPS[dir][0], head[1] + STEPS[dir][1]],
                boundary = this.get('tilesNum'),
                hasApple = (nextHead[0] === apple[0] && nextHead[1] === apple[1])
                outOfBoard = (nextHead[0] < 0) || (nextHead[1] < 0) || (nextHead[0] >= boundary) || (nextHead[1] >= boundary),
                eatItself = this._snake.slice(1).indexOf(nextHead) > 1;
            // what happens in the next tile?
            // is it out of the board?
            if (outOfBoard || eatItself) {
                this.set('status', STATI.OVER);
                return;
            }
            // set the new head
            this._snake.unshift(nextHead);
            // if the head is on an apple,
            if (hasApple) {
                // Yay! +1!
                this.set('score', this.get('score') + 1);
                // drop another apple
                this.dropApple();
            } else {
                // move the snake.
                this._snake.pop();
            }
            
        }
    });
    Y.JSnake = JSnake;
}, '1.0.0', {requires: ['node', 'event-key', 'widget']});
