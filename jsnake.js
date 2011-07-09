YUI.add('jsnake', function(Y){
    
    function JSnake(config) { 
        // Invoke Base constructor, passing through arguments
        JSnake.superclass.constructor.apply(this, arguments);
    }
    
    var STATI = {
            INIT: 0,
            PLAY: 1,
            OVER: 2
        },
        TILES_NUM = 30,
        TILES_SIZE = 10, //px
        BASE_SPEED = 1000,
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
        snakeDir: {value: DIRS.RIGHT},
        score: {value: 0},
        apple: {},
        status: {value: STATI.INIT}
        
    };
 
    Y.extend(JSnake, Y.Widget, {
        // Prototype methods for your new class
        initializer: function(cfg) {
            // The snake is just a list of positions [x, y]
            this._snake = [
                    [5, 1],
                    [4, 1],
                    [3, 1],
                    [2, 1],
                    [1, 1]
                ];
            this.dropApple();
            this.setAttrs(cfg);
            this.on('statusChange', function(e) {
                Y.log('status: ' + e.newVal);
            });
        },
        dropApple: function() {
            var apple = [Math.floor(Math.random() * TILES_NUM), Math.floor(Math.random() * TILES_NUM)];
            Y.log(apple);
            this.set('apple', apple);
        },
        renderUI: function() {
            var size = TILES_NUM * TILES_SIZE,
                contentBox = this.get('contentBox'),
                canvas = Y.Node.create('<canvas></canvas>');
            // The board is a canvas of 500x500px, that correspods to
            //  a gameboard of 20x20 tiles, 25px each.
            canvas.setAttribute('width', size);
            canvas.setAttribute('height', size);
            canvas.setStyles({
                width: size,
                height: size
            });
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
                    } else if (status === STATI.OVER) {
                        this.set('status', STATI.INIT);   
                    }
                }, document, "down:32", this);
            
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
                /* kicks next frame */
                //Y.later(speed, this, 'syncUI');
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
            this.canvas.clearRect(0, 0, TILES_SIZE * TILES_NUM, TILES_SIZE * TILES_NUM);
        },
        _drawApple: function() {
            var c = this.canvas,
                a = this.get('apple'),
                radius = TILES_SIZE / 2,
                x = a[0] * TILES_SIZE + radius,
                y = a[1] * TILES_SIZE + radius;
            c.save();
            c.fillStyle = '0a0'; //apple green
            c.beginPath();
            c.arc(x, y, radius, 0, Math.PI * 2, true);
            c.fill();
            c.restore();
        },
        _drawSnake: function() {
            var c = this.canvas;
            c.save();  
            Y.Array.each(this._snake, function(pos, i) {
                c.fillStyle = '000';
                var s = TILES_SIZE,
                    x = pos[0] * s,
                    y = pos[1] * s;
                c.fillRect(x, y, x+s, y+s);
            }, this);
            c.restore();
        },
        _playState: function() {
            var dir = this.get('snakeDir'),
                apple = this.get('apple'),
                head = this._snake[0].slice(),
                nextHead = [head[0] + STEPS[dir][0], head[1] + STEPS[dir][1]],
                hasApple = (nextHead[0] === apple[0] && nextHead[1] === apple[1]);
            // what happens in the next tile?
            // is it out of the board?
            Y.log(TILES_NUM);
            Y.log(nextHead);
            if ((nextHead[0] < 0) || (nextHead[1] < 0) || (nextHead[0] >= TILES_NUM) || (nextHead[1] >= TILES_NUM)) {
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