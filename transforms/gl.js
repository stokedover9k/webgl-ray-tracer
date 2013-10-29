
// SIMPLE DEFAULT VERTEX SHADER, WHICH PROVIDES:
//    TRANSFORMED POSITION:   gl_Position
//    TRANSFORMED NORMAL:     vNormal
//    UNTRANSFORMED POSITION: vXYZ
//    TEXTURE PARAMETERS:     vUV

   var vertShaderStr = "\
   attribute vec3 aVertexPosition;\
   attribute vec3 aVertexNormal;\
   attribute vec2 aVertexUV;\
   uniform mat4 uPMatrix; /* perspective matrix */\
   uniform mat4 uOMatrix; /* object matrix */\
   uniform mat4 uNMatrix; /* normal matrix */\
   varying vec3 vNormal;\
   varying vec3 vXYZ;\
   varying vec2 vUV;\
   void main(void) {\
      gl_Position = uPMatrix * uOMatrix * vec4(aVertexPosition, 1.0);\
      vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);\
      vXYZ = aVertexPosition;\
      vUV = aVertexUV;\
      float a = dot(aVertexUV, vec2(3., 1.));\
      float x = sqrt(a) * a + 1. / a + a;\
      float backup = vXYZ.x;\
      vXYZ.x = x * a;\
      vXYZ.x = backup;\
   }"

// FUNCTION TO RETURN THE IDENTITY MATRIX:

   function identity() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }

// FUNCTION TO RETURN A PERSPECTIVE TRANSFORM, SIMULATING A CAMERA AT Z = fl:

   function perspective(fl) { return [1,0,0,0, 0,1,0,0, 0,0,-1/fl,-1/fl, 0,0,0,1]; }

// KEEP AN ARRAY OF ALL THE WEBGL CANVASES IN THE DOC:

   var glCanvases = [];

// KEEP TRACK OF STARTING TIME AND CURRENT TIME:

   var startTime = 0.0;
   var time = 0.0;

// GIVEN A MATRIX THAT TRANSFORMS POINTS, COMPUTE ITS INVERSE
// TRANSPOSE, TO TRANSFORM THE CORRESPONDING SURFACE NORMAL:

   function normalMatrix(m){
      var sx = m[0] * m[0] + m[1] * m[1] + m[ 2] * m[ 2];
      var sy = m[4] * m[4] + m[5] * m[5] + m[ 6] * m[ 6];
      var sz = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];

      return [ m[0]/sx, m[1]/sx, m[ 2]/sx, 0,
               m[4]/sy, m[5]/sy, m[ 6]/sy, 0,
               m[8]/sz, m[9]/sz, m[10]/sz, 0,  0,0,0,1 ];
    };

// INITIALIZE GL FOR ONE WEBGL CANVAS:

   function initGL(canvas) {
       var gl;

       try {
          gl = canvas.getContext("webgl") ||
               canvas.getContext("experimental-webgl");
          gl.viewportWidth = canvas.width;
          gl.viewportHeight = canvas.height;
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.enable(gl.DEPTH_TEST);
       } catch (e) {
          alert("Could not initialise WebGL.");
       }

       return gl;
   }

// CREATE A SHADER PROGRAM:

   function createShader(canvas, src, type) {
      var gl = canvas.gl;
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
         alert(gl.getShaderInfoLog(shader));
      return shader;
   }

// FETCH THE STRING CONTENTS OF AN HTML ELEMENT

   function getString(element) {
      var str = "";
      for (var k = element.firstChild ; k ; k = k.nextSibling)
         if (k.nodeType == 3)
            str += k.textContent;
      return str;
   }

// CREATE A SHADER PROGRAM, GIVEN THE ID OF AN HTML ELEMENT WITH FRAGMENT SHADER CODE:

   function createShaderProgram(canvas, fragShaderId) {
      var gl = canvas.gl;

      // GET THE FRAGMENT SHADER STRING FROM A DOCUMENT SCRIPT:

      var fragShaderStr = "precision mediump float;" +
                           getString(document.getElementById(fragShaderId));

      // BUILD VERTEX AND FRAGMENT SHADERS, LINK TOGETHER INTO A SHADER PROGRAM:

      var vertShader = createShader(canvas, vertShaderStr, gl.VERTEX_SHADER);
      var fragShader = createShader(canvas, fragShaderStr, gl.FRAGMENT_SHADER);

      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertShader);
      gl.attachShader(shaderProgram, fragShader);
      gl.linkProgram(shaderProgram);

      if (! gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
         alert("Could not initialise shaders");

      // FIND THE LOCATIONS OF THE DEFAULT SHADER PROGRAM ATTRIBUTES:

      shaderProgram.vertexPositionAttribute = 
          gl.getAttribLocation(shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

      shaderProgram.vertexNormalAttribute = 
          gl.getAttribLocation(shaderProgram, "aVertexNormal");
      gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

      shaderProgram.vertexUVAttribute = 
          gl.getAttribLocation(shaderProgram, "aVertexUV");
      gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);

      shaderProgram.pMatrixUniform=gl.getUniformLocation(shaderProgram, "uPMatrix");
      shaderProgram.oMatrixUniform=gl.getUniformLocation(shaderProgram, "uOMatrix");
      shaderProgram.nMatrixUniform=gl.getUniformLocation(shaderProgram, "uNMatrix");

      // PREPARE TO CREATE THE LOCATIONS FOR THE SHADER'S OTHER ATTRIBUTES:

      shaderProgram.uniformLocations= [];

      shaderProgram.fragShaderStr= fragShaderStr;

      return shaderProgram;
   }

   function glStart() {

      // THIS IS NEEDED BECAUSE requestAnimationFrame DOESN'T WORK IN SAFARI:

      window.requestAnimFrame = (function(callback) {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(callback) { window.setTimeout(callback,1000/60);};})();

// START WEBGL:

       startTime = (new Date).getTime();

       // INITIALIZE ALL THE WEBGL CANVASES IN THE DOC:

       var c = document.getElementsByTagName("canvas");
       for (var n = 0 ; n < c.length ; n++) {

          // ONLY PROCESS A CANVAS IF ITS "data-render" TAG IS SET TO "gl":

          if (c[n].getAttribute("data-render") == "gl") {
             var canvas = c[n];

             // ADD THIS CANVAS TO THE LIST OF WEBGL CANVASES IN THE DOC:

             glCanvases.push(canvas);

             canvas.gl = initGL(canvas);

             canvas.handle = window[canvas.id];
             canvas.handle.canvas = canvas;
             canvas.handle.objects = [];

             // DEFINE A FUNCTION FOR ADDING AN OBJECT TO THE CANVAS:

             canvas.handle.addObject = function(vertArray, fragShaderId) {

                // ADD THIS OBJECT TO THE LIST OF OBJECTS IN THIS CANVAS:

                var obj = [];
                this.objects.push(obj);

                // DEFINE OBJECT'S MATRIX, VERTEX BUFFER AND SHADER PROGRAM:

                obj.matrix = identity();
                obj.vertexBuffer = createVertexBuffer(this.canvas.gl, vertArray);
                obj.shaderProgram = createShaderProgram(this.canvas, fragShaderId);

                // PARSE THE FRAGMENT SHADER TO GET NAMES+TYPES OF UNIFORM VARIABLES:

                obj.uniformNames = [];
                obj.uniformTypes = [];
                obj.uniformValues = [];

                function skipSpace(str, j) {
                   for ( ; str.substring(j, j+1) == " " ; j++) ;
                   return j;
                }

                var sProgram = obj.shaderProgram;
                var str = sProgram.fragShaderStr;

                for (var i = 0 ; i < str.length ; i++) {

                   // PARSE ONE UNIFORM VARIABLE IN SHADER TO GET ITS TYPE AND NAME:

                   var j = str.indexOf("uniform", i);
                   if (j == -1)
                      break;

                   j = skipSpace(str, j + "uniform".length);
                   var k = str.indexOf(" ", j);
                   var uType = str.substring(j, k);

                   k = skipSpace(str, k);
                   var l0 = str.indexOf(";", k);
                   var l1 = str.indexOf(" ", k);
                   var l = l0 == -1 ? l1 : l1 == -1 ? l0 : Math.min(l0, l1);
                   var uName = str.substring(k, l);

                   var m = uName.indexOf("[");
                   if (m >= 0) {
                      uName = uName.substring(0, m);
                      uType += "[]";
                   }

                   // SAVE TYPE, NAME AND DEFAULT VALUE OF THIS UNIFORM VARIABLE:

                   obj.uniformTypes.push(uType);
                   obj.uniformNames.push(uName);
                   obj.uniformValues.push(
                      uType == "vec2"    ? [0,0]
                    : uType == "vec3"    ? [0,0,0]
                    : uType == "vec4"    ? [0,0,0,0]
                    : uType == "mat4"    ? identity()
                    : uType == "float[]" ? [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                    : 0);

                   // RECORD THE LOCATION OF THIS VARIABLE IN THE SHADER PROGRAM:

                   sProgram.uniformLocations[uName] =
                      this.canvas.gl.getUniformLocation(sProgram, uName);

                   i = l + 1;
                }

                // GIVEN THE NAME OF A UNIFORM VARIABLE, SET ITS VALUE FOR THIS OBJECT:

                obj.setUniform = function(name, value) {
                   for (var i = 0 ; i < this.uniformNames.length ; i++)
                      if (this.uniformNames[i] == name) {
                         this.uniformValues[i] = value;
                         break;
                      }
                }
             }

             // INIT THE CANVAS'S EVENT HANDLERS, THEN CALL THE USER'S SETUP FUNCTION:

             initEventHandlers(canvas);

             canvas.handle.setup();
          }
       }

       // START THE ANIMATION LOOP:

       var tick = function() {
          time = ((new Date).getTime() - startTime) / 1000;

          for (var n = 0 ; n < glCanvases.length ; n++) {
             glCanvases[n].handle.update();
             drawScene(glCanvases[n]);
          }
          requestAnimFrame(tick);
       };

       tick();
   }

// INITIALIZE RESPONSE BEHAVIOR TO USER MOUSE INPUT:

   function initEventHandlers(canvas)
   {
      canvas.onmousedown = function(event) { // Mouse pressed
         this.handle.mousePressed = true;
	 moveMouse(this.handle, event);
      }
      canvas.onmouseup = function(event) {   // Mouse released
         this.handle.mousePressed = false;
      }
      canvas.onmousemove = function(event) { // Mouse moved
	 moveMouse(this.handle, event);
      }

      function moveMouse(handle, event) {
         var x = event.clientX;
         var y = event.clientY;
         var rect = event.target.getBoundingClientRect();
         if ( rect.left <= x && x <= rect.right &&
              rect.top  <= y && y <= rect.bottom ) {
            handle.mouseX = x - rect.left;
            handle.mouseY = y - rect.top;
         }
      };
   }

// CREATE THE GL VERTEX BUFFER FOR ONE VERTEX ARRAY:

   function createVertexBuffer(gl, vertArray) {
      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertArray), gl.STATIC_DRAW);

      vertexBuffer.positionElementCount = 3;
      vertexBuffer.normalElementCount   = 3;
      vertexBuffer.uvElementCount       = 2;

      vertexBuffer.positionOffset = 0 * Float32Array.BYTES_PER_ELEMENT;
      vertexBuffer.normalOffset   = 3 * Float32Array.BYTES_PER_ELEMENT;
      vertexBuffer.uvOffset       = 6 * Float32Array.BYTES_PER_ELEMENT;
      vertexBuffer.stride         = 8 * Float32Array.BYTES_PER_ELEMENT;

      vertexBuffer.numItems = vertArray.length / 8;
      return vertexBuffer;
   }

// DRAW ONE WEBGL CANVAS FOR THIS ANIMATION FRAME

   function drawScene(canvas) {
      var gl = canvas.gl;
      gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (var n = 0 ; n < canvas.handle.objects.length ; n++)
         drawObject(gl, canvas.handle.objects[n]);
   }

// DRAW A SINGLE OBJECT OF A WEBGL CANVAS

   function drawObject(gl, obj) {
      var sProgram = obj.shaderProgram;
      var vBuffer = obj.vertexBuffer;

      gl.useProgram(sProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

      // SET VALUES FOR THIS FRAME FOR ALL DEFAULT UNIFORMS:

      gl.vertexAttribPointer( sProgram.vertexPositionAttribute,
                              vBuffer.positionElementCount, 
                              gl.FLOAT, 
                              false, 
                              vBuffer.stride, 
                              vBuffer.positionOffset
                              );
      gl.vertexAttribPointer( sProgram.vertexNormalAttribute,
                              vBuffer.normalElementCount, 
                              gl.FLOAT, 
                              false, 
                              vBuffer.stride, 
                              vBuffer.normalOffset
                              );
      gl.vertexAttribPointer( sProgram.vertexUVAttribute, 
                              vBuffer.uvElementCount, 
                              gl.FLOAT, 
                              false, 
                              vBuffer.stride, 
                              vBuffer.uvOffset 
                              );
      gl.uniformMatrix4fv(sProgram.pMatrixUniform, false, perspective(10));
      gl.uniformMatrix4fv(sProgram.oMatrixUniform, false, obj.matrix);
      gl.uniformMatrix4fv(sProgram.nMatrixUniform, false, normalMatrix(obj.matrix));

      // SET THE VALUES FOR THIS FRAME FOR ALL USER DEFINED UNIFORMS:

      for (var i = 0 ; i < obj.uniformNames.length ; i++) {
         var name = obj.uniformNames[i];
         var type = obj.uniformTypes[i];
         var val  = obj.uniformValues[i];
         var loc  = sProgram.uniformLocations[name];

	 // SETTING EACH TYPE OF UNIFORM REQUIRES A DIFFERENT GL FUNCTION:

         if (type == "float")
            gl.uniform1f(loc, val);
         else if (type == "float[]")
            gl.uniform1fv(loc, val);
         else if (type == "vec2")
            gl.uniform2fv(loc, val);
         else if (type == "vec3")
            gl.uniform3fv(loc, val);
         else if (type == "vec4")
            gl.uniform4fv(loc, val);
         else if (type == "mat4")
            gl.uniformMatrix4fv(loc, false, val);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vBuffer.numItems);
   }

// CREATE A PARAMETRIC SURFACE, GIVEN A USER DEFINED PARAMETRIC FUNCTION.
// DESIRED STEP SIZE IN U AND V ARE du AND dv, RESPECTIVELY:

   function createParametric(du, dv, f) {
      var vertices = [];

      // RETURN BOTH POINT AND NORMAL AT THIS [u,v]:

      function fd(u, v) {

         // USER'S FUNCTION f MUST EVALUATE TO AN [x,y,z] POINT:

         u = Math.max(0, Math.min(1, u));
         v = Math.max(0, Math.min(1, v));
         var p = f(u, v);

	 // TO COMPUTE NORMAL VECTOR, TAKE THE CROSS PRODUCT
	 // OF TANGENT VECTORS COMPUTED BY FINITE DIFFERENCE:

         var pu = f(u+du/100, v);
	 var ux = pu[0] - p[0], uy = pu[1] - p[1], uz = pu[2] - p[2];

         var pv = f(u, v+dv/100);
	 var vx = pv[0] - p[0], vy = pv[1] - p[1], vz = pv[2] - p[2];

	 var x = uy * vz - uz * vy;
	 var y = uz * vx - ux * vz;
	 var z = ux * vy - uy * vx;
	 var r = Math.sqrt(x*x + y*y + z*z);

	 // RETURN BOTH THE POINT AND THE NORMAL:

	 return [p[0], p[1], p[2], x/r, y/r, z/r];
      }

      // ADD A SINGLE QUAD, COVERING PARAMETRIC RANGE [u,v]...[u+du,v+dv]:

      function addQuad(u, v, a, b, c, d) {

         // EACH VERTEX IS: x,y,z, nx,ny,nz, u,v

	 vertices.push(a[0],a[1],a[2], a[3],a[4],a[5], u   , v   );
	 vertices.push(b[0],b[1],b[2], b[3],b[4],b[5], u+du, v   );
	 vertices.push(c[0],c[1],c[2], c[3],c[4],c[5], u+du, v+dv);
	 vertices.push(d[0],d[1],d[2], d[3],d[4],d[5], u   , v+dv);
	 vertices.push(a[0],a[1],a[2], a[3],a[4],a[5], u   , v   );
      }

      // THE FOLLOWING WOULD BE MORE EFFICIENT IF IT
      // CREATED TRIANGLE STRIPS IN THE INNER LOOP:

      for (var v = 0 ; v < 1 ; v += dv)
         for (var u = 0 ; u < 1 ; u += du)
            addQuad(u,v, fd(u, v), fd(u+du,v), fd(u+du,v+dv), fd(u,v+dv));

      return vertices;
   }

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

function createCircle(steps) {

  var vertices = [];

  function addFace (ang1, ang2) {
    var s1 = Math.sin(ang1);
    var c1 = Math.cos(ang1);
    var s2 = Math.sin(ang2);
    var c2 = Math.cos(ang2);
    vertices.push(0, 0, 0,  0,0,1, 0.5, 0.5);
    vertices.push(c1,s1,0,  0,0,1, (c1/2+0.5),(s1/2+0.5));
    vertices.push(c2,s2,0,  0,0,1, (c2/2+0.5),(s2/2+0.5));
  }

  for (var i = 0; i < steps; i++) {
    var a1 = Math.PI * 2 / steps * i;
    var a2 = Math.PI * 2 / steps * (i + 1);
    addFace(a1, a2);
  }

  return vertices;
}
