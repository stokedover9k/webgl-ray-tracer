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
  this.mass = .03 + .06 * Math.random();
  this.lifespan = 1;
  this.liveliness = 1;
  this.draw_function = draw_function || UNIMPLEMENTED("Particle.draw_function");
}

Particle.prototype.isDead = function() { return this.liveliness <= 0; };

// @arg td = time delta = time since last update
Particle.prototype.update = function(td) {
  if( td == undefined ) {
    alert("[ERROR] particle.update(undefined)");
    td = 0;
  }
  if( !this.isDead() ) {
    this.vel = this.vel.plus(this.acc.scale(td));
    this.loc = this.loc.plus(this.vel.scale(td));
    this.rotationAngle += td * this.angularVelocity;
    this.liveliness -= td / this.lifespan;
  }
};

Particle.prototype.applyForce = function(f) { this.acc = this.acc.plus(f); };

// @arg da = argument object to display/draing method
Particle.prototype.display = function () { this.draw_function(this); };

//============== PARTICLE SYSTEM ================//

function Attractor (loc, strength) {
  this.loc = loc;
  this.str = strength || 1;
}

function ParticleSystem (emitterLoc, size, particleBuilder) {
  this.emitterLoc = emitterLoc || ORIGIN;

  this.attractor = new Attractor(this.emitterLoc);

  this.particleBuilder = particleBuilder;
  this.particlePool = ListFill(size, particleBuilder);
  this.active = NIL;
}

ParticleSystem.prototype.update = function(td) {
  var sys = this;

  var pair = this.active.splitBy(isDead);
  var dead = pair.first;
  var alive = pair.second;

  this.active = alive;

  alive.foreach(function (p1) {
    alive.foreach(function (p2) {
      if( p1 == p2 ) return;

      var dif = p2.loc.minus(p1.loc);
      var r2 = dif.dot(dif);

      // hack: without this, when particles are too close, they shoot frantically off the screen.
      r2 += p1.mass + p2.mass;

      // if too close, repel
      if( r2 <= (p1.mass + p2.mass) * 2)
        p1.applyForce(dif.normalized().scale(- 3 * p1.mass * p2.mass / r2));
      // otherwise, attract
      else
        p1.applyForce(dif.normalized().scale(p1.mass * p2.mass / r2));
    });

  });

  alive.foreach(function (p) {
    p.applyForce(sys.attractor.loc.minus(p.loc).normalized().scale(sys.attractor.str));
    p.update(td);
    p.acc = ORIGIN;
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

  p.lifespan = 5;
  p.liveliness = 1;
  p.loc = this.emitterLoc;
  p.vel = new vec3(Math.random() * .3, Math.random() * .2, Math.random() * .25);
  p.acc = ORIGIN;

  this.active = new List(p, this.active);
};
