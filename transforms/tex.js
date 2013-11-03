function getPoint (u, v) { return [u*2-1, v*2-1, 0]; }
function getNormal(u, v) { return [0,0,1]; }

function getSpherePoint(u, v) {
  var x, y, z, r;
  y = Math.sin(u * Math.PI * 2);
  r = Math.cos(u * Math.PI * 2);
  x = r * Math.cos(v * Math.PI);
  z = r * Math.sin(v * Math.PI);
  return [x, y, z];
}
function getShereNormal(u, v) {
  return getSpherePoint(u, v);
}


canvas1.setup = function() {
  this.addObject(createParametric(16, 8, getSpherePoint, getShereNormal), 'fs_wood');
  this.objects[0].textureSrc = "img/tex-dry-rock.jpg";
}

canvas1.update = function() {

    var M0 = mat4_identity().scale(.5,.5,.5).rotateX(Math.sin(time / 3) * 3).rotateZ(Math.cos(time / 4) * 3).translate(0,0,-1);
    var obj0 = this.objects[0];
    obj0.matrix = M0.arr();
    obj0.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
    obj0.setUniform('uLDir', [.57,.57,.57]);

    if (this.mousePressed)
        console.log("canvas1 drag " + this.mouseX + " " + this.mouseY);
}

canvas2.setup = function() {

   vertShaderStr = "\
   attribute vec3 aVertexPosition;\
   attribute vec3 aVertexNormal;\
   attribute vec2 aVertexUV;\
   uniform float uTime;\
   uniform mat4 uPMatrix; /* perspective matrix */\
   uniform mat4 uOMatrix; /* object matrix */\
   uniform mat4 uNMatrix; /* normal matrix */\
   varying vec3 vNormal;\
   varying vec3 vXYZ;\
   varying vec2 vUV;\
   \
   vec3 distorted(vec3 p, vec3 n) { return p + sin(p.x * 10.) / 5. * n; }\
   \
   float epsi = 0.0001;\
   \
   vec3 distortNormal() {\
    vec3 n = aVertexNormal;\
    vec3 p = distorted(aVertexPosition, n);\
    vec3 a = normalize(cross(n, p));\
    vec3 b = normalize(cross(n, a));\
    vec3 pa = distorted(aVertexPosition + a * epsi, n);\
    vec3 pb = distorted(aVertexPosition + b * epsi, n);\
    vec3 aprime = normalize(pa - p);\
    vec3 bprime = normalize(pb - p);\
    vec3 na = normalize(cross(aprime, b));\
    vec3 nb = normalize(cross(a, bprime));\
    return normalize(na + nb);\
   }\
   \
   void main(void) {\
      gl_Position = uPMatrix * uOMatrix * vec4(distorted(aVertexPosition, aVertexNormal), 1.0);\
      vNormal = normalize((uNMatrix * vec4(distortNormal(), 0.0)).xyz);\
      vXYZ = aVertexPosition;\
      vUV = aVertexUV;\
      float a = dot(aVertexUV, vec2(3., 1.));\
      float x = sqrt(a) * a + 1. / a + a;\
      float backup = vXYZ.x;\
      vXYZ.x = x * a;\
      vXYZ.x = backup;\
   }"

  this.addObject(createParametric(20, 20, getPoint, getNormal), 'fs_wood');
  this.objects[0].textureSrc = "img/tex-dry-rock.jpg";
}

canvas2.update = function() {

    var M0 = mat4_identity().scale(.5,.5,.5).rotateX(Math.sin(time / 3) * 3).rotateZ(Math.cos(time / 4) * 3).translate(0,0,-1);
    var obj0 = this.objects[0];
    obj0.matrix = M0.arr();
    obj0.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
    obj0.setUniform('uLDir', [.57,.57,.57]);
    obj0.setUniform('uTime', time);

    if (this.mousePressed)
        console.log("canvas1 drag " + this.mouseX + " " + this.mouseY);
}
