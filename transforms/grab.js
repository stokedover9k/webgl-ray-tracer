var TIME = 0;

function setUniforms(obj, colors) {
  colors = colors || [.1,.0,0, .9,.0,0, 1,1,1,20];
  obj.setUniform('p', colors);
  obj.setUniform('lDir', [.57,.57,.57]);
}

function fingerObjFactory() {
  return createConePart(8, 1.2, Math.PI * 1.5);

}

function rootOfAllEvil (context) {
  return new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.5,.5,.5);
      this.worldT = MSScale(.2,.2,.2).then(MSTranslate(0,-.5,0)).then(MSRotateY(TIME));
      setUniforms(this.obj, [.1,.1,.1, .9,.0,0, 1,1,1,20]);
    });
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

function GrippingMotion() {
  var L = 3;
  var curve = Curves.UP_AND_DOWN;
  var ang = curve((TIME % L)/L);

  return MSRotateX(ang);
}

function createFinger(context, worldOffset) {

  function fingerPart(worldOffset) {
    worldOffset = worldOffset || MSIdentity();

    var finger = new Segment(
      context.addObject(fingerObjFactory(), 'fs_phong'),
      function() {
        this.modelT = MSScale(.3,1,.3);
        this.worldT = worldOffset.then(MSTranslate(0,1,0)).then(GrippingMotion());
        this.anchorT = MSTranslate(0,1,0);
        setUniforms(this.obj);
      });

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



canvasFinger.setup = function () {
  this.root = rootOfAllEvil(this);

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
    var worldTransform =
      MSRotateZ(rot(i))
      .then(MSTranslate(transX(i),transY(i),0))
      .then(MSScale(sc(i), sc(i), sc(i)));
    this.root.addChild( createFinger(this, worldTransform) );
  };


}

canvasFinger.update = function () {
  TIME = time;
  this.root.animateAll();
}
