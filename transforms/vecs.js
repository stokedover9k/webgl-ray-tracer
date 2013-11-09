//////////////////////////////////////////////////
//                                              //
//                 CONTENTS                     //
//                                              //
// --- ~~~~~:   helpers (private)               //
// --- #vec3:   3-dimensional vectors           //
// --- #vec4:   4-dimensional vectors           //
// --- #mat4:   4x4 matrices                    //
//                                              //
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//  HELPERS

var _iX = 0, _iY = 1, _iZ = 2, _iW = 3;

function _mult_matrix_by_matrix(m1, m2) {
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

function _mult_matrix_by_vec3(m, p) {
  return [
    m[0]*p[0] + m[4]*p[1] + m[ 8]*p[2] + m[12],
    m[1]*p[0] + m[5]*p[1] + m[ 9]*p[2] + m[13],
    m[2]*p[0] + m[6]*p[1] + m[10]*p[2] + m[14]
  ];
}

function _mult_matrix_by_vec4(m, p) {
  return [
    m[0]*p[0] + m[4]*p[1] + m[ 8]*p[2] + m[12]*p[3],
    m[1]*p[0] + m[5]*p[1] + m[ 9]*p[2] + m[13]*p[3],
    m[2]*p[0] + m[6]*p[1] + m[10]*p[2] + m[14]*p[3],
    m[3]*p[0] + m[7]*p[1] + m[11]*p[2] + m[15]*p[3]
  ];
}

function _identity()     { return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]; }
function _translation(v) { return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, v[0],v[1],v[2],1 ]; }
function _scale(v)       { return [ v[_iX],0,0,0, 0,v[_iY],0,0, 0,0,v[_iZ],0, 0,0,0,1 ]; }

function _rotation_x(t)  {
  var s = Math.sin(t);  var c = Math.cos(t);
  return [ 1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1 ];
}

function _rotation_y(t) {
  var s = Math.sin(t);  var c = Math.cos(t);
  return [ c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1 ];
}

function _rotation_z(t) {
  var s = Math.sin(t);  var c = Math.cos(t);
  return [ c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1 ];
}

// END: HELPERS
//////////////////////////////////////////////////



//////////////////////////////////////////////////
//             #vec3
//////////////////////////////////////////////////

function vec3(X, Y, Z)     { this.coords = [X, Y, Z]; }

vec3.prototype.arr        = function()  { return this.coords; };
vec3.prototype.x          = function()  { return this.coords[_iX]; };
vec3.prototype.y          = function()  { return this.coords[_iY]; };
vec3.prototype.z          = function()  { return this.coords[_iZ]; };
vec3.prototype.xyz        = function()  { return this; };
vec3.prototype.length     = function()  { return Math.sqrt(this.x() * this.x() + this.y() * this.y() + this.z() * this.z()); };
vec3.prototype.normalized = function()  { var l = this.length();  return new vec3(this.x()/l, this.y()/l, this.z()/l ); };
vec3.prototype.loc4       = function()  { return this.toVec4(1); };
vec3.prototype.dir4       = function()  { return this.toVec4(0); };
vec3.prototype.toVec4     = function(w) { return new vec4(this.x(), this.y(), this.z(), w); };
vec3.prototype.dot        = function(v) { return new vec3(this.x() * v.x(), this.y() * v.y(), this.z() * v.z()); };
vec3.prototype.cross      = function(v) { return new vec3(this.y() * v.z() - this.z() * v.y(),   this.z() * v.x() - this.x() * v.z(),   this.x() * v.y() - this.y() * v.x() ); };
vec3.prototype.plus       = function(v) { return new vec3(this.x() + v.x(), this.y() + v.y(), this.z() + v.z()); };
vec3.prototype.minus      = function(v) { return new vec3(this.x() - v.x(), this.y() - v.y(), this.z() - v.z()); };

vec3.prototype.timesLM    = function(leftMatrix) {
  var v = _mult_matrix_by_vec3(leftMatrix.vals, this.coords);
  return new vec3(v[_iX], v[_iY], v[_iZ]);
};

//////////////////////////////////////////////////
//             #vec4
//////////////////////////////////////////////////

function vec4(X, Y, Z, W)  { this.coords = [X, Y, Z, W]; }

vec4.prototype.arr        = function()  { return this.coords; };
vec4.prototype.x          = function()  { return this.coords[_iX]; };
vec4.prototype.y          = function()  { return this.coords[_iY]; };
vec4.prototype.z          = function()  { return this.coords[_iZ]; };
vec4.prototype.w          = function()  { return this.coords[_iW]; };
vec4.prototype.xyz        = function()  { return new vec3(this.x(), this.y(), this.z()); };
vec4.prototype.length     = function()  { return Math.sqrt(this.x() * this.x() + this.y() * this.y() + this.z() * this.z()); };
vec4.prototype.normalized = function()  { var l = this.length();  return new vec4(this.x()/l, this.y()/l, this.z()/l, this.w() ); };
vec4.prototype.loc4       = function()  { return new vec4(this.x(), this.y(), this.z(), 1); };
vec4.prototype.dir4       = function()  { return this.normalized(); };
vec4.prototype.toVec4     = function(w) { return this; };
vec4.prototype.dot        = function(v) { return new vec4(this.x() * v.x(), this.y() * v.y(), this.z() * v.z(), this.w() * v.w()); };

vec4.prototype.timesLM    = function(leftMatrix) {
  var v = _mult_matrix_by_vec4(leftMatrix.vals, this.coords);
  return new vec4(v[_iX], v[_iY], v[_iZ], v[_iW]);
};

//////////////////////////////////////////////////
//             #mat4
//////////////////////////////////////////////////

function mat4(vals)  { this.vals = vals; }

// Other Constructors:
//--------------------
// 0. Identity
// 1. Scale
// 2. Translate
// 3. Rotate
//--------------------
// @arg v is a vec3
// @arg t is a float angle (theta)

function mat4_identity()         { return new mat4(_identity()); }

function mat4_scale(x, y, z)     { return new mat4(_scale([x,y,z])); }

function mat4_translate(x, y, z) { return new mat4(_translation([x,y,z])); }

function mat4_rotate_x(t)        { return new mat4(_rotation_x(t)); }
function mat4_rotate_y(t)        { return new mat4(_rotation_y(t)); }
function mat4_rotate_z(t)        { return new mat4(_rotation_z(t)); }
function mat4_rotate(x, y, z)    {
  return  mat4_rotate_x(x).
  timesLM(mat4_rotate_y(y)).
  timesLM(mat4_rotate_z(z));
}

mat4.prototype.arr = function() { return this.vals; };

// Multiplication:
//----------------
// 1. multiply with given matrix on the right (this x arg)
// 2. multiply with given matrix on the left (arg x this)
// 3. multiply with given vector on the right (this x arg)
mat4.prototype.timesRM = function(rightMatrix) { return new mat4(_mult_matrix_by_matrix(this.vals, rightMatrix.vals)); };
mat4.prototype.timesLM = function(leftMatrix)  { return new mat4(_mult_matrix_by_matrix(leftMatrix.vals, this.vals)); };
mat4.prototype.timesRV = function(rightVector) { return rightVector.timesLM(this); };

// Transformations:
//-----------------
mat4.prototype.scale     = function(x,y,z) { return this.timesRM(mat4_scale(x,y,z)); };
mat4.prototype.translate = function(x,y,z) { return this.timesRM(mat4_translate(x,y,z)); };
mat4.prototype.rotate    = function(x,y,z) { return this.timesRM(mat4_rotate(x,y,z)); };
mat4.prototype.rotateX   = function(t)     { return this.timesRM(mat4_rotate_x(t)); };
mat4.prototype.rotateY   = function(t)     { return this.timesRM(mat4_rotate_y(t)); };
mat4.prototype.rotateZ   = function(t)     { return this.timesRM(mat4_rotate_z(t)); };
