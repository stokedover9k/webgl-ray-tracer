// @arg loc = vec3 location 
// @arg vel = vec3 velocity
// @arg acc = vec3 acceleration
function Particle (loc, vel, acc, draw_function) {
  this.loc = loc || ORIGIN;
  this.vel = vel || ORIGIN;
  this.acc = acc || ORIGIN;
  this.lifespan = 1;
  this.liveliness = 1;
  this.draw_function = draw_function || function (particle, arg) {
    console.log("[ERROR] particle.draw_function not implemented", particle);
  }
}

Particle.prototype.isDead = function() { return this.liveliness <= 0; };

// @arg td = time delta = time since last update
Particle.prototype.update = function(td) {
  this.vel = this.vel.plus(this.acc.scale(td));
  this.loc = this.loc.plus(this.vel.scale(td));
  if( !this.isDead() )
    this.liveliness -= td / this.lifespan;
};

// @arg da = argument object to display/draing method
Particle.prototype.display = function (da) { this.draw_function(this, da); };

// @arg td = time since last update
// @arg da = argument object to display method
Particle.prototype.run = function(td, da) {
  this.update(td);
  this.display(this, da);
};

//---------------  MAIN  ----------------------

var LAST_TIME = 0;
var MOUSE_PRESSED = false;

function resetParticle (p) {
  p.liveliness = 1;
  p.loc = new vec3(-Math.random() * .05, (Math.random()-.5)*.2, 0);
  p.vel = AXIS_X.scale(.3);
  p.acc = new vec3(0,-.3,0);
}

function probEmission(td) {
  var frameLength = 0.001;
  var probFrameEmission = 0.1;
  var numFrames = td / frameLength;
  return 1 - Math.pow(1 - probFrameEmission, numFrames);
}

CanvasParticles.setup = function () {

  var context = this;
  var gl = this.gl;

  function createParticle () {
    var particle = new Particle(null, null, null,
      function (particle, arg) {  // drawing function

        this.matrix = [.05,0,0,0, 0,.05,0,0, 0,0,.05,0, this.loc.x(),this.loc.y(),this.loc.z(),1];
        setUniforms(this, makeMetallic([.1, 0, 0, this.liveliness]));
        drawObject(gl, this);

      });

    particle.lifespan = 2;
    particle.vertices = createSphere(4,2);

    return context.prepObject(particle, 'fs_phong');
  }

  var particlePool = NIL;
  for( var i = 0; i < 100; i++ )
    particlePool = new List(createParticle(), particlePool);
  this.PARTICLE_POOL = particlePool;

  this.ACTIVE_OBJECTS = NIL;
}

function isDead (p) { return p.isDead(); }
function isAlive (p) { return !p.isDead(); }

CanvasParticles.update = function () {
  var CANVAS = this;

  MOUSE_PRESSED = CANVAS.mousePressed;
  var DELTA_TIME = time - LAST_TIME;
  /////////////////////////////////

  if( CANVAS.ACTIVE_OBJECTS != NIL ) {

    var alive = NIL;

    CANVAS.ACTIVE_OBJECTS.foreach(function (p) {
      p.update(DELTA_TIME);

      if( p.isDead() )
        CANVAS.PARTICLE_POOL = new List(p, CANVAS.PARTICLE_POOL);
      else
        alive = new List(p, alive);
    });

    CANVAS.ACTIVE_OBJECTS = alive;
  }

  if( CANVAS.PARTICLE_POOL != NIL ) {  // if have free particles
    if( Math.random() >= probEmission(DELTA_TIME) ) {  // if luck has it

      var p = CANVAS.PARTICLE_POOL.val;
      resetParticle(p);

      CANVAS.PARTICLE_POOL = CANVAS.PARTICLE_POOL.tail;
      CANVAS.ACTIVE_OBJECTS = new List(p, CANVAS.ACTIVE_OBJECTS);
    }
  }



  /////////////////////////////////
  LAST_TIME = time;
}
