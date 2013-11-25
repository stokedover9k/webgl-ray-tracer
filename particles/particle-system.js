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

CanvasParticles.setup = function () {

  var context = this;
  var gl = this.gl;

  this.particleSystem = new ParticleSystem(ORIGIN, 100, new ParticleFactory(gl, this).build);

  this.rootMarker = {};
  this.rootMarker.vertices = createSphere(8,4);
  this.rootMarker = this.prepObject(this.rootMarker, 'fs_phong');

  this.emitterMarker = {};
  this.emitterMarker.vertices = createSphere(8,4);
  this.emitterMarker = this.prepObject(this.emitterMarker, 'fs_phong');

  this.attractorMarker = {};
  this.attractorMarker.vertices = createSphere(8,4);
  this.attractorMarker = this.prepObject(this.attractorMarker, 'fs_phong');

  //=========== WORLD DISPLAY =======================
  var world = {};
  world.display = function () {
    mstack.push();

      mstack.apply(MSRotateY(context.mouseX / context.getAttribute('width') * 2 * Math.PI || 0));
      context.particleSystem.display();

      // draw emitter
      mstack.push();
        mstack.apply(MSScale(.02,.02,.02).then(MSTranslatev(context.particleSystem.emitterLoc)));
        context.emitterMarker.matrix = mstack.top().arr();
        setUniforms(context.emitterMarker, makeMetallic([.1, .1, 0, 1]));
        drawObject(gl, context.emitterMarker);
      mstack.pop();

      // draw attractor
      mstack.push();
        mstack.apply(MSScale(.02,.02,.02).then(MSTranslatev(context.particleSystem.attractor.loc)));
        context.attractorMarker.matrix = mstack.top().arr();
        setUniforms(context.attractorMarker, makeMetallic([.1, .0, .0, 1]));
        drawObject(gl, context.attractorMarker);
      mstack.pop();

      // draw root (ground)
      mstack.apply(MSScale(2,.1,2).then(MSTranslate(0,-.7,0)));
      context.rootMarker.matrix = mstack.top().arr();
      setUniforms(context.rootMarker, makeMetallic([.01, .005, .005, 1]));
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

  this.particleSystem.emitterLoc = new vec3(Math.sin(time) * .3, Math.cos(time*4) * .2, Math.sin((2 + time)*8) * .1);
  this.particleSystem.attractor.loc = new vec3(Math.sin(time), Math.sin(time/2) * .2, Math.cos(time/3));

  if( Math.random() <= probEmission(DELTA_TIME) )
    this.particleSystem.addParticle();

  this.particleSystem.update(DELTA_TIME);

  /////////////////////////////////
  LAST_TIME = time;
}
