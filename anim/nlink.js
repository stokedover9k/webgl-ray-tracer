var origin4 = new vec4(0,0,0,1);
var AXIS_X = new vec4(1,0,0,0);
var AXIS_Y = new vec4(0,1,0,0);
var AXIS_Z = new vec4(0,0,1,0);

function funcTransformIdentity() { return MSIdentity(); }

function makeAnimation (funcWorldT, funcModelT, funcAnchorT, colors) {
  funcWorldT = funcWorldT || funcTransformIdentity;
  funcModelT = funcModelT || funcTransformIdentity;
  funcAnchorT = funcAnchorT || funcTransformIdentity;
  colors = colors || [.1,0,0];

  return function () {
    this.modelT = funcModelT();
    this.worldT = funcWorldT();
    this.anchorT = funcAnchorT();
    setUniforms(this.obj, makeMetallic(colors));
  };
}

function ballFactory() { return createSphere(8,4); }
function tubeFactory() { return createConePart(6, .7, Math.PI * 2); }

function segmentFactory (context, objectFactory, funcWorldT, funcModelT, funcAnchorT, colors) {
  return new Segment(
    context.addObject(objectFactory(), 'fs_phong'),
    makeAnimation(funcWorldT, funcModelT, funcAnchorT, colors));
}

function makeBall (context, funcWorldT, funcModelT, funcAnchorT, colors) {
  return segmentFactory(context, ballFactory, funcWorldT, funcModelT, funcAnchorT, colors);
}

function makeTube (context, funcWorldT, funcModelT, funcAnchorT, colors) {
  return segmentFactory(context, tubeFactory, funcWorldT, funcModelT, funcAnchorT, colors);
}

function ballSegFactory(colors) {
  return function(context, funcWorldT, funcModelT, funcAnchorT) {
    return makeBall(context, funcWorldT, funcModelT, funcAnchorT, colors);
  }
}

function tubeSegFactory(colors) {
  return function(context, funcWorldT, funcModelT, funcAnchorT) {
    return makeTube(context, funcWorldT, funcModelT, funcAnchorT, colors);
  }
}

function Rotating (context, msRotationType, segFactory) {
  
  this.rotation = 0;

  this.axis = AXIS_Z;

  this.wtx = 0;  this.wty = 0;  this.wtz = 0;  //  world translations
  this.atx = 0;  this.aty = 0;  this.atz = 0;  // anchor translations
  this.msx = 1;  this.msy = 1;  this.msz = 1;  //  model scale

  var Waldo = this;

  this.segment = segFactory(context,
    function () {
      return MSIdentity()
        .then(MSTranslate(Waldo.wtx, Waldo.wty, Waldo.wtz))
        .then(msRotationType(Waldo.rotation));
    },
    function () {
      return MSScale(Waldo.msx,Waldo.msy,Waldo.msz);
    },
    function () {
      return MSTranslate(Waldo.atx, Waldo.aty, Waldo.atz);
    }
    );

  // cache the world transformation at this particular object
  this.worldT = mat4_identity();
  this.segment.cacheT = function (m) {
    Waldo.worldT = m;
  }
}

// Parent is either an instance of Rotating or of Segment
Rotating.prototype.childTo = function(parent) {
  if( parent.segment )
    parent.segment.addChild(this.segment);
  else
    parent.addChild(this.segment);
  return this;
};

// elbows rotate around Z
function Elbow (context) { 
  var ret = new Rotating(context, MSRotateZ, ballSegFactory([.1,0,0]));
  ret.axis = AXIS_Z;
  ret.msx = .2;  ret.msy = .2;  ret.msz = .2;
  return ret;
}

// arms rotate around the Y axis
function Arm (context) { 
  var ret = new Rotating(context, MSRotateY, tubeSegFactory([.1,.1,0]));
  ret.axis = AXIS_Y;
  ret.msx = .1;  ret.msy = .5;  ret.msz = .1;
  ret.wty = .5;  ret.aty = .5;
  return ret;
}

var focusCurve = makeSmoothCurve(3);

nlinkCanvas.setup = function () {

  var root = rootOfAllEvil(this, .3, function(){return MSTranslate(0,-.7,0).then(MSRotateY(time / 2))});

  var context = this;

  this.arms = [];
  this.elbows = [];

  function createArms (n, parent) {
    if( n <= 0 ) {
      // This will be the "head" or "end" of the arm which follows the target.
      // Alternatively, this is that the hand is grasping at.
      var elb = Elbow(context).childTo(parent);
      elb.wtz = .5;  elb.wty = .2;
      elb.msx = 0;  elb.msy = 0;  elb.msz = 0;   // scale it out of existence
      context.elbows.push(elb);

      createHand(context, parent.segment, MSIdentity()
        .then(MSTranslate(0,1,0))
        .then(MSRotateX(-1))
        .then(MSTranslate(0,-3,0))
        .then(MSScale(.3,.3,.3))
        );
      return;
    }
    var arm = Arm(context).childTo(parent);
    var elb = Elbow(context).childTo(arm);
    context.elbows.push(arm);
    context.elbows.push(elb);
    createArms(n-1, elb);
  };
  createArms(5, root);

  this.target = makeBall(this,
    function () { return MSTranslate(3 * Math.cos(time * 3), 2 + 3 * Math.sin(time), 3 * Math.sin(time * 3)); },
    function () { return MSScale(.2,.2,.2); },
    function () { return MSIdentity(); },
    [.2,.2,.7]);

  // cache target location
  this.locTarget = origin4;
  this.target.cacheT = function (m) { context.locTarget = m.timesRV(origin4); };

  root.addChild(this.target);

  this.root = root;
}

nlinkCanvas.update = function () {

  var N = this.elbows.length;

  var scale = this.mousePressed ? .2 : 0;
  var last = this.elbows[N - 1];
  last.msx = scale;  last.msy = scale;  last.msz = scale;

  var anglesIK = [];
  var anglesFK = [];

  for (var n = 0; n < N-2; n++) {
    
    var elb = this.elbows[n];
    var end = this.elbows[N-1];
    var trg = this.target;

    var locElb = elb.worldT.timesRV(origin4);
    var locEnd = end.worldT.timesRV(origin4);
    var locTrg = this.locTarget.minus(new vec4(0,0,0,0));

    var relElb = origin4;
    var relEnd = locEnd.minus(locElb);
    var relTrg = locTrg.minus(locElb);

    var axisElb = elb.worldT.timesRV(elb.axis).normalized();

    // compute locations (relative to elbow) of end and target projected
    // onto the plane perpendicular to elbow rotation axis

    var d = axisElb.dot(relEnd.dir4());
    var flatEnd = relEnd.minus(axisElb.scale(d));

    var d = axisElb.dot(relTrg.dir4());
    var flatTrg = relTrg.minus(axisElb.scale(d));

    relEnd = flatEnd.dir4();
    relTrg = flatTrg.dir4();

    var sign = relEnd.cross(relTrg).dot(axisElb) > 0 ? 1 : -1;
    var ang = sign * Math.acos(relEnd.dot(relTrg)) / (N-2) * (.2 + .7 * focusCurve(time));

    anglesIK.push( elb.rotation + (ang || 0) );
    anglesFK.push( Math.cos(time)/2 );
  }

  var w = Math.sin(time / 2);
  var pi2 = 2 * Math.PI;

  for (var n = 0; n < N-2; n++) {
    this.elbows[n].rotation = w * (anglesIK[n] % pi2) + (1-w) * (anglesFK[n] % pi2);
  }

  this.root.animateAll();
}
