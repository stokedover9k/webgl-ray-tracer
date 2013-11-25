var LAST_TIME = 0;
var MOUSE_PRESSED = false;

var mstack = new MatrixStack();

function ParticleFactory (gl, canvas) {

  var tetra = createRegularTetrahedron();

  this.build = function () {

    var rotAxis = new vec3(Math.random(), Math.random(), Math.random()).normalized();

    var particle = new Particle(null, null, null,
      function (particle) {  // drawing function

        mstack.push();

        mstack.apply(MSIdentity()
          .then(MSRotateAxisv(rotAxis, this.rotationAngle))
          .then(MSScale1(this.mass))
          .then(MSTranslatev(this.loc))
          );

        this.matrix = mstack.top().arr();
        this.color[3] = this.liveliness;
        setUniforms(this, makeMetallic(this.color));
        drawObject(gl, this);

        mstack.pop();
      });

    particle.color = [0,Math.random()*.05,Math.random()*.2,1];

    particle.lifespan = 5;
    particle.vertices = tetra;

    particle.rotationAngle = Math.random() * Math.PI * 2;
    particle.angularVelocity = (Math.random() - .5) * 15;

    return canvas.prepObject(particle, 'fs_phong');
  }
}

function probEmission(td) {
  var frameLength = 0.001;
  var probFrameEmission = 0.2;
  var numFrames = td / frameLength;
  return 1 - Math.pow(1 - probFrameEmission, numFrames);
}

function ShiftingColor (col) {
  this.start = col;
  this.ts = [Math.asin(col[0] / .1), Math.asin(col[1] / .1), Math.asin(col[2] / .1)];
  this.col = [0,0,0,0];
  this.update = function (td) {
    var dr = Math.sin(this.ts[0] + LAST_TIME) * .05 + this.start[0] * .5;
    var dg = Math.sin(this.ts[1] + LAST_TIME) * .05 + this.start[1] * .5;
    var db = Math.sin(this.ts[2] + LAST_TIME) * .05 + this.start[2] * .5;

    this.col = this.start;
    this.col = [dr, dg, db, this.start[3]];
  }
  var noise = .01;
  this.get = function () {
    var r = this.col[0] + Math.random() * noise * 2 - noise;
    var g = this.col[1] + Math.random() * noise * 2 - noise;
    var b = this.col[2] + Math.random() * noise * 2 - noise;
    return [r,g,b, this.col[3]];
  }
}

function prepParticle(coloring) {
  return function (p, e) {
    p.lifespan = 5;
    p.liveliness = 1;
    p.loc = e.loc;
    p.acc = ORIGIN;

    // add noise to emission direction
    var n = 0.2;
    p.vel = e.dir.plus(new vec3((Math.random()-.5)*n, (Math.random()-.5)*n, (Math.random()-.5)*n));

    p.color = coloring.get();

    return p;
  }
}

CanvasParticles.setup = function () {

  var context = this;
  var gl = this.gl;

  context.particleSystem = new ParticleSystem(ORIGIN, 100, new ParticleFactory(gl, context).build);

  context.attractor2 = context.particleSystem.addAttractor();

  context.coloring1 = new ShiftingColor([.1, .01, .01, 1]);
  context.coloring2 = new ShiftingColor([.01, .01, .1, 1]);

  context.emitter1 = context.particleSystem.addEmitter(prepParticle(context.coloring1));
  context.emitter2 = context.particleSystem.addEmitter(prepParticle(context.coloring2));

  //----------------------------------------------------------------------------------
  // override the attractor's attract method to reflect particles that get too close
  //----------------------------------------------------------------------------------
  context.attractor2.attract = function (p) {
    p.applyForce(this.loc.minus(p.loc).normalized().scale(this.str));

    var dif = p.loc.minus(this.loc);
    if( dif.dot(dif) < .16 ) {  // if distance < .4
      var n = dif.normalized();
      var d = p.vel;
      p.vel = d.minus(n.scale(2 * d.dot(n)));
    }
  };

  context.rootMarker = {};
  context.rootMarker.vertices = createSphere(8,4);
  context.rootMarker = context.prepObject(context.rootMarker, 'fs_phong');

  context.emitterMarker = {};
  context.emitterMarker.vertices = createSphere(8,4);
  context.emitterMarker = context.prepObject(context.emitterMarker, 'fs_phong');

  context.attractorMarker = {};
  context.attractorMarker.vertices = createSphere(8,4);
  context.attractorMarker = context.prepObject(context.attractorMarker, 'fs_phong');

  //=========== WORLD DISPLAY =======================
  var world = {};
  world.display = function () {
    mstack.push();

      context.particleSystem.display();

      // draw emitters
      context.particleSystem.emitters.foreach(function (e) {
        mstack.push();
          mstack.apply(MSScale(.02,.02,.02).then(MSTranslatev(e.loc)));
          context.emitterMarker.matrix = mstack.top().arr();
          setUniforms(context.emitterMarker, makeMetallic([.1, .1, 0, 1]));
          drawObject(gl, context.emitterMarker);
        mstack.pop();
      });

      // draw attractors
      context.particleSystem.attractors.foreach(function (a) {
        mstack.push();
          mstack.apply(MSScale(.02,.02,.02).then(MSTranslatev(a.loc)));
          context.attractorMarker.matrix = mstack.top().arr();
          setUniforms(context.attractorMarker, makeMetallic([.1, .0, .0, 1]));
          drawObject(gl, context.attractorMarker);
        mstack.pop();
      });

      // draw root (ground)
      mstack.apply(MSScale(2,.1,2).then(MSTranslate(0,-1,0)));
      context.rootMarker.matrix = mstack.top().arr();
      setUniforms(context.rootMarker, makeMetallic([.005, .005, .005, 1]));
      drawObject(gl, context.rootMarker);
    mstack.pop();
  }
  //=================================================

  this.ACTIVE_OBJECTS = new List(world, NIL);
}

function isDead (p) { return p.isDead(); }
function isAlive (p) { return !p.isDead(); }

CanvasParticles.update = function () {
  var CANVAS = this;

  MOUSE_PRESSED = CANVAS.mousePressed;
  var DELTA_TIME = time - LAST_TIME;
  /////////////////////////////////

  this.attractor2.str = MOUSE_PRESSED ? -1 : 1;
  this.attractor2.loc = new vec3(
    (this.mouseX / this.getAttribute('width') - .5) * 2 || 0,
    (-this.mouseY / this.getAttribute('height') + .5) * 2 || 0,
    0);

  this.emitter1.loc = new vec3(.3, 0, 0);
  this.emitter2.loc = new vec3(-.3, .3, 0);

  this.emitter1.dir = new vec3(-1, 0, 2).normalized().scale(.5);
  this.emitter2.dir = new vec3(0, -1, -2).normalized().scale(.5);

  this.coloring1.update(DELTA_TIME);
  this.coloring2.update(DELTA_TIME);

  if( Math.random() <= probEmission(DELTA_TIME) / 2 )
    this.emitter1.emit();
  if( Math.random() <= probEmission(DELTA_TIME) / 2 )
    this.emitter2.emit();

  this.particleSystem.update(DELTA_TIME);

  /////////////////////////////////
  LAST_TIME = time;
}
