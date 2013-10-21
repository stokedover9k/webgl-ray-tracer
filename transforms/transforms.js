
// GET THE CANVAS ELEMENT AND ITS DRAWING CONTEXT FROM THE DOCUMENT

var canvas = document.getElementById('exampleCanvas');
var context = canvas.getContext('2d');

// THE VERTICES OF A UNIT CUBE

var pts = [[-1,-1,-1],[ 1,-1,-1],[-1, 1,-1],[ 1, 1,-1],
	   [-1,-1, 1],[ 1,-1, 1],[-1, 1, 1],[ 1, 1, 1]];

// THE EDGES OF A UNIT CUBE (INDEXING INTO THE VERTICES)

var edges = [[0,1],[2,3],[4,5],[6,7],
	     [0,2],[1,3],[4,6],[5,7],
	     [0,4],[1,5],[2,6],[3,7]];

// YOUR FUNCTION THAT GETS CALLED EACH ANIMATION FRAME

function animate() {

  // GET THE DIMENSIONS OF THE CANVAS

  var w = canvas.width, h = canvas.height;

  // CLEAR THE ENTIRE CANVAS

  context.fillStyle = '#ffffff';
  context.beginPath();
  context.moveTo(0,0);
  context.lineTo(w,0);
  context.lineTo(w,h);
  context.lineTo(0,h);
  context.fill();

  // CREATE THE MATRIX TRANSFORM FOR THIS ANIMATION FRAME.

  ////////////////////////////////////////////////////////////

  // NOTE: THIS IS THE PART THAT YOU WILL BE REPLACING WITH
  // MORE GENERAL KINDS OF TRANSFORMATIONS.

  var x = Math.cos(time) / 2;
  var y = Math.sin(time) / 2;
  var matrix = Identity()
  .translate(Vec3(x, y, 0))
  .rotate(Vec3(time, time * 4/3, time * 5/3))
  .scale( Vec3(
    0.7 + 0.3 * Math.cos(3 * time),
    0.5 + 0.4 * Math.sin(2 * time),
    1) );

  ////////////////////////////////////////////////////////////

  // SET THE DRAWING COLOR TO BLACK

  context.strokeStyle = '#000000';

  // LOOP THROUGH THE EDGES OF THE CUBE

  for (var i = 0 ; i < edges.length ; i++) {

    // TRANSFORM THE EDGE'S TWO ENDPOINTS BY THE MATRIX

    var p00 = pts[edges[i][0]];    var p000 = Vec3(p00[0], p00[1], p00[2]);
    var p11 = pts[edges[i][1]];    var p111 = Vec3(p11[0], p11[1], p11[2]);

    var p0 = matrix.times_v(p000);
    var p1 = matrix.times_v(p111);

//    var p0 = transform(pts[edges[i][0]], matrix);
//    var p1 = transform(pts[edges[i][1]], matrix);

    // ADD DEPTH PERSPECTIVE

    var a = depthPerspective(p0.toArray());
    var b = depthPerspective(p1.toArray());

    // DRAW THE EDGE AS A 2D LINE ON THE CANVAS

    context.beginPath();
    context.moveTo(w/2 + w/4 * a[0], h/2 - w/4 * a[1]);
    context.lineTo(w/2 + w/4 * b[0], h/2 - w/4 * b[1]);
    context.stroke();
  }
}

// TRANSFORM A POINT BY A MATRIX

function transform(p, m) {
  return [ m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12],
	   m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13],
	   m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
}

function mat_mult(m1, m2) {
  // indices are hard-coded for efficiency
  return [
  m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2] + m1[12] * m2[3],
  m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2] + m1[13] * m2[3],
  m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2] + m1[14] * m2[3],
  m1[3] * m2[0] + m1[7] * m2[1] + m1[11] * m2[2] + m1[15] * m2[3],
  
  m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6] + m1[12] * m2[7],
  m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6] + m1[13] * m2[7],
  m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6] + m1[14] * m2[7],
  m1[3] * m2[4] + m1[7] * m2[5] + m1[11] * m2[6] + m1[15] * m2[7],
  
  m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10] + m1[12] * m2[11],
  m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10] + m1[13] * m2[11],
  m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10] + m1[14] * m2[11],
  m1[3] * m2[8] + m1[7] * m2[9] + m1[11] * m2[10] + m1[15] * m2[11],

  m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12] * m2[15],
  m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13] * m2[15],
  m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15],
  m1[3] * m2[12] + m1[7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15]
  ];
}

function Vec3(x, y, z) {
  var v = Object.create(null);
  v.x = x;  v.y = y;  v.z = z;
  v.v4 = function() { return Vec4(this.x, this.y, this.z, 1); }
  v.dir = function() { return Vec4(this.x, this.y, this.z, 0); }
  v.xyz = function() { return this; }
  v.toArray = function() { return [this.x, this.y, this.z]; }
  return v;
}

function Vec4(x, y, z, w) {
  var v = Object.create(null);
  v.x = x;  v.y = y;  v.z = z;  v.w = w;
  v.v4 = function() { return this; }
  v.dir = function() { return Vec4(this.x, this.y, this.z, 0); }
  v.xyz = function() { return Vec3(this.x, this.y, this.z); }
  v.toArray = function() { return [this.x, this.y, this.z, this.w]; }
  return v;
}

function Matrix(vals) {
  if( Object.prototype.toString.call( vals ) !== '[object Array]') {
    alert("non-array passed to Matrix constructor");
    console.log("[ERROR]: Matrix(vals) with vals = " + vals);
  }
  var m = Object.create(null);

  m.values = vals;

  m.times = function( m ) { return Matrix(mat_mult(this.values, m.values)); }

  m.times_v = function( vec ) {
    var p = vec.v4();
    return Vec4(
      this.values[0] * p.x + this.values[4] * p.y + this.values[ 8] * p.z + this.values[12] * p.w,
      this.values[1] * p.x + this.values[5] * p.y + this.values[ 9] * p.z + this.values[13] * p.w,
      this.values[2] * p.x + this.values[6] * p.y + this.values[10] * p.z + this.values[14] * p.w,
      this.values[3] * p.x + this.values[7] * p.y + this.values[11] * p.z + this.values[15] * p.w);
  }

  m.scale     = function( v ) { return this.times(Scale_v(v)); }
  m.translate = function( v ) { return this.times(Translation_v(v)); }
  m.rotate    = function( v ) { return this.times(Rotate_v(v)); }
  m.rotateX   = function( t ) { return this.times(RotateX(t)); }
  m.rotateY   = function( t ) { return this.times(RotateY(t)); }
  m.rotateZ   = function( t ) { return this.times(RotateZ(t)); }

  return m;
}

function Identity() {  return Matrix([ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]);  }

function Translation_v(vec) {  return Matrix([ 1,0,0,0, 0,1,0,0, 0,0,1,0, vec.x,vec.y,vec.z,1 ]);  }

function Scale_v(vec) {  return Matrix([ vec.x,0,0,0, 0,vec.y,0,0, 0,0,vec.z,0, 0,0,0,1 ]);  }

function RotateX(theta) {
  var s = Math.sin(theta);  var c = Math.cos(theta);
  return Matrix([ 1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1 ]);
}

function RotateY(theta) {
  var s = Math.sin(theta);  var c = Math.cos(theta);
  return Matrix([ c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1 ]);
}

function RotateZ(theta) {
  var s = Math.sin(theta);  var c = Math.cos(theta);
  return Matrix([ c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1 ]);
}

function Rotate_v(vec) {  return RotateX(vec.x).times(RotateY(vec.y)).times(RotateZ(vec.z));  }

// APPLY A SIMPLE DEPTH PERSPECTIVE TRANSFORM

var focalLength = 8.0;

function depthPerspective(p) {
  var pz = focalLength / (focalLength - p[2]);
  return [p[0] * pz, p[1] * pz, pz];
}

//--- BOILERPLATE CODE TO SUPPORT ANIMATED DRAWING ON AN HTML CANVAS ---

var startTime = (new Date()).getTime(), time = startTime;
window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60); };
})();

function tick() {
  time = ((new Date()).getTime() - startTime) / 1000;
  animate();
  requestAnimFrame(function() { tick(); });
}
tick();
