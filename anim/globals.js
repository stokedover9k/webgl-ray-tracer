var NORTH = 1, EAST = 2, SOUTH = 3, WEST = 4;
var LEFT = WEST, RIGHT = EAST;

function makeMetallic(color) {
  var r = color[0], g = color[1], b = color[2];
  var d = 1, p = 10;
  return [r,g,b, r*d,g*d,b*d, r*p,g*p,b*p,  20];
}

function setUniforms(obj, colors) {
  colors = colors || [.1,.0,0, .9,.0,0, 1,1,1,20];
  obj.setUniform('p', colors);
  obj.setUniform('lDir', [.57,.57,.57]);
}

// a marker for the world's origin
// @arg moveWorld is a function () -> MSTransform
function rootOfAllEvil (context, scale, moveWorld) {
  scale = scale || 1
  return new Segment(
    context.addObject(createSphere(8,4), 'fs_phong'),
    function () {
      this.modelT = MSScale(.2,.2,.2);
      this.worldT = MSScale(scale,scale,scale).then(moveWorld());
      setUniforms(this.obj, makeMetallic([.2,.2,.2]));
    });
}
