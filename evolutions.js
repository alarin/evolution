class Engine {
    constructor(canvas) {
        this.drawables = [];
        this.tickNumber = 0;
        this.lastFrame = new Date();
        this.running = false;

        this.canvas = canvas;
        this.objinfo = document.createElement('div');
        canvas.parentNode.appendChild(this.objinfo);

        this.canvas.width = window.innerWidth-20;
        this.canvas.height = window.innerHeight-20;
        var self = this;
        this.canvas.addEventListener('click', function(event) { self.canvasOnClick(event)}, false);
        this.canvas.addEventListener('mousemove', function(event) { self.canvasOnMove(event)}, false);

        this.ctx = canvas.getContext('2d');
        this.clearCanvas();

        this.food = [];
        this.placefood(1000);
    }

    placefood(count) {
        var count = Math.min(count, 2000 - this.food.length);
        for (var i = 0; i < count / 2; i++) {
            this.food.push([rndInt(this.canvas.width), rndInt(this.canvas.height)]);
        }
        var side = 5;
        for (var n = 0; n < count/2/(side*side); n++) {
            var x = rndRange(side*3, this.canvas.width - side*3);
            var y = rndRange(side*3, this.canvas.height - side*3);
            for (var i = -side; i < side; i++) {
                for (var j = -side; j < side; j++) {
                    this.food.push([x + i * 3, y + j * 3]);
                }
            }
        }
    }

    eat(food) {
        this.food.splice(this.food.indexOf(food), 1);
    }

    canvasOnClick(event) {
        if (this.running) {
            this.stop();
        } else {
            this.start();
            this.objinfo.style.display = "none";
        }
    }

    canvasOnMove(event) {
        if (!this.running) {
            this.objinfo.style.display = "none";
            var x = event.clientX - 10;
            var y = event.clientY - 10;

            var innerHtml = "";
            for (var n in this.drawables) {
                var o = this.drawables[n];
                if ((o.x > x) && (o.x < x + 10) && (o.y > y) && (o.y < y + 10)) {
                    innerHtml += JSON.stringify(o, null, ' ') + "\n=============\n";
                    this.objinfo.style.position = 'absolute';
                    this.objinfo.style.zIndex = 1000;
                    this.objinfo.style.background = "#FFF";
                    this.objinfo.style.left = x + "px";
                    this.objinfo.style.top = y + "px";
                    this.objinfo.style.width = 200 + "px";
                    this.objinfo.style.height = 300 + "px";
                    this.objinfo.style.whiteSpace = "pre";
                    this.objinfo.style.overflowY = "auto";
                    this.objinfo.style.display = "block";
                }
            }
            this.objinfo.innerHTML = innerHtml;
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.clearCanvas();
        this.ctx.font = "12px serif";
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillText("Tick: " + this.tickNumber, 5, 15);
        this.ctx.fillText("Objects: " + this.drawables.length, 5, 30);
        var curFps = 1000/(new Date() - this.lastFrame);
        this.ctx.fillText("FPS: " + Math.floor((this.fps + curFps)/2), 5, 45);
        this.fps = curFps;

        for (var n in this.food) {
            var f = this.food[n];
            this.ctx.fillStyle = '#999';
            this.ctx.fillRect(f[0], f[1], 2, 2);
        }
        for (var d in this.drawables) {
            this.drawables[d].draw(this.ctx);
        }
    }

    _objectInside(ox, oy, x, y, r) {
        return (ox > x - r/2) && (ox < x + r/2) && (oy > y - r/2) && (oy < y + r/2);
    }

    _objectsAround(me, x, y) {
        var r1 = FOV_RADIUS;
        var r2 = REACH_RADIUS;

        var fov_animals = [];
        var fov_food = [];
        var r_animals = [];
        var r_food = [];

        for (var n in this.drawables) {
            var o = this.drawables[n];
            if (this._objectInside(o.x, o.y, x, y, r1)) {
                if (o != me) fov_animals.push(o);
            }
            if (this._objectInside(o.x, o.y, x, y, r2)) {
                if (o != me) r_animals.push(o);
            }
        }

        for (var n in this.food) {
            var f = this.food[n];
            if (this._objectInside(f[0], f[1], x, y, r1)) {
                fov_food.push(f);
            }
            if (this._objectInside(f[0], f[1], x, y, r2)) {
                r_food.push(f);
            }
        }
        return {
            "fov": {
                "animals": fov_animals,
                "food": fov_food
            },
            "reach": {
                "animals": r_animals,
                "food": r_food
            }
        };
    }

    tick() {
        if ((new Date() - this.lastFrame) < ENGINE_TICK) {
            return;
        }

        //don't spawn too much objects (fps)
        if (this.drawables.length > MAX_OBJECTS) {
            console.log(this.drawables.length + "objects. Truncated to " + MAX_OBJECTS  );
            this.drawables.splice(MAX_OBJECTS, this.drawables.length-MAX_OBJECTS-1);
        }

        for (var n in this.drawables) {
            var d = this.drawables[n];

            d.around = this._objectsAround(d, d.x, d.y);
            d.engine = this;
            d.tick();
            delete d.around;
            delete d.engine;

            if (d.remove) {
                this.drawables.splice(n, 1);
            } else {
                if (d.x < 0) d.x = 0;
                if (d.x + d.width > this.canvas.width) d.x = this.canvas.width - d.width;

                if (d.y < 0) d.y = 0;
                if (d.y + d.height > this.canvas.height) d.y = this.canvas.height - d.height;
            }
        }
        this.placefood(FOOD_REPLENISH_ON_TICK);
        this.draw();

        this.lastFrame = new Date();
        this.tickNumber++;
    }

    //addObject(obj) {
    //    for (var n in this.drawables) {
    //        var o = this.drawables[n];
    //    }
    //}

    start() {
        this.tickTimer = setInterval(function() {engine.tick()}, 1);
        this.running = true;
    }

    stop() {
        clearInterval(this.tickTimer);
        this.running = false;
    }
}

var engine = new Engine(document.getElementById("live"));


for (var x=0; x < 150; x++) {
    var a = new Animal(100, 200, new DNA({"red": 255, speed: 20, "sex": rndChoice([0,255]), "maxSpawn": 2, "maxAge": 100}));
    engine.drawables.push(a);
}

for (var x=0; x < 150; x++) {
    a = new Animal(engine.canvas.width-100, 200, new DNA({"blue": 255, "speed": 10, "sex": rndChoice([0,255]), "maxSpawn": 4, "maxAge": 50, "eatAnimals": 255}));
    engine.drawables.push(a);
}

engine.start();



