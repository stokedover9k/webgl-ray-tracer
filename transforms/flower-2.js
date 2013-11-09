function createConePart(steps, topWidthRatio, arc) {

  arc = arc || 2 * Math.PI;

  var vertices = [];

  var r1 = 1;  var r2 = topWidthRatio;

  var up = new vec3(0,1,0);

  function addSide(ang) {
    var s = Math.sin(ang);  var c = Math.cos(ang);

    var bot = new vec3(r1*c, -1, r1*s);
    var top = new vec3(r2*c,  1, r2*s);

    var tangent = bot.cross(up);
    var diff = bot.minus(top);
    var normal = tangent.cross(diff).normalized();

    vertices.push(top.x(),top.y(),top.z(),  normal.x(),normal.y(),normal.z(),  0,0);
    vertices.push(bot.x(),bot.y(),bot.z(),  normal.x(),normal.y(),normal.z(),  0,0);
  }

  var stepArc = arc / (steps-1);
  for (var i = 0; i < steps; i++) {
    addSide(stepArc * i);
  }

  return vertices;
}

canvas3.setup = function() {

  var context = this;

  function tiltX(t, depth) {
    depth = depth || 0;
    return Math.sin(t * 2) / 3 * Math.exp(depth/5);
  }
  function tiltY(t, depth) {
    depth = depth || 0;
    return Math.sin(t * 5) / 5 * Math.exp(depth/5);
  }

  function setUniforms(obj, colors) {
    colors = colors || [.1,.0,0, .9,.0,0, 1,1,1,20];
    obj.setUniform('p', colors);
    obj.setUniform('lDir', [.57,.57,.57]);
  }

  function scaleFactor(depth) { return Math.pow(1.2, 1); }

  function makeJoint(depth) { return createSphere(16, 8); }

  function makeTube(depth) { return createConePart(8, scaleFactor(depth), Math.PI * 2/3); }

  var rootSeg = new Segment(
    this.addObject(makeJoint(0), 'fs_phong'),
    function () {
      this.worldT = MSScale(.1,.1,.1)
        .then(MSRotateY(time))
        .then(MSTranslate(0,-.8,0))
        ;

      this.modelT = MSIdentity();

      setUniforms(this.obj);
    });

  function childJoint(depth) {
    return new Segment(
      context.addObject(makeJoint(depth), 'fs_phong'),   // object
      function () {                                      // animation function
        var s = scaleFactor(depth);
        this.worldT = MSIdentity()
          .then(MSRotateX(tiltX(time-1, depth)))
          .then(MSRotateZ(tiltY(time-0.5), depth));

        this.modelT = MSIdentity().then(MSScale(1,1/2,1));

        this.anchorT = MSTranslate(0,2,0).then(MSScale(s,s,s));

        setUniforms(this.obj);
      });
  }

  function childTube(depth) {
    var s = scaleFactor(depth);

    return new Segment(
      context.addObject(makeTube(depth), 'fs_phong'),
      function () {

        this.worldT = MSTranslate(0,-1,0);
        this.modelT = MSScale(1/s,1,1/s);

        setUniforms(this.obj);
      });
  }

  function childStem(depth) {
    var s = scaleFactor(depth);

    return new Segment(
      context.addObject(createCube(), 'fs_phong'),
      function () {
        
        this.worldT = MSTranslate(0,-1,0);
        this.modelT = MSScale(.1, 1, .1);

        setUniforms(this.obj, [.05,.3,.05, .9,.0,0, 1,1,1,20]);
      });
  }

  function addChildren(root, maxDepth, currentDepth) {
    currentDepth = currentDepth || 0;
    if (currentDepth >= maxDepth) return;

    var child = childJoint(currentDepth);
    
    root.addChild(child);
    root.addChild(childTube(currentDepth));
    root.addChild(childStem(currentDepth));

    addChildren(child, maxDepth, currentDepth+1);
  }

  addChildren(rootSeg, 5);

  this.rootSeg = rootSeg;
}

canvas3.update = function() {
  this.rootSeg.animateAll();
}
