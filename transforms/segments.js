var mmm = new MatrixStack();

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

// adds object to children list and returns child
Segment.prototype.addChild = function(child) { this.children.push(child);  return child; };

// Animate this segment, then animate its children relative to this.
Segment.prototype.animateAll = function() {

  this.animate();

  mmm.push();
    mmm.apply(this.worldT);
    mmm.push();
      mmm.apply(this.modelT);
      this.obj.matrix = mmm.top().arr();
    mmm.pop();

    mmm.apply(this.anchorT);
    for (var i = 0; i < this.children.length; i++)
      this.children[i].animateAll();

  mmm.pop();
};
