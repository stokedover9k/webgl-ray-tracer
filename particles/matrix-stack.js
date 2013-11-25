// Matrix Stack Transformation
// Main constructor
// @arg transform is a function of type mat4 => mat4
function MSTransform(transform) { this.transform = transform; }

// Other constructors for Matrix Stack Transformation
function MSIdentity()         { return new MSTransform(function(m) { return m; }); } 

function MSTranslate(x,y,z)   { return new MSTransform(function(m) { return m.translate(x,y,z); }); }
function MSTranslatev(v)      { return MSTranslate(v.x(), v.y(), v.z()); }

function MSScale(x,y,z)       { return new MSTransform(function(m) { return m.scale(x,y,z); }); }
function MSScale1(s)          { return MSScale(s,s,s); }
function MSScalev(v)          { return MSScale(v.x(), v.y(), v.z()); }

function MSRotate(x,y,z)      { return new MSTransform(function(m) { return m.rotate(x,y,z); }); }
function MSRotatev(v)         { return MSRotate(v.x(), v.y(), v.z()); }

function MSRotateX(t)         { return new MSTransform(function(m) { return m.rotateX(t); }); }
function MSRotateY(t)         { return new MSTransform(function(m) { return m.rotateY(t); }); }
function MSRotateZ(t)         { return new MSTransform(function(m) { return m.rotateZ(t); }); }

function MSRotateAxis(u,v,w,t){ return new MSTransform(function(m) { return m.rotateAxis(u,v,w,t); }); }
function MSRotateAxisv(v,t){ return MSRotateAxis(v.x(), v.y(), v.z(), t); }



MSTransform.prototype.then = function(otherTransform) {
  var t1 = this.transform;  var t2 = otherTransform.transform;
  return new MSTransform( function(m) { return t1(t2(m)); } );
};



function MatrixStack() { this.stack = [ mat4_identity() ]; }

MatrixStack.prototype.size  = function() { return this.stack.length; };
MatrixStack.prototype.top   = function() { return this.stack[this.stack.length-1]; };
MatrixStack.prototype.push  = function() { this.stack.push(this.top()); };
MatrixStack.prototype.pop   = function() { this.stack.pop(); };

MatrixStack.prototype.apply = function( msTransform ) { this.stack[this.size()-1] = msTransform.transform(this.top()); };

MatrixStack.prototype.translate  = function(x,y,z)   { this.apply(MSTranslate(x,y,z)); };
MatrixStack.prototype.scale      = function(x,y,z)   { this.apply(MSScale(x,y,z)); };
MatrixStack.prototype.rotate     = function(x,y,z)   { this.apply(MSRotate(x,y,z)); };
MatrixStack.prototype.rotateX    = function(t)       { this.apply(MSRotateX(t)); };
MatrixStack.prototype.rotateY    = function(t)       { this.apply(MSRotateY(t)); };
MatrixStack.prototype.rotateZ    = function(t)       { this.apply(MSRotateZ(t)); };
MatrixStack.prototype.rotateAxis = function(u,v,w,t) { this.apply(MSRotateAxis(u,v,w,t)); };
