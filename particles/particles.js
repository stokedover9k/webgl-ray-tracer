//============== __HELPERS__ (private) =============//

function UNIMPLEMENTED (warning) {
  return function (arg) { console.log("[ERROR: unimplemented] " + warning, arg); }
}

//============== PARTICLE ================//

// @arg loc = vec3 location 
// @arg vel = vec3 velocity
// @arg acc = vec3 acceleration
function Particle (loc, vel, acc, draw_function) {
  this.loc = loc || ORIGIN;
  this.vel = vel || ORIGIN;
  this.acc = acc || ORIGIN;
  this.lifespan = 1;
  this.liveliness = 1;
  this.draw_function = draw_function || UNIMPLEMENTED("Particle.draw_function");
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
Particle.prototype.display = function () { this.draw_function(this); };

//============== PARTICLE SYSTEM ================//

function ParticleSystem (loc, size, particleBuilder) {
  this.loc = loc || ORIGIN;

  this.particleBuilder = particleBuilder;
  this.particlePool = ListFill(size, particleBuilder);
  this.active = NIL;
}

ParticleSystem.prototype.update = function(td) {
  var pair = this.active.splitBy(isDead);
  var dead = pair.first;
  var alive = pair.second;

  this.active = alive;
  alive.foreach(function (p) {
    p.update(td);
  });

  var psys = this;
  dead.foreach(function (p) {
    psys.particlePool = new List(p, psys.particlePool);
  });
};

ParticleSystem.prototype.display = function() {
  this.active.foreach(function (p) {
    p.display();
  });
};

ParticleSystem.prototype.addParticle = function() {
  var p;
  if( this.particlePool == NIL )
    p = this.particleBuilder();
  else {
    p = this.particlePool.val;
    this.particlePool = this.particlePool.tail;
  }

  p.liveliness = 1;
  p.loc = this.loc;
  p.vel = new vec3(Math.random() * .4, Math.random() * .2, 0);
  p.acc = new vec3(0,-.3,0);

  this.active = new List(p, this.active);
};

//==============================================//

function ParticleFactory (gl, canvas) {

  var tetra = createRegularTetrahedron();

  this.build = function () {
    var particle = new Particle(null, null, null,
    function (particle) {  // drawing function
      this.matrix = [.05,0,0,0, 0,.05,0,0, 0,0,.05,0, this.loc.x(),this.loc.y(),this.loc.z(),1];
      setUniforms(this, makeMetallic([.1, 0, 0, this.liveliness]));
      drawObject(gl, this);
    });

    particle.lifespan = 2;
    particle.vertices = tetra;

    return canvas.prepObject(particle, 'fs_phong');
  }
}

//---------------  MAIN  ----------------------

var LAST_TIME = 0;
var MOUSE_PRESSED = false;

function probEmission(td) {
  var frameLength = 0.001;
  var probFrameEmission = 0.1;
  var numFrames = td / frameLength;
  return 1 - Math.pow(1 - probFrameEmission, numFrames);
}

CanvasParticles.setup = function () {

  var context = this;
  var gl = this.gl;

  this.particleSystem = new ParticleSystem(ORIGIN, 100, new ParticleFactory(gl, this).build);

  /*
  var tetra = createRegularTetrahedron();

  function createParticle () {
    var particle = new Particle(null, null, null,
      function (particle, arg) {  // drawing function

        this.matrix = [.05,0,0,0, 0,.05,0,0, 0,0,.05,0, this.loc.x(),this.loc.y(),this.loc.z(),1];
        setUniforms(this, makeMetallic([.1, 0, 0, this.liveliness]));
        drawObject(gl, this);

      });

    particle.lifespan = 2;
    particle.vertices = tetra;  //createSphere(4,2);

    return context.prepObject(particle, 'fs_phong');
  }

  var particlePool = NIL;
  for( var i = 0; i < 100; i++ )
    particlePool = new List(createParticle(), particlePool);
  this.PARTICLE_POOL = particlePool;
  */

  this.ACTIVE_OBJECTS = new List(this.particleSystem, NIL);
}

function isDead (p) { return p.isDead(); }
function isAlive (p) { return !p.isDead(); }

CanvasParticles.update = function () {
  var CANVAS = this;

  MOUSE_PRESSED = CANVAS.mousePressed;
  var DELTA_TIME = time - LAST_TIME;
  /////////////////////////////////

  this.particleSystem.loc = new vec3(Math.sin(time) * .2, 0, 0);
  this.particleSystem.update(DELTA_TIME);

  if( Math.random() >= probEmission(DELTA_TIME) ) {
    this.particleSystem.addParticle();
  }

  /////////////////////////////////
  LAST_TIME = time;
}
