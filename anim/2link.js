var time = 0;

function setUniforms(obj, colors) {
  colors = colors || [.1,.0,0, .9,.0,0, 1,1,1,20];
  obj.setUniform('p', colors);
  obj.setUniform('lDir', [.57,.57,.57]);
}

function fingerObjFactory() {
  return createConePart(8, 1.5, Math.PI * 1.5);
}

// Several smooth curves.
// Input t is expected to be between 0 and 1.
var Curves = function() {

  this.UP = function (t) { return (3*t*t - 2*t*t*t); };

  this.UP_AND_DOWN = function (t) {
    t = t * 2 - 1;
    if( t < 0 ) t = -t;
    return this.UP(t);
  };

  return this;
}();

function GrippingMotion(context) {
  var L = 3;
  var curve = Curves.UP_AND_DOWN;
  var ang = curve((time % L)/L);

  return MSRotateX(ang);
}

function createFinger(context, worldOffset) {

  function fingerPart(worldOffset) {
    worldOffset = worldOffset || MSIdentity();

    var finger = new Segment(
      context.addObject(fingerObjFactory(), 'fs_phong'),
      function() {
        this.modelT = MSScale(.3,1,.3);
        this.worldT = worldOffset.then(MSTranslate(0,1,0)).then(GrippingMotion(context));
        this.anchorT = MSTranslate(0,1,0);
        setUniforms(this.obj);
      });

    // add joint sphere
    finger.addChild( new Segment(
      context.addObject(createSphere(8,4), 'fs_phong'),
      function () {
        this.modelT = MSScale(.5,.3,.5);

        setUniforms(this.obj);
      }));

    return finger;
  }

  var root = fingerPart(worldOffset);

  root.addChild(fingerPart()).addChild(fingerPart());

  return root;
}



function createHand (context, root, worldTransform) {

  worldTransform = worldTransform || MSIdentity();
  
  var THUMB = 0;

  function rot (i) {
    if( i == THUMB || i == 4 ) return -Math.PI / 5 * (i-2);
    return -Math.PI / 6 * (i-2);
  }

  function transX (i) {
    return i - 2;
  }

  function transY (i) {
    if( i == THUMB || i == 4) return -1;
    return 0;
  }

  function sc (i) {
    return Math.exp( -Math.abs((i-2)/5) );
  }

  for (var i = 0; i < 5; i++) {
    var trans = MSIdentity()
      .then(MSRotateZ(rot(i)))
      .then(MSTranslate(transX(i),transY(i),0))
      .then(MSScale(sc(i), sc(i), sc(i)))
      .then(worldTransform)
      ;
    root.addChild( createFinger(context, trans) );
  };
}

function makeSmoothCurve(length) {
  return function smoothCurve (t) {
    var l = length;
    var t = (time % l)/l * 2 - 1;
    if( t < 0 ) t = -t;
    return 3*t*t - 2*t*t*t;
  }
}

function addActor (context, root) {

  var curve = makeSmoothCurve(2);
  var gripCurve = makeSmoothCurve(3);

  function Df () {return new vec3(0,1,0);};  // elbow direction
  function Cf () {                           // palm/target location
    var v = curve(time);
    return new vec3(2 * v * Math.cos(time), .5 + Math.sin(1.5 * time), Math.sin(time));
  }
  function Sf () {return new vec3(0,0,0);};  // shoulder location
  function Af () {return 1;}
  function Bf () {return 1.3;}

  function compute () {
    var D = Df(),   C = Cf(),   a = Af(),   b = Bf();
    var c = C.dot(C);
    var x = ((a*a-b*b)/c + 1)/2;
    D = D.minus(C.scale(C.dot(D)/c));
    var y = Math.sqrt(Math.max(0, a*a - x*x*c)/D.dot(D));
    D = C.scale(x).plus(D.scale(y));
    return D;
  }

  function makeBall (funcWorldT, colors, funcModelT) {
    colors = colors || [.1,0,0];
    funcModelT = funcModelT || function () { return MSScale(.2,.2,.2); }
    return new Segment(
      context.addObject(createSphere(8,4), 'fs_phong'),
      function () {
        this.modelT = funcModelT();
        this.worldT = funcWorldT();
        setUniforms(this.obj, makeMetallic(colors));
      });
  }

  // floating orb
  var b1 = makeBall(function () {
    var v = Cf().arr();    // compute point C (destination)
    return MSTranslate(v[0], v[1], v[2]);
  }, [.5,.5,.1], function () {
    return MSScale(.3,.3,.3);
  });

  // elbow
  var b2 = makeBall(function () {
    var v = compute().arr();  // compute elbow position
    return MSTranslate(v[0], v[1], v[2]);
  });

  function makeTube (funcWorldT, funcModelT, funcAnchorT) {
    funcModelT = funcModelT || function () {return MSScale(.1, 1, .1);};
    funcAnchorT = funcAnchorT || function () {return MSIdentity();};
    return new Segment(
      context.addObject(createConePart(6, .7, Math.PI * 2), 'fs_phong'),
      function () {
        this.modelT = funcModelT();
        this.worldT = funcWorldT();
        this.anchorT = funcAnchorT();
        setUniforms(this.obj, makeMetallic([.1,.1,.0]));
      });
  }

  // upper arm
  var a1 = makeTube (function () {
    var s = Sf();
    var d = compute();  // elbow
    var up = new vec3(0,1,0);
    var dir = d.minus(s).normalized();
    var axis = up.cross(dir).normalized();
    var ang = Math.acos(up.dot(dir));

    return MSIdentity()
      .then(MSTranslate(0,Af()/2,0))
      .then(MSRotateAxis(axis.x(), axis.y(), axis.z(), ang))
      ;
  }, function () {
    return MSScale(.1, Af()/2, .1);
  }, function () {
    return MSTranslate(0,Af()/2,0);
  });

  // lower arm
  var a2 = makeTube(function () {
    var s = compute();
    var d = Cf();
    var up = s.normalized();
    var dir = d.minus(s).normalized();
    var dot = up.dot(dir);

    var axis = up.cross(dir).normalized();
    var ang = Math.acos(up.dot(dir));
    var rotation = MSIdentity()
      .then(MSRotateX(-Math.PI/6))
      .then(MSRotateAxis(axis.x(), axis.y(), axis.z(), ang))
      ;

    return MSIdentity()
      .then(MSTranslate(0,Bf()/2,0))
      .then(rotation)
      ;
  }, function () {
    return MSScale(.1, Bf()/2, .1);
  }, function () {
    return MSIdentity()
      .then(MSScale(.3,.3,.3))
      .then(MSRotateY(Math.pow(1-gripCurve(time), .5) * Math.sin(5 * time)))
      .then(MSTranslate(0,Bf()/2,0));
  });

  root.addChild(b1);
  root.addChild(b2);
  root.addChild(a1);
  a1.addChild(a2);
  a2.addChild(makeBall(function () {return MSScale(4,4,3);}));
  createHand(context, a2, MSTranslate(0,0,0));
}

twolinkCanvas.setup = function () {
  this.root = rootOfAllEvil(this, .3, function(){return MSRotateY(time / 2)});

  addActor(this, this.root);
}

twolinkCanvas.update = function () {
  this.root.animateAll();
}
