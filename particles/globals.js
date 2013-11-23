var NORTH = 1, EAST = 2, SOUTH = 3, WEST = 4;
var LEFT = WEST, RIGHT = EAST;

var ORIGIN = new vec3(0,0,0);
var AXIS_X = new vec3(1,0,0);
var AXIS_Y = new vec3(0,1,0);
var AXIS_Z = new vec3(0,0,1);

function makeMetallic(color) {
  var r = color[0], g = color[1], b = color[2];
  var d = 1, p = 10;
  var alpha = color.length > 3 ? color[3] : 1;
  return [r,g,b, r*d,g*d,b*d, r*p,g*p,b*p,  20, alpha];
}

function setUniforms(obj, colors) {
  colors = colors || [.1,.0,0, .9,.0,0, 1,1,1,20, 1];
  obj.setUniform('p', colors);
  obj.setUniform('lDir', [.57,.57,.57]);
}
