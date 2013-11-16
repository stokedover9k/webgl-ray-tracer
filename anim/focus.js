var _preyMatrix = null;

function addPrey(context, root) {
  root.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.1,.1,.1);
      this.worldT = MSTranslate(5 * Math.cos(time * 2),2 * Math.sin(time / 3.5),5 * Math.sin(time * 2));
      this.cacheT = function (m) { _preyMatrix = m; }
      setUniforms(this.obj, makeMetallic([.1,.1,0]));
    }));
}

function MSTurnAndTiltX(strength, myDir, focusDir) {
  // compute rotation on the horizontal (x-z) plane
  var my1 = new vec3(myDir.x(), 0, myDir.z()).normalized();
  var pr1 = new vec3(focusDir.x(), 0, focusDir.z()).normalized();
  var ang = Math.acos(my1.dot(pr1));
  var crs = my1.cross(pr1).y();
  if( crs < 0 ) ang = Math.PI * 2 -ang;

  // add vertical tilt to horizontal rotation
  return MSRotateX(-Math.asin(focusDir.y()) * strength).then(MSRotateY(ang * strength));
}

function TurnHead (strength) {
  return MSRotateY(strength * (time % (Math.PI*2)));
}

function addHead(context, root) {
  var headRoot = new Segment( [],
    function () {
      this.worldT = MSTranslate(0,2,0);

      var preyLoc = _preyMatrix.timesRV(new vec4(0,0,0,1));
      var myLoc = this.worldT.transform(mmm.top()).timesRV(new vec4(0,0,0,1));
      var myDir = this.worldT.transform(mmm.top()).timesRV(new vec4(0,0,1,0)).normalized();
      var preyDir = preyLoc.minus(myLoc).normalized();

      var s1 = Math.sin(time)/2 + .5;
      var preyFocus = MSTurnAndTiltX(s1, myDir, preyDir);
      var turnHead = TurnHead(1-s1)

      this.worldT = preyFocus.then(turnHead).then(this.worldT);
    });

  root.addChild(headRoot);

  // head center
  headRoot.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.1,.1,.1);
      setUniforms(this.obj, makeMetallic([.1,0,0]));
    }));
  // nose
  headRoot.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.1,.1,.1);
      this.worldT = MSTranslate(0,0,1);
      setUniforms(this.obj, makeMetallic([.1,0,0]));
    }));
  // left eye
  headRoot.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.1,.1,.1);
      this.worldT = MSTranslate(.7,.5,0);
      setUniforms(this.obj, makeMetallic([.1,0,0]));
    }));
  // right eye
  headRoot.addChild( new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.1,.1,.1);
      this.worldT = MSTranslate(-.7,.5,0);
      setUniforms(this.obj, makeMetallic([.1,0,0]));
    }));
  // mouth
  headRoot.addChild( new Segment(
    context.addObject(createCube(), 'fs_phong'),
    function () {
      this.modelT = MSScale(1,.2,.2);
      this.worldT = MSTranslate(0,-.5,0);
      setUniforms(this.obj, makeMetallic([.1,0,0]));
    }));
}

focusCanvas.setup = function () {
  this.root = rootOfAllEvil(this, .2, function(){return MSRotateY(0)});

  addPrey(this, this.root);
  addHead(this, this.root);
}

focusCanvas.update = function () {
  this.root.animateAll();
}
