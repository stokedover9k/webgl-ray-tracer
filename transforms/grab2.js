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

function makeJoint (context) {
  return new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.3,.3,.3);
      setUniforms(this.obj);
    });
}

canvasArm.setup = function () {
  this.root = rootOfAllEvil(this, .2);

  var upperArm = this.root.addChild( makeUpperArm(this) );
  upperArm.addChild(makeJoint(this));

  var forearm = upperArm.addChild( makeForearm(this) );
  forearm.addChild(makeJoint(this));

  createHand(this, forearm, MSScale(.7,.7,.7));
}

canvasArm.update = function () {
  this.root.animateAll();
}
