function forearmBend(low, high, len) {
  len = len || 3
  var curve = Curves.UP_AND_DOWN;

  var width = high - low;

  var v = curve((TIME % len) / len);
  return Math.pow(v, 1) * width + low;
}

function makeUpperArm (context) {
  
  var upperArm = new Segment(
    context.addObject(createConePart(8, 0.7, Math.PI * 6/3), 'fs_phong'),
    function () {

      this.modelT = MSScale(.4,1,.4);
      this.anchorT = MSTranslate(0,1,0);
      this.worldT = MSTranslate(0,1,0).then(MSRotateY(forearmBend(0,1))).then(MSRotateX(Math.PI - forearmBend(1,2)));

      setUniforms(this.obj, [.1,.0,.05, .9,.0,0, 1,1,1,20]);
    });

  return upperArm;
}

function makeForearm (context) {
  
  var forearm = new Segment(
    context.addObject(createConePart(8, 0.7, Math.PI * 6/3), 'fs_phong'),
    function () {
      
      this.modelT = MSRotateZ(Math.PI).then(MSScale(.4,1,.4));
      this.worldT = MSTranslate(0,1,0).then(MSRotateX(forearmBend(-2,0)));
      this.anchorT = MSRotateY(forearmBend(0,1)).then(MSRotateX(-.7)).then(MSTranslate(0,1,0));

      setUniforms(this.obj, [.1,.0,.025, .9,.0,0, 1,1,1,20]);
    });

  return forearm;
}

function makeJoint (context, scale) {
  scale = scale || MSScale(.3,.3,.3);
  return new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = scale;
      setUniforms(this.obj);
    });
}

function createRat (context) {
  var rat = new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {

      this.modelT = MSScale(1,.5,1.5).then(MSTranslate(0,.5,0));
      this.worldT = MSTranslate(5,1,0).then(MSRotateY(forearmBend(0, 3) * .5 - 1)).then(MSScale(.5,.5,.5));
      
      setUniforms(this.obj, [.07,.07,.07, .9,.0,0, 1,1,1,20]);
    });

  rat.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(2,.1,.3);
      this.worldT = MSTranslate(2,0,-.5).then(MSRotateY(-1)).then(MSRotateZ(forearmBend(0,1) - .5)).then(MSTranslate(0,1,0));
      setUniforms(this.obj, [.07,.07,.07, .9,.0,0, 1,1,1,20]);
    }));

  rat.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(2,.1,.3);
      this.worldT = MSTranslate(-2,0,-.5).then(MSRotateY(1)).then(MSRotateZ(-(forearmBend(0,1) - .5))).then(MSTranslate(0,1,0));
      setUniforms(this.obj, [.07,.07,.07, .9,.0,0, 1,1,1,20]);
    }));

  return rat;
}

canvasArm.setup = function () {
  this.root = rootOfAllEvil(this, .2);

  var upperArm = this.root.addChild( makeUpperArm(this) );
  upperArm.addChild(makeJoint(this));

  var forearm = upperArm.addChild( makeForearm(this) );
  forearm.addChild(makeJoint(this, MSScale(.9,.7,.4)));

  createHand(this, forearm, MSScale(.7,.7,.7));

  this.root.addChild( createRat(this) );
}

canvasArm.update = function () {
  this.root.animateAll();
}
