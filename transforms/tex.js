
canvas1.setup = function() {
  this.addObject(createParametric(16, 8, getSpherePoint, getSphereNormal), 'fs_wood');
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
   vec3 distorted(vec3 p, vec3 n) {\
     return p + sin(p.y * p.y * 5. + p.x * p.x * 2. + 20. * uTime) / 10. * n;\
   }\
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
  this.objects[0].textureSrc = "img/leopard.jpg";
}

canvas2.update = function() {

    var M0 = mat4_identity().scale(.8,.8,.8).rotateX(Math.sin(time / 3) * 3).rotateZ(Math.cos(time / 4) * 3).translate(0,0,-1);
    var obj0 = this.objects[0];
    obj0.matrix = M0.arr();
    obj0.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
    obj0.setUniform('uLDir', [.57,.57,.57]);
    obj0.setUniform('uTime', time);

    if (this.mousePressed)
        console.log("canvas1 drag " + this.mouseX + " " + this.mouseY);
}

canvas3.setup = function() {

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
   float epsi = 0.0001;\
   \
   vec3 pointAt(float u, float v) {\
     float y = sin(u * 3.14159265359 * 2.);\
     float r = cos(u * 3.14159265359 * 2.);\
     float x = r * cos(v * 3.14159265359);\
     float z = r * sin(v * 3.14159265359);\
     return vec3(x, y, z);\
   }\
   \
   vec3 distorted(vec3 p, vec3 n, vec2 uv) {\
     float delta = sin(p.y * p.x * 20. + p.z * 10. + uTime * 5.) / 20.;\
     return p + delta * n;\
   }\
   \
   vec3 distortNormal() {\
    float u = vUV.x;  float v = vUV.y;\
    vec3 n = aVertexNormal;\
    vec3 p = distorted(aVertexPosition, n, vUV);\
    vec3 ppa = normalize(p + vec3(epsi, 0., 0.));\
    if( ppa == p ) ppa = normalize(p + vec3(0., epsi, 0.));\
    vec3 ppb = normalize(cross(ppa, p));\
    vec3 pa = distorted(ppa, ppa, vec2(u + epsi, v));\
    vec3 pb = distorted(ppb, ppb, vec2(u, v + epsi));\
    vec3 aprime = normalize(pa - p);\
    vec3 bprime = normalize(pb - p);\
\
    return normalize(cross(bprime, aprime));\
   }\
   \
   void main(void) {\
      gl_Position = uPMatrix * uOMatrix * vec4(distorted(aVertexPosition, aVertexNormal, vUV), 1.0);\
      vNormal = normalize((uNMatrix * vec4(distortNormal(), 0.0)).xyz);\
      vXYZ = aVertexPosition;\
      vUV = aVertexUV;\
      float a = dot(aVertexUV, vec2(3., 1.));\
      float x = sqrt(a) * a + 1. / a + a;\
      float backup = vXYZ.x;\
      vXYZ.x = x * a;\
      vXYZ.x = backup;\
   }"

  this.addObject(createParametric(64, 32, getSpherePoint, getSphereNormal), 'fs_wood');
  this.objects[0].textureSrc = "img/leopard.jpg";
}

canvas3.update = function() {

    var M0 = mat4_identity().scale(.8,.8,.8).rotateX(Math.sin(time / 3) * 3).rotateZ(Math.cos(time / 4) * 3).translate(0,0,-1);
    var obj0 = this.objects[0];
    obj0.matrix = M0.arr();
    obj0.setUniform('p', [.1,.0,0, .9,.0,0, 1,1,1,20]);
    obj0.setUniform('uLDir', [.57,.57,.57]);
    obj0.setUniform('uTime', time);

    if (this.mousePressed)
        console.log("canvas1 drag " + this.mouseX + " " + this.mouseY);
}
