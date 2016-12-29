class Drawable {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.color = color;
        this.energy = 150;

        this.remove = false;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        if (this.dna.sex) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width/2, 0, 2*Math.PI, false);
            ctx.fill()
        }
    }

    tick() {
    }
}

class Animal extends Drawable {
    constructor(x, y, dna) {
        super(x, y, 3, 3, dna.color());

        this.dna = dna;
        this.age = 0;
        this.breeded = false;
        this.generation = 0;

        this.lastXDelta = 0;
        this.lastYDelta = 0;
    }

    can_breed() {
        return (!this.breeded) && (this.energy > ANIMAL_BREED_ENERGY) && (this.age > this.dna.genes["maxAge"] / 4);
    }

    breed() {
        var reach = this.around['reach']['animals'];
        var fov = this.around['fov']['animals'];

        var breedable = [];
        for (var n in reach) {
            var o = reach[n];
            if ((o.dna.sex != this.dna.sex) && o.can_breed()) {
                breedable.push(o);
            }
        }
        if (breedable.length) {
           this.engine.eat(reach[0]);
           this.energy += 10;
        } else {
            var breedable = [];
            for (var n in reach) {
                var o = reach[n];
                if ((o.dna.sex != this.dna.sex) && o.can_breed()) {
                    breedable.push(o);
                }
            }
            if (breedable.length) {
                var mindistance = FOV_RADIUS + 1;
                var minfood = undefined;
                for (var n in fov) {
                    var f = fov[n];
                    var distance = this.distance(f[0], f[1]);
                    if (distance < mindistance) {
                        mindistance = distance;
                        minfood = f;
                    }
                }
                //var f = rndChoice(fov);
                this.move(f[0], f[1]);
            } else {
                this.move();
            }
        }

        var around = this.around['fov']['animals'];
        var breedable = [];
        for (var n in around) {
            var o = around[n];
            if ((o.dna.sex != this.dna.sex) && o.can_breed()) {
                breedable.push(o);
            }
        }

        if (breedable.length != 0) {
            console.log("breed!")
            var breedWith = rndChoice(breedable);
            this.breeded = true;
            breedWith.breeded = true;

            var spawn = rndRange(1, this.dna.maxSpawn);
            var energyPerSpawn = Math.floor(ANIMAL_BREED_ENERGY/spawn);
            for (var i = 0; i < spawn; i++) {
                var a = new Animal(this.x, this.y, this.dna.crossing(breedWith.dna));
                a.generation = this.generation + 1;
                a.energy = energyPerSpawn;
                engine.drawables.push(a);

                this.energy -= energyPerSpawn;
                breedWith.energy -= energyPerSpawn;
            }
        } else {
            this.move();
        }
    }

    distance(x, y) {
        return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    }

    move(x, y) {
        var speed = this.dna.speed;
        var moved_distance = speed;
        if (x == undefined) {
            if (this.lastXDelta != undefined && Math.random() > 0.1) {
                this.x += this.lastXDelta;
                this.y += this.lastYDelta;
            } else {
                this.lastXDelta = rndRange(-speed, speed);
                this.x = this.x + this.lastXDelta;
                this.lastYDelta = rndRange(-speed, speed);
                this.y = this.y + this.lastYDelta;
            }
        } else {
            var distance = this.distance(x, y);
            var angle = Math.atan2(this.y-y, this.x-x);
            moved_distance = Math.min(speed, distance);
            var dx = Math.cos(angle) * moved_distance;
            var dy = Math.sin(angle) * moved_distance;
//            console.log("move from " + [this.x, this.y] +" to "+ [x,y] + " distance " + Math.floor(distance) + " " + dx + ',' + dy);
            this.x -= Math.floor(dx);
            this.y -= Math.floor(dy);
        }
        this.energy -= Math.floor(ANIMAL_MOVEPIXEL_ENERGY * moved_distance);
    }

    eat() {
        var reach = this.around['reach']['food'];
        var fov = this.around['fov']['food'];


        if (reach.length) {
           this.engine.eat(reach[0]);
           this.energy += 10;
        } else if (fov.length) {
            var mindistance = FOV_RADIUS + 1;
            var minfood = undefined;
            for (var n in fov) {
                var f = fov[n];
                var distance = this.distance(f[0], f[1]);
                if (distance < mindistance) {
                    mindistance = distance;
                    minfood = f;
                }
            }
            //var f = rndChoice(fov);
            this.move(f[0], f[1]);
        } else {
            this.move();
        }
    }

    tick() {
        this.age++;
        if ((this.age >= this.dna.genes["maxAge"]) && rndChance(0.08)) {
            this.remove = true;
            return;
        }

        if (this.energy < 0) {
            this.remove = true;
            return;
        }

        this.breeded = false;

        if (this.can_breed()) {
            this.breed();
        } else {
            this.eat();
        }

        this.energy -= ANIMAL_TICK_ENERGY;
    }
}
