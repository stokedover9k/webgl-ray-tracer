
mmm = new MatrixStack();

// Segment of a complex object in the world.
// Each segment is animated with the @arg animate which is called during the
// animateAll() tree traversal before the the transformations are computed.
// This function is meant to set this.anchorT, this.modelT, and this.worldT
// transformations (of type MSTransform).
function Segment(obj, animate) {
  this.anchorT = MSIdentity();
  this.modelT  = MSIdentity();
  this.worldT  = MSIdentity();

  this.animate = animate;
  this.obj = obj;
  this.children = [];
}

Segment.prototype.addChild = function(child) { this.children.push(child); };

// Animate this segment, then animate its children relative to this.
Segment.prototype.animateAll = function() {

  this.animate();

  mmm.push();
    mmm.apply(this.worldT);
    mmm.push();
      mmm.apply(this.modelT);
      mmm.apply(this.anchorT);
      this.obj.matrix = mmm.top().arr();
    mmm.pop();

    for (var i = 0; i < this.children.length; i++)
      this.children[i].animateAll();

  mmm.pop();
};

canvas1.setup = function() {

  var segFactory = function () { return createCircle(8); }

  function scaleFactor(index) { return Math.pow(1.3, index); }

  function tiltX(t) { return Math.sin(t * 2) / 3; }
  function tiltY(t) { return Math.sin(t * 5) / 5; }

  var rootSeg = new Segment(
    this.addObject(segFactory(), 'fs_phong'),
    function ()
    {
      this.worldT = MSIdentity()
        .then(MSRotateX(tiltX(time)))
        .then(MSRotateZ(tiltY(time)))
        .then(MSRotateY(time))
        .then(MSTranslate(0,-0.7,0))
        ;

      this.modelT = MSRotateX(-Math.PI/2).then(MSScale(.05,.05,.05));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    });

  var parent = this;

  function addChildren(root, maxDepth, depth) {
    depth = depth || 0;
    if( depth >= maxDepth )
      return;
    var s = scaleFactor(depth) * 0.05;
    var newCircle = new Segment(
      parent.addObject(segFactory(), 'fs_phong'),  // object
      function () {                                // animation function
        this.worldT = 
          MSTranslate(0,0.2,0)
          .then(MSRotateX(tiltX(time-1)))
          .then(MSRotateZ(tiltY(time-0.5)));
        this.modelT = MSRotateX(-Math.PI/2).then(MSScale(s,s,s));

        this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
        this.obj.setUniform('lDir', [.57,.57,.57]);
      });

    root.addChild(newCircle);

    var newStem = new Segment(
      parent.addObject(createCube(), 'fs_phong'),   // object
      function () {                                 // animation function
        this.worldT = 
          MSTranslate(0,0.2,0)
          .then(MSRotateX(tiltX(time-1)))
          .then(MSRotateZ(tiltY(time-0.5)));
        this.modelT = (MSScale(s/10,0.1,s/10)).then(MSTranslate(0,-0.1,0));

        this.obj.setUniform('p', [.1,.2,0, .9,.0,0, 1,1,1,20]);
        this.obj.setUniform('lDir', [.57,.57,.57]);
      });

    root.addChild(newStem);

    addChildren(newCircle, maxDepth, depth+1);
  }

  addChildren(rootSeg, 5, 0);

  this.rootSeg = rootSeg;
}

var debug = true;
canvas1.update = function() {
  this.rootSeg.animateAll();
}
