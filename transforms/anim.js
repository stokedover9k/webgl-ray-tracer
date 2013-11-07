
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
  var rootSeg = new Segment(
    this.addObject(createCube(), 'fs_phong'),   // object
    function ()                                 // animation function
    {
      this.anchorT = MSTranslate(0, -1, 0);
      this.modelT = MSScale(0.1, 0.5, 0.2)
      this.worldT = MSRotateZ(Math.sin(time * 2)).then(MSTranslate(0,1,0));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    });

  rootSeg.addChild(new Segment(
    this.addObject(createCube(), 'fs_phong'),   // object
    function () {                               // animation function
      this.anchorT = MSTranslate(0,-1,0);
      this.modelT  = MSScale(0.08,.3,0.08);
      this.worldT  = MSRotateZ(1 + 1 * Math.cos(Math.PI + time * 2)).then(MSTranslate(0,-1,0));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    }));

  rootSeg.addChild(new Segment(
    this.addObject(createCube(), 'fs_phong'),   // object
    function () {                               // animation function
      this.anchorT = MSTranslate(0,-1,0);
      this.modelT  = MSScale(0.08,.3,0.08);
      this.worldT  = MSRotateZ(0 + 1 * Math.cos(Math.PI + time * 2)).then(MSTranslate(0,-1,0));

      this.obj.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
      this.obj.setUniform('lDir', [.57,.57,.57]);
    }));

  this.rootSeg = rootSeg;
}

var debug = true;
canvas1.update = function() {

  this.rootSeg.animateAll();

}
