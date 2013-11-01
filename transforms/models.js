// CREATE A CUBE GEOMETRY:

   function createCube() {
      var vertices = [];

      function addFace(c, a, b) {
         var x = c[0], y = c[1], z = c[2];
         var A = a[0], B = a[1], C = a[2];
         var D = b[0], E = b[1], F = b[2];

         // EACH VERTEX IS: x,y,z, nx,ny,nz, u,v

         vertices.push(x-A-D, y-B-E, z-C-F, x,y,z, 0,0);
         vertices.push(x+A-D, y+B-E, z+C-F, x,y,z, 1,0);
         vertices.push(x+A+D, y+B+E, z+C+F, x,y,z, 1,1);
         vertices.push(x-A+D, y-B+E, z-C+F, x,y,z, 0,1);
         vertices.push(x-A-D, y-B-E, z-C-F, x,y,z, 0,0);
      }

      var xn = [-1,0,0], yn = [0,-1,0], zn = [0,0,-1];
      var xp = [ 1,0,0], yp = [0, 1,0], zp = [0,0, 1];

      addFace(xn, yn, zn);
      addFace(xp, yp, zp);
      addFace(yn, zn, xn);
      addFace(yp, zp, xp);
      addFace(zn, xn, yn);
      addFace(zp, xp, yp);

      return vertices;
   }

// @arg zPos is the position of the circle on the z coordinates
// @arg zNormalDir should be 1 or -1 and is the direction of the normal (positive z or negative z)
function createCircleWithZ(steps, zPos, zNormalDir) {
  var vertices = [];

  function addVertex(ang) {
    var s = Math.sin(ang);    var c = Math.cos(ang);
    vertices.push(c, s, zPos,   0,0,zNormalDir,  (zNormalDir * c/2+0.5),(s/2+0.5));
  }

  // draw this in triangles adding vertices in both directions of the 0-angle
  // so that no vertices need to be repeated (GL uses last 2 vertices to
  // complete the triangles).
  addVertex(0);
  for (var i = 0; i < steps/2; i++) {
    addVertex(  Math.PI * 2 / steps * i);
    addVertex(- Math.PI * 2 / steps * i);
  }
  if( steps % 2 == 0 )
    addVertex(Math.PI);

  return vertices;
}

function createCircle(steps) {
  return createCircleWithZ(steps, 0, 1);
}

function createTube(steps) {

  var vertices = [];

  function addFace (ang1, ang2) {
    var s1 = Math.sin(ang1);    var c1 = Math.cos(ang1);    var s2 = Math.sin(ang2);    var c2 = Math.cos(ang2);
    vertices.push(c1, s1, 1,   c1, s1, 0,   ang1/Math.PI/2, 0);
    vertices.push(c1, s1,-1,   c1, s1, 0,   ang1/Math.PI/2, 1);
    vertices.push(c2, s2,-1,   c2, s2, 0,   ang2/Math.PI/2, 1);
    vertices.push(c2, s2, 1,   c2, s2, 0,   ang2/Math.PI/2, 0);
    vertices.push(c1, s1, 1,   c1, s1, 0,   ang1/Math.PI/2, 0);
  }

  for( var i = 0; i < steps; i++ ) {
    var a1 = Math.PI * 2 / steps * i;
    var a2 = Math.PI * 2 / steps * (i + 1);
    addFace(a1, a2);
  }

  return vertices;
}

function createCylinder(steps) {
  var vertices = createTube(steps);

  vertices = vertices.concat(createCircleWithZ(steps, 1, 1));
  vertices = vertices.concat(createCircleWithZ(steps, -1, -1));

  return vertices;
}

// Near and far in the argument names indicates near and far planes (which are parallel).
// ARGUMENTS: near-left, near-right, near-top, near-bottom,   far-left, far-right, far-top, far-bottom
function SquareFrustum(nleft, nright, ntop, nbot)
{
  var nlbot = new vec3(nleft, nbot, 1);
  var nltop = new vec3(nleft, ntop, 1);
  var nrtop = new vec3(nrigth, ntop, 1);
  var nrbot = new vec3(nright, nbot, 1);
  var flbot = new vec3(fleft, nbot, -1);
  var fltop = new vec3(fleft, ntop, -1);
  var frtop = new vec3(frigth, ntop, -1);
  var frbot = new vec3(fright, nbot, -1);

  var topNormal = frtop.minus(nrtop).cross(new vec3(-1, 0, 0)).normalized();
  var botNormal = flbot.minus(nlbot).cross(new vec3( 1, 0, 0)).normalized();
  var leftNormal = fltop.minus(nltop).cross(new vec3(0, -1, 0)).normalized();
  var rightNormal = frbot.minus(nrbot).cross(new vec3(0, 1, 0)).normalized();
  var nearNormal = new vec3(0, 0, 1);
  var farNormal = new vec3(0, 0, -1);
  
  var vertices = [];
  function addVertex(p, n, u, v) {  vertices.push(p.x(), p.y(), p.z(),   n.x(), n.y(), n.z(),   u, v);  }

  addVertex(fltop, leftNormal, 0, 1);
  addVertex(nltop, leftNormal, 1, 1);
  addVertex(flbot, leftNormal, 0, 0);
  addVertex(nlbot, leftNormal, 1, 0);
}
