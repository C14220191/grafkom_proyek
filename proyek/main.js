var GL;

  class MyObject{
    canvas = null;
    vertex = [];
    faces = [];


    SHADER_PROGRAM = null;
    _color = null;
    _position = null;


    _MMatrix = LIBS.get_I4();
    _PMatrix = LIBS.get_I4();
    _VMatrix = LIBS.get_I4();
    _greyScality = 0;


    TRIANGLE_VERTEX = null;
    TRIANGLE_FACES = null;


    MODEL_MATRIX = LIBS.get_I4();
    child = [];

    constructor(vertex, faces, source_shader_vertex, source_shader_fragment){
      this.vertex = vertex;
      this.faces = faces;


      var compile_shader = function(source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
          alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
          return false;
        }
        return shader;
       };
   
    var shader_vertex = compile_shader(source_shader_vertex, GL.VERTEX_SHADER, "VERTEX");
   
    var shader_fragment = compile_shader(source_shader_fragment, GL.FRAGMENT_SHADER, "FRAGMENT");
   
    this.SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(this.SHADER_PROGRAM, shader_vertex);
    GL.attachShader(this.SHADER_PROGRAM, shader_fragment);
   
    GL.linkProgram(this.SHADER_PROGRAM);


    //vao
    this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "color");
    this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");


    //uniform
    this._PMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"PMatrix"); //projection
    this._VMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"VMatrix"); //View
    this._MMatrix = GL.getUniformLocation(this.SHADER_PROGRAM,"MMatrix"); //Model
    this._greyScality = GL.getUniformLocation(this.SHADER_PROGRAM, "greyScality");//GreyScality


    GL.enableVertexAttribArray(this._color);
    GL.enableVertexAttribArray(this._position);
    GL.useProgram(this.SHADER_PROGRAM);




    this.TRIANGLE_VERTEX = GL.createBuffer();
    this.TRIANGLE_FACES = GL.createBuffer();
    }


    setup(){
      GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
      GL.bufferData(GL.ARRAY_BUFFER,
      new Float32Array(this.vertex),
      GL.STATIC_DRAW);


      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.faces),
      GL.STATIC_DRAW);
      this.child.forEach(obj => {
        obj.setup;
      });
    }


    render(VIEW_MATRIX, PROJECTION_MATRIX){
          GL.useProgram(this.SHADER_PROGRAM);  
          GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
          GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
          GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4*(3+3), 0);
          GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4*(3+3), 3*4);


          GL.uniformMatrix4fv(this._PMatrix,false,PROJECTION_MATRIX);
          GL.uniformMatrix4fv(this._VMatrix,false,VIEW_MATRIX);
          GL.uniformMatrix4fv(this._MMatrix,false,this.MODEL_MATRIX);
          GL.uniform1f(this._greyScality, 1);
          GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);


          GL.flush();
          this.child.forEach(obj => {
            obj.render(VIEW_MATRIX, PROJECTION_MATRIX);
          });
    }
  }
 
 
  function main(){
      var CANVAS = document.getElementById("myCanvas");
 
 
      CANVAS.width = window.innerWidth;
      CANVAS.height = window.innerHeight;
      var drag = false;
      var dX = 0;
      var dY = 0;
      var pos_x = 0;
      var pos_y = 0;
      var pos_z = 0;
  
  
      var X_prev = 0;
      var Y_prev = 0;
  
      var THETA = 0;
      var ALPHA = 0;
  
      var WorldTHETA = 0;
      var WorldALPHA = 0;
      var WorldZ = 0;
  
      var FRICTION = 0.95;
      var ScaleAwan = 0.5;
      var AwanS = true;
      var DaunS = true;
      var ScaleDaun = 0.5;


      var mouseDown = function(e){
        drag = true;
        X_prev = e.pageX;
        Y_prev = e.pageY;
      }


      var mouseUp = function(e){
        drag = false;
      }


      var mouseMove = function(e){
        if(!drag){return false;}
        dX = e.pageX - X_prev;
        dY = e.pageY- Y_prev;
        X_prev = e.pageX;
        Y_prev = e.pageY;


        THETA += dX * 2*Math.PI / CANVAS.width;
        ALPHA += dY * 2*Math.PI / CANVAS.height;
      }


      var keyDown = function(e){
        e.preventDefault();
        console.log(e);
      }

      function generateCylinderVerti(z1, z2, radius, radius2, array_color) {
        var cylinderVertex = []
      cylinderVertex.push(0);
      cylinderVertex.push(0);
      cylinderVertex.push(0);
      cylinderVertex.push(array_color[0]);
          cylinderVertex.push(array_color[1]);
          cylinderVertex.push(array_color[2]);
      // cylinderVertex.push(221/255);
      // cylinderVertex.push(112/255);
      // cylinderVertex.push(24/255);
    
      for (var i = 0; i <= 720; i++) {
        if (i <= 360) {
          var x =
            (radius * Math.cos(LIBS.degToRad(i))) / CANVAS.width;
          var y =
            (radius2 * Math.sin(LIBS.degToRad(i))) / CANVAS.height;
          cylinderVertex.push(x);
          cylinderVertex.push(z1);
          cylinderVertex.push(y);
          cylinderVertex.push(array_color[0]);
          cylinderVertex.push(array_color[1]);
          cylinderVertex.push(array_color[2]);
        }
        if (i == 360) {
          cylinderVertex.push(0);
          cylinderVertex.push(1);
          cylinderVertex.push(0);
          cylinderVertex.push(array_color[0]);
          cylinderVertex.push(array_color[1]);
          cylinderVertex.push(array_color[2]);
        }
        if (i >= 360) {
          var x =
            (radius * Math.cos(LIBS.degToRad(i % 360))) /
            CANVAS.width;
          var y =
            (radius2 * Math.sin(LIBS.degToRad(i % 360))) /
            CANVAS.height;
          cylinderVertex.push(x);
          cylinderVertex.push(z2);
          cylinderVertex.push(y);
          cylinderVertex.push(array_color[0]);
          cylinderVertex.push(array_color[1]);
          cylinderVertex.push(array_color[2]);
        }
        if (i == 720) {
          var x =
            (radius * Math.cos(LIBS.degToRad(360))) / CANVAS.width;
          var y =
            (radius2 * Math.sin(LIBS.degToRad(360))) /
            CANVAS.height;
            cylinderVertex.push(x);
          cylinderVertex.push(1);
          cylinderVertex.push(y);
          cylinderVertex.push(array_color[0]);
          cylinderVertex.push(array_color[1]);
          cylinderVertex.push(array_color[2]);
        }
      }
    
      var cylinder_faces = []
    
        for (var i = 0; i < cylinderVertex.length / 6 - 1; i++) {
          if (i <= 360) {
            cylinder_faces.push(0);
            cylinder_faces.push(i);
            cylinder_faces.push(i + 1);
          }
          if (i > 362) {
            cylinder_faces.push(362);
            cylinder_faces.push(i);
            cylinder_faces.push(i + 1);
          }
        }
    
        var bottom_circle_index = 0;
        var top_circle_index = 363;
    
        for (var i = 0; i <= 360; i++) {
          cylinder_faces.push(bottom_circle_index);
          cylinder_faces.push(bottom_circle_index + 1);
          cylinder_faces.push(top_circle_index);
          cylinder_faces.push(top_circle_index);
          cylinder_faces.push(top_circle_index + 1);
          cylinder_faces.push(bottom_circle_index + 1);
          bottom_circle_index++;
          top_circle_index++;
        }
    
        return { vertices: cylinderVertex, faces: cylinder_faces };
      }


      CANVAS.addEventListener("mousedown", mouseDown, false);
      CANVAS.addEventListener("mouseup", mouseUp, false);
      CANVAS.addEventListener("mouseout", mouseUp,false);
      CANVAS.addEventListener("mousemove", mouseMove, false);
      CANVAS.addEventListener("keydown", keyDown);
 
 
     
      try{
          GL = CANVAS.getContext("webgl", {antialias: true});
      }catch(e){
          alert("WebGL context cannot be initialized");
          return false;
      }
      //shaders
      var shader_vertex_source=`
      attribute vec3 position;
      attribute vec3 color;


      uniform mat4 PMatrix;
      uniform mat4 VMatrix;
      uniform mat4 MMatrix;
     
      varying vec3 vColor;
      void main(void) {
      gl_Position = PMatrix*VMatrix*MMatrix*vec4(position, 1.);
      vColor = color;


      gl_PointSize=20.0;
      }`;
      var shader_fragment_source =`
      precision mediump float;
      varying vec3 vColor;
      // uniform vec3 color;


      uniform float greyScality;


      void main(void) {
      float greyScaleValue = (vColor.r + vColor.g + vColor.b)/3.;
      vec3 greyScaleColor = vec3(greyScaleValue, greyScaleValue, greyScaleValue);
      vec3 color = mix(greyScaleColor, vColor, greyScality);
      gl_FragColor = vec4(color, 1.);
      }`;
    

       
      var badan = LIBS.Sphere(0,0,0,1,100)
      for (var i = 0; i < badan.vertices.length; i+=6) {
        badan.vertices[i + 3] = 255/255; // Red component
        badan.vertices[i + 4] = 209/255; // Green component
        badan.vertices[i + 5] = 216/255; // Blue component
      };

      var acc1 = LIBS.Sphere(0,0,0,0.2,100)
      for (var i = 0; i < acc1.vertices.length; i+=6) {
        acc1.vertices[i + 3] = 255/255; // Red component
        acc1.vertices[i + 4] = 182/255; // Green component
        acc1.vertices[i + 5] = 193/255; // Blue component
      };
      var leg = LIBS.EllipsoidY(0,0,0,0.2,100)
      for (var i = 0; i < leg.vertices.length; i+=6) {
        leg.vertices[i + 3] = 255/255; // Red component
        leg.vertices[i + 4] = 182/255; // Green component
        leg.vertices[i + 5] = 193/255; // Blue component
      };
      var arm = LIBS.EllipsoidX(0,0,0,0.15,100)
      for (var i = 0; i < arm.vertices.length; i+=6) {
        arm.vertices[i + 3] = 255/255; // Red component
        arm.vertices[i + 4] = 182/255; // Green component
        arm.vertices[i + 5] = 193/255; // Blue component
      };
      var rightPupil = LIBS.generateCircle(0.35, 1.1, 0.1, 100);
      for (var i = 0; i < rightPupil.vertex.length; i+=6) {
        rightPupil.vertex[i + 3] = 0; // Red component
        rightPupil.vertex[i + 4] = 0; // Green component
        rightPupil.vertex[i + 5] = 0; // Blue component
      }

      var leftPupil = LIBS.generateCircle(-0.35, 1.1, 0.1, 100);
      for (var i = 0; i < leftPupil.vertex.length; i+=6) {
        leftPupil.vertex[i + 3] = 0; // Red component
        leftPupil.vertex[i + 4] = 0; // Green component
        leftPupil.vertex[i + 5] = 0; // Blue component
      }

      var rightEye = LIBS.generateCircle(0.36, 1, 0.2, 100);
      for (var i = 0; i < rightEye.vertex.length; i+=6) {
        rightEye.vertex[i + 3] = 224/255; // Red component
        rightEye.vertex[i + 4] = 17/255; // Green component
        rightEye.vertex[i + 5] = 95/255; // Blue component
      }

      var leftEye = LIBS.generateCircle(-0.36, 1, 0.2, 100);
      for (var i = 0; i < leftEye.vertex.length; i+=6) {
        leftEye.vertex[i + 3] = 224/255; // Red component
        leftEye.vertex[i + 4] = 17/255; // Green component
        leftEye.vertex[i + 5] = 95/255; // Blue component
      }
      var grass = LIBS.generateCircle(0, 0, 1, 100);
      for (var i = 0; i < grass.vertex.length; i+=6) {
        grass.vertex[i + 3] = 107/255; // Red component
        grass.vertex[i + 4] = 142/255; // Green component
        grass.vertex[i + 5] = 35/255; // Blue component
      }

      
      var SpiralPoints = [
        0, 0 , 1, 0, 0, 0,
        1, 1, 1, 0, 0, 0,
        1.5, -2, 1, 0, 0, 0,
        -3, 0, 1, 0, 0, 0,
        0, 1, 1, 0, 0, 0,
        1, 1, 1, 0, 0, 0,
        1, 0, 1, 0, 0, 0,
    ];
    var mouthPoints = [
      0.4, 0.5, 1, 0, 0, 0,
      0, 1.5, 1, 0, 0, 0,
      -0.4, 0.5, 1, 0, 0, 0,
    ];

    var stonMouth = [
      1, 0, 1, 0, 0, 0,
      0, -1.5, 1, 0, 0, 0,
      -1, 0, 1, 0, 0, 0,
    ];
    var Wood = LIBS.generateTabung(0, 0, 0, 1, 7.5, 100, 1, 1, 1);
    for (var i = 0; i < Wood.vertices.length; i+=6) {
      Wood.vertices[i + 3] = 139/255; // Red component
      Wood.vertices[i + 4] = 69/255; // Green component
      Wood.vertices[i + 5] = 19/255; // Blue component
    }
    var daun = LIBS.Cone(0, 0, 0, 2, 3, 1000);
    for (var i = 0; i < daun.vertices.length; i+=6) {
      daun.vertices[i + 3] = 0/255; // Red component
      daun.vertices[i + 4] = 100/255; // Green component
      daun.vertices[i + 5] = 0/255; // Blue component
    }
    var cloud = LIBS.Sphere(0, 0, 0, 3, 100);
    for (var i = 0; i < cloud.vertices.length; i+=6) {
      cloud.vertices[i + 3] = 255/255; // Red component
      cloud.vertices[i + 4] = 255/255; // Green component
      cloud.vertices[i + 5] = 255/255; // Blue component
    }
    var Topi = LIBS.Cone(0, 0, 0, 0.5, 2, 50);
      for (var i = 0; i < Topi.vertices.length; i+=6) {
      if (i == 0) {
        Topi.vertices[i + 3] = 255/255; // Red component
        Topi.vertices[i + 4] = 0/255; // Green component
        Topi.vertices[i + 5] = 0/255; // Blue component
      }
        else if ((i/6)%2 != 0) {
          Topi.vertices[i + 3] = 255/255; // Red component
          Topi.vertices[i + 4] = 255/255; // Green component
          Topi.vertices[i + 5] = 255/255; // Blue component
        }
        else {
          Topi.vertices[i + 3] = 255/255; // Red component
          Topi.vertices[i + 4] = 0/255; // Green component
          Topi.vertices[i + 5] = 0/255; // Blue component
        }

      }

      var PROJECTION_MATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1,100);
      var VIEW_MATRIX = LIBS.get_I4();
      var MODEL_MATRIX = LIBS.get_I4();
      var ACC1_MATRIX = LIBS.get_I4();
      var ACC2_MATRIX = LIBS.get_I4();
      var ACC3_MATRIX = LIBS.get_I4();
      var LegLeft_MATRIX = LIBS.get_I4();
      var LegRight_MATRIX = LIBS.get_I4();
      var ArmRight_MATRIX = LIBS.get_I4();
      var ArmLeft_MATRIX = LIBS.get_I4();
      var PUPIL_MATRIX = LIBS.get_I4();
      var BADAN_MATRIX = LIBS.get_I4();
      var GRASS_MATRIX = LIBS.get_I4();
      var MOUTH_MATRIX = LIBS.get_I4();
      var SPIRAL_MATRIX  = LIBS.get_I4();
      
      var Topi_MATRIX = LIBS.get_I4();
      
      var BATANG1_MATRIX = LIBS.get_I4();
      var BATANG2_MATRIX = LIBS.get_I4();
      var DAUN1_MATRIX = LIBS.get_I4();
      var DAUN2_MATRIX = LIBS.get_I4();

      var GUMPALAN1_MATRIX = LIBS.get_I4();
      var GUMPALAN2_MATRIX = LIBS.get_I4();
      var GUMPALAN3_MATRIX = LIBS.get_I4();
      var GUMPALAN4_MATRIX = LIBS.get_I4();
      var GUMPALAN5_MATRIX = LIBS.get_I4();
      var GUMPALAN6_MATRIX = LIBS.get_I4();

      var GUMPALAN7_MATRIX = LIBS.get_I4();
      var GUMPALAN8_MATRIX = LIBS.get_I4();
      var GUMPALAN9_MATRIX = LIBS.get_I4();
      var GUMPALAN10_MATRIX = LIBS.get_I4();
      var GUMPALAN11_MATRIX = LIBS.get_I4();
      var GUMPALAN12_MATRIX = LIBS.get_I4();



      var headModelMatrix = LIBS.get_I4();
    var legModelMatrix = LIBS.get_I4();
    var legModelMatrix2 = LIBS.get_I4();
    var shoulderModelMatrix = LIBS.get_I4();
    var shoulderModelMatrix2 = LIBS.get_I4();
    var armModelMatrix = LIBS.get_I4();
    var armModelMatrix2 = LIBS.get_I4();
    var handModelMatrix = LIBS.get_I4();
    var handModelMatrix2 = LIBS.get_I4();
    var headPieceModelMatrix = LIBS.get_I4();
    var hatModelMatrix = LIBS.get_I4();
    var eyeModelMatrix = LIBS.get_I4();
    var eyeModelMatrix2 = LIBS.get_I4();
    var fingerModelMatrix = LIBS.get_I4();
    var fingerModelMatrix2 = LIBS.get_I4();
    var fingerModelMatrix3 = LIBS.get_I4();
    var fingerModelMatrix4 = LIBS.get_I4();
    var thumbModelMatrix = LIBS.get_I4();
    var thumbModelMatrix2 = LIBS.get_I4();
    var mouthModelMatrix = LIBS.get_I4();


      var trapezoid = [
        -5.5,0,-1, (153/255), (153/255), (153/255), 
        5.5,0,-1, (153/255), (153/255), (153/255), 
        5.5,0, 1, (153/255), (153/255), (153/255), 
        -5.5,0, 1, (153/255), (153/255), (153/255), 
        // Top
        -4, 3, -1, (153/255), (153/255), (153/255), 
        4, 3, -1, (153/255), (153/255), (153/255), 
        4, 3, 1, (153/255), (153/255), (153/255), 
        -4, 3, 1, (153/255), (153/255), (153/255)
    ]
   
      // FACES:
      var trapezoid_faces = [
        0, 1, 2,
        0, 2, 3,
        // Top
        4, 5, 6,
        4, 6, 7,
        // Side faces
        0, 1, 5,
        0, 5, 4,
        1, 2, 6,
        1, 6, 5,
        2, 3, 7,
        2, 7, 6,
        3, 0, 4,
        3, 4, 7
      ];

    var legVertices = [
      //belakang
      -2.5,-8,-2, (172/255), (115/255), (57/255), 
      2.5,-8,-2, (172/255), (115/255), (57/255), 
      1.5,1,-1, (140/255),(140/255),(140/255), 
      -1.5,1,-1, (140/255),(140/255),(140/255), 


      //depan
      -2.5,-8,2,  (172/255), (115/255), (57/255),
      2.5,-8,2,  (172/255), (115/255), (57/255),
      1.5,1,1,  (140/255), (140/255),  (140/255),
      -1.5,1,1,  (140/255), (140/255),  (140/255),


      //kiri
      -2.5,-8,-2,  (172/255), (115/255), (57/255), 
      -1.5,1,-1,  (140/255), (140/255), (140/255), 
      -1.5,1,1,  (140/255), (140/255), (140/255), 
      -2.5,-8,2,  (172/255), (115/255), (57/255),

      //kanan
      2.5,-8,-2,  (172/255), (115/255), (57/255), 
      1.5,1.,-1,  (140/255), (140/255), (140/255), 
      1.5,1.,1,  (140/255), (140/255), (140/255), 
      2.5,-8,2,  (172/255), (115/255), (57/255), 


      //bawah
      -2.5,-8,-2,  (172/255), (115/255), (57/255), 
      -2.5,-8,2,  (172/255), (115/255), (57/255), 
      2.5,-8,2,  (172/255), (115/255), (57/255), 
      2.5,-8,-2,  (172/255), (115/255), (57/255), 


      //atas
      -1.5,1,-1,  (140/255), (140/255), (140/255), 
      -1.5,1,1,  (140/255), (140/255), (140/255), 
      1.5,1,1,  (140/255), (140/255), (140/255), 
      1.5,1,-1,  (140/255), (140/255), (140/255)
    ];

    var legFaces = [
      0, 1, 2,
      0, 2, 3,


      4, 5, 6,
      4, 6, 7,


      8, 9, 10,
      8, 10, 11,


      12, 13, 14,
      12, 14, 15,


      16, 17, 18,
      16, 18, 19,


      20, 21, 22,
      20, 22, 23
    ];

    var shoulderVertices = [
       //belakang
      -0.5,-0.5,-0.5,    (102/255), (102/255), (102/255), 
      0.5,-0.5,-0.5,      (102/255), (102/255), (102/255), 
      0.5,0.5,-0.5,      (102/255), (102/255), (102/255), 
      -0.5,0.5,-0.5,     (102/255), (102/255), (102/255), 


      //depan
      -0.5,-0.5,0.5,     (102/255), (102/255), (102/255), 
      0.5,-0.5,0.5,      (102/255), (102/255), (102/255), 
      0.5,0.5,0.5,       (102/255), (102/255), (102/255), 
      -0.5,0.5,0.5,      (102/255), (102/255), (102/255), 


      //kiri
      -0.5,-0.5,-0.5,    (102/255), (102/255), (102/255),
      -0.5,0.5,-0.5,     (102/255), (102/255), (102/255), 
      -0.5,0.5,0.5,      (102/255), (102/255), (102/255), 
      -0.5,-0.5,0.5,     (102/255), (102/255), (102/255), 
      
      //kanan
      0.5,-0.5,-0.5,     (102/255), (102/255), (102/255), 
      0.5,0.5,-0.5,      (102/255), (102/255), (102/255), 
      0.5,0.5,0.5,       (102/255), (102/255), (102/255), 
      0.5,-0.5,0.5,      (102/255), (102/255), (102/255), 


      //bawah
      -0.5,-0.5,-0.5,    (102/255), (102/255), (102/255), 
      -0.5,-0.5,0.5,     (102/255), (102/255), (102/255), 
      0.5,-0.5,0.5,      (102/255), (102/255), (102/255), 
      0.5,-0.5,-0.5,     (102/255), (102/255), (102/255), 


      //atas
      -0.5,0.5,-0.5,     (102/255), (102/255), (102/255), 
      -0.5,0.5,0.5,      (102/255), (102/255), (102/255), 
      0.5,0.5,0.5,       (102/255), (102/255), (102/255), 
      0.5,0.5,-0.5,      (102/255), (102/255), (102/255)
    ];

    var shoulderFaces = [
      0,1,2,
      0,2,3,


      4,5,6,
      4,6,7,


      8,9,10,
      8,10,11,


      12,13,14,
      12,14,15,


      16,17,18,
      16,18,19,


      20,21,22,
      20,22,23
    ];

    var armVertices = [
      //belakang
      -0.75,-0.75,-0.75,    (153/255), (153/255), (153/255), 
      0.75,-0.75,-0.75,      (153/255), (153/255), (153/255), 
      0.75,0.75,-0.75,      (153/255), (153/255), (153/255), 
      -0.75,0.75,-0.75,     (153/255), (153/255), (153/255),


      //depan
      -0.75,-0.75,0.75,     (153/255), (153/255), (153/255), 
      0.75,-0.75,0.75,      (153/255), (153/255), (153/255), 
      0.75,0.75,0.75,       (153/255), (153/255), (153/255), 
      -0.75,0.75,0.75,      (153/255), (153/255), (153/255), 


      //kiri
      -0.75,-0.75,-0.75,    (153/255), (153/255), (153/255), 
      -0.75,0.75,-0.75,     (153/255), (153/255), (153/255), 
      -0.75,0.75,0.75,      (153/255), (153/255), (153/255), 
      -0.75,-0.75,0.75,     (153/255), (153/255), (153/255), 
      
      //kanan
      0.75,-0.75,-0.75,     (153/255), (153/255), (153/255), 
      0.75,0.75,-0.75,      (153/255), (153/255), (153/255), 
      0.75,0.75,0.75,       (153/255), (153/255), (153/255), 
      0.75,-0.75,0.75,      (153/255), (153/255), (153/255), 


      //bawah
      -0.75,-0.75,-0.75,    (153/255), (153/255), (153/255), 
      -0.75,-0.75,0.75,     (153/255), (153/255), (153/255), 
      0.75,-0.75,0.75,      (153/255), (153/255), (153/255), 
      0.75,-0.75,-0.75,     (153/255), (153/255), (153/255), 


      //atas
      -0.75,0.75,-0.75,     (153/255), (153/255), (153/255), 
      -0.75,0.75,0.75,      (153/255), (153/255), (153/255), 
      0.75,0.75,0.75,       (153/255), (153/255), (153/255), 
      0.75,0.75,-0.75,      (153/255), (153/255), (153/255)
    ]
   
      // FACES:
      var armFaces = [
        0,1,2,
        0,2,3,


        4,5,6,
        4,6,7,


        8,9,10,
        8,10,11,


        12,13,14,
        12,14,15,


        16,17,18,
        16,18,19,


        20,21,22,
        20,22,23
      ];  

      var handVertices = [
        -1.2,-1.2,-1.2,    (102/255), (102/255), (102/255), 
        1.2,-1.2,-1.2,      (102/255), (102/255), (102/255), 
        1.2,1.2,-1.2,      (102/255), (102/255), (102/255), 
        -1.2,1.2,-1.2,     (102/255), (102/255), (102/255), 
  
  
        //depan
        -1.2,-1.2,1.2,     (102/255), (102/255), (102/255), 
        1.2,-1.2,1.2,      (102/255), (102/255), (102/255), 
        1.2,1.2,1.2,       (102/255), (102/255), (102/255), 
        -1.2,1.2,1.2,      (102/255), (102/255), (102/255), 
  
  
        //kiri
        -1.2,-1.2,-1.2,    (102/255), (102/255), (102/255), 
        -1.2,1.2,-1.2,     (102/255), (102/255), (102/255), 
        -1.2,1.2,1.2,      (102/255), (102/255), (102/255), 
        -1.2,-1.2,1.2,     (102/255), (102/255), (102/255), 
        
        //kanan
        1.2,-1.2,-1.2,     (102/255), (102/255), (102/255), 
        1.2,1.2,-1.2,      (102/255), (102/255), (102/255), 
        1.2,1.2,1.2,       (102/255), (102/255), (102/255), 
        1.2,-1.2,1.2,      (102/255), (102/255), (102/255), 
  
  
        //bawah
        -1.2,-1.2,-1.2,    (102/255), (102/255), (102/255), 
        -1.2,-1.2,1.2,     (102/255), (102/255), (102/255), 
        1.2,-1.2,1.2,      (102/255), (102/255), (102/255), 
        1.2,-1.2,-1.2,     (102/255), (102/255), (102/255),
  
  
        //atas
        -1.2,1.2,-1.2,     (102/255), (102/255), (102/255), 
        -1.2,1.2,1.2,      (102/255), (102/255), (102/255), 
        1.2,1.2,1.2,       (102/255), (102/255), (102/255), 
        1.2,1.2,-1.2,      (102/255), (102/255), (102/255)
    ]
   
      // FACES:
      var handFaces = [
        0,1,2,
        0,2,3,


        4,5,6,
        4,6,7,


        8,9,10,
        8,10,11,


        12,13,14,
        12,14,15,


        16,17,18,
        16,18,19,


        20,21,22,
        20,22,23
      ];

      var headPiece = [
        -2,0,-1, (115/255), (115/255), (115/255),  
        1,0,-1, (115/255), (115/255), (115/255), 
        1,0, 1, (115/255), (115/255), (115/255), 
        -2,0, 1, (115/255), (115/255), (115/255), 
        // Top
        -2, 1, -1, (115/255), (115/255), (115/255), 
        1, 1, -1, (115/255), (115/255), (115/255), 
        1, 1, 1, (115/255), (115/255), (115/255),  
        -2, 1, 1, (115/255), (115/255), (115/255) 
      ];

      var headPieceFaces = [
        0, 1, 2,
        0, 2, 3,
        // Top
        4, 5, 6,
        4, 6, 7,
        // Side faces
        0, 1, 5,
        0, 5, 4,
        1, 2, 6,
        1, 6, 5,
        2, 3, 7,
        2, 7, 6,
        3, 0, 4,
        3, 4, 7
      ];

      var hatVertices = [
        -0.5,0,-1, (128/255), (128/255), (128/255), 
        1,0,-1, (128/255), (128/255), (128/255),  
        1,0, 1, (128/255), (128/255), (128/255),  
        -0.5,0, 1, (128/255), (128/255), (128/255),  
        // Top
        -0.5, 1, -1, (128/255), (128/255), (128/255), 
        1, 1, -1, (128/255), (128/255), (128/255),  
        1, 1, 1, (128/255), (128/255), (128/255),  
        -0.5, 1, 1, (128/255), (128/255), (128/255) 
      ];

      var hatFaces = [
        0, 1, 2,
        0, 2, 3,
        // Top
        4, 5, 6,
        4, 6, 7,
        // Side faces
        0, 1, 5,
        0, 5, 4,
        1, 2, 6,
        1, 6, 5,
        2, 3, 7,
        2, 7, 6,
        3, 0, 4,
        3, 4, 7
      ];


      LIBS.translateZ(VIEW_MATRIX,-10);


      var Badan = new MyObject(badan.vertices, badan.faces, shader_vertex_source, shader_fragment_source); Badan.setup();
      var Acc1 = new MyObject(acc1.vertices, acc1.faces, shader_vertex_source, shader_fragment_source); Acc1.setup();
      var Acc2 = new MyObject(acc1.vertices, acc1.faces, shader_vertex_source, shader_fragment_source); Acc2.setup();
      var Acc3 = new MyObject(acc1.vertices, acc1.faces, shader_vertex_source, shader_fragment_source); Acc3.setup();
      var LegLeft = new MyObject(leg.vertices, leg.faces, shader_vertex_source, shader_fragment_source); LegLeft.setup();
      var LegRight = new MyObject(leg.vertices, leg.faces, shader_vertex_source, shader_fragment_source); LegRight.setup();
      var ArmRight = new MyObject(arm.vertices, arm.faces, shader_vertex_source, shader_fragment_source); ArmRight.setup();
      var ArmLeft = new MyObject(arm.vertices, arm.faces, shader_vertex_source, shader_fragment_source); ArmLeft.setup();
      var RightPupil = new MyObject(rightPupil.vertex, rightPupil.faces, shader_vertex_source, shader_fragment_source); RightPupil.setup();
      var LeftPupil = new MyObject(leftPupil.vertex, leftPupil.faces, shader_vertex_source, shader_fragment_source); LeftPupil.setup();
      var Grass = new MyObject(grass.vertex, grass.faces, shader_vertex_source, shader_fragment_source); Grass.setup();
      var Spiral = new MyObject(LIBS.buatKurva3D(SpiralPoints, 0.1).vertices, LIBS.buatKurva3D(SpiralPoints, 1).indices, shader_vertex_source, shader_fragment_source);Spiral.setup();

      var mouth = new MyObject(LIBS.buatKurva3D(mouthPoints, 0.1).vertices, LIBS.buatKurva3D(mouthPoints, 1).indices, shader_vertex_source, shader_fragment_source);mouth.setup();
      var Batang1 = new MyObject(Wood.vertices, Wood.faces, shader_vertex_source, shader_fragment_source);Batang1.setup();
      var Daun1 = new MyObject(daun.vertices, daun.faces, shader_vertex_source, shader_fragment_source); Daun1.setup();
      var Batang2 = new MyObject(Wood.vertices, Wood.faces, shader_vertex_source, shader_fragment_source);Batang2.setup();
      var Daun2 = new MyObject(daun.vertices, daun.faces, shader_vertex_source, shader_fragment_source); Daun2.setup();
      var Topi = new MyObject(Topi.vertices, Topi.faces, shader_vertex_source, shader_fragment_source); Topi.setup();
     
      var Gumpalan1 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan1.setup();
      var Gumpalan2 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan2.setup();
      var Gumpalan3 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan3.setup();
      var Gumpalan4 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan4.setup();
      var Gumpalan5 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan5.setup();
      var Gumpalan6 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan6.setup();

      var Gumpalan7 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan7.setup();
      var Gumpalan8 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan8.setup();
      var Gumpalan9 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan9.setup();
      var Gumpalan10 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan10.setup();
      var Gumpalan11 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan11.setup();
      var Gumpalan12 = new MyObject(cloud.vertices, cloud.faces, shader_vertex_source, shader_fragment_source);Gumpalan12.setup();

    var object = new MyObject(trapezoid, trapezoid_faces, shader_vertex_source, shader_fragment_source);object.setup();
    var mouthSton = new MyObject(LIBS.buatKurva3D(stonMouth, 0.1).vertices, LIBS.buatKurva3D(stonMouth, 1).indices, shader_vertex_source, shader_fragment_source);
      mouthSton.setup();

    var legObject = new MyObject(legVertices, legFaces, shader_vertex_source, shader_fragment_source);legObject.setup();
    var legObject2 = new MyObject(legVertices, legFaces, shader_vertex_source, shader_fragment_source);legObject2.setup();
    legObject.child.push(legObject2);

    var shoulderObject = new MyObject(shoulderVertices, shoulderFaces, shader_vertex_source, shader_fragment_source);shoulderObject.setup();
    var shoulderObject2 = new MyObject(shoulderVertices, shoulderFaces, shader_vertex_source, shader_fragment_source);shoulderObject2.setup();
    shoulderObject.child.push(shoulderObject2);

    var armObject = new MyObject(armVertices, armFaces, shader_vertex_source, shader_fragment_source);armObject.setup();
    var armObject2 = new MyObject(armVertices, armFaces, shader_vertex_source, shader_fragment_source);armObject2.setup();

    armObject.child.push(armObject2);

    var handObject = new MyObject(handVertices, handFaces, shader_vertex_source, shader_fragment_source);handObject.setup();
    var handObject2 = new MyObject(handVertices, handFaces, shader_vertex_source, shader_fragment_source);handObject2.setup();

    handObject.child.push(handObject2);

    var eyeData = LIBS.EllipsoidY(0,0,0.5,0.5,100);
    for (var i = 0; i < eyeData.vertices.length; i+=6) {
      eyeData.vertices[i + 3] = 255/255; // Red component
      eyeData.vertices[i + 4] = 255/255; // Green component
      eyeData.vertices[i + 5] = 255/255; // Blue component
    };

    var eyeObject = new MyObject(eyeData.vertices, eyeData.faces, shader_vertex_source, shader_fragment_source);eyeObject.setup();
    var eyeObject2 = new MyObject(eyeData.vertices, eyeData.faces, shader_vertex_source, shader_fragment_source);eyeObject2.setup();

    eyeObject.child.push(eyeObject2);

    var headPieceObject = new MyObject(headPiece, headPieceFaces, shader_vertex_source, shader_fragment_source);headPieceObject.setup();

    var hatObject = new MyObject(hatVertices, hatFaces, shader_vertex_source, shader_fragment_source);hatObject.setup();

    var fingerData = LIBS.Cone(0, 0, 0, 0.5, 2, 100);
    for (var i = 0; i < fingerData.vertices.length; i+=6) {
      fingerData.vertices[i + 3] = 179/255; // Red component
      fingerData.vertices[i + 4] = 179/255; // Green component
      fingerData.vertices[i + 5] = 179/255; // Blue component
    };

    var fingerObject = new MyObject(fingerData.vertices, fingerData.faces, shader_vertex_source, shader_fragment_source);fingerObject.setup();
    var fingerObject2 = new MyObject(fingerData.vertices, fingerData.faces, shader_vertex_source, shader_fragment_source);fingerObject2.setup();
    var fingerObject3 = new MyObject(fingerData.vertices, fingerData.faces, shader_vertex_source, shader_fragment_source);fingerObject3.setup();
    var fingerObject4 = new MyObject(fingerData.vertices, fingerData.faces, shader_vertex_source, shader_fragment_source);fingerObject4.setup();

    fingerObject.child.push(fingerObject2);
    fingerObject.child.push(fingerObject3);
    fingerObject.child.push(fingerObject4);


    var thumbData = LIBS.Cone(0, 0, 0, 1, 2, 100);
    for (var i = 0; i < thumbData.vertices.length; i+=6) {
      thumbData.vertices[i + 3] = 179/255; // Red component
      thumbData.vertices[i + 4] = 179/255; // Green component
      thumbData.vertices[i + 5] = 179/255; // Blue component
    };

    var thumbObject = new MyObject(thumbData.vertices, thumbData.faces, shader_vertex_source, shader_fragment_source);thumbObject.setup();
    var thumbObject2 = new MyObject(thumbData.vertices, thumbData.faces, shader_vertex_source, shader_fragment_source);thumbObject2.setup();

    thumbObject.child.push(thumbObject2);
    
      /*========================= DRAWING ========================= */
      GL.clearColor(0.0, 0.0, 0.0, 0.0);


      GL.enable(GL.DEPTH_TEST);
      GL.depthFunc(GL.LEQUAL);


      var Igglybuff_position = [0,0,0];
      var goBack = false;
      var igglyLegswitch = true;
      var igglyLegLeftRotate = 0;
      var igglyLegRightRotate = 0;
      var rotate1 = false;
      var rotate2 = true;
      var rotatepeed = 0.01;

      var Stonjourner_position = [0,0,0];
      var goBack2 = false;
      var StonLegLeftRotate = 0;
      var StonLegRightRotate = 0;
      var rightLeg = true;
      var leftLeg = false;
      var fingerUp = true;
      var rotatespeed = 0.01;
      var fingerHeight = 0;
      var fingerRotate = 0;



      var time_prev = 0;
      var animate = function(time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.D_BUFFER_BIT);
        var dt = time-time_prev;
        time_prev=time;

        
        dX*=FRICTION;
        dY*=FRICTION;

        THETA += dX *2*Math.PI/CANVAS.width;
        ALPHA += dY * 2*Math.PI/CANVAS.height;
        

        WorldTHETA += pos_x *2*Math.PI/CANVAS.width;
        WorldALPHA += pos_y * 2*Math.PI/CANVAS.height;
        WorldZ += pos_z * 2*Math.PI/CANVAS.height;

        if(DaunS == true){
          ScaleDaun += 0.005;
          if(ScaleDaun >= 1.5){
            DaunS = false;
          }
        }else{
          ScaleDaun -= 0.005;
          if(ScaleDaun <= 0.5){
            DaunS = true;
          }
        }

        LIBS.translateX(VIEW_MATRIX, pos_x); LIBS.translateY(VIEW_MATRIX, pos_y); LIBS.translateZ(VIEW_MATRIX, pos_z);
        
        LIBS.setPosition(VIEW_MATRIX,0,-12,-60)
        LIBS.rotateX(VIEW_MATRIX, dY*0.01); LIBS.rotateY(VIEW_MATRIX, dX*0.01);
        LIBS.translateX(VIEW_MATRIX, 0); LIBS.translateY(VIEW_MATRIX,0); LIBS.translateZ(VIEW_MATRIX,-10);

        DAUN1_MATRIX = LIBS.get_I4();
        LIBS.translateY(DAUN1_MATRIX, 12); LIBS.translateX(DAUN1_MATRIX, 12); LIBS.translateZ(DAUN1_MATRIX, -10);
        LIBS.scale(DAUN1_MATRIX, 4+ScaleDaun, 10, 4);
        
        BATANG1_MATRIX = LIBS.get_I4();
        LIBS.translateY(BATANG1_MATRIX, 7); LIBS.translateX(BATANG1_MATRIX, 12); LIBS.translateZ(BATANG1_MATRIX, -10); 
        LIBS.scale(BATANG1_MATRIX, 1, 2, 1);

        DAUN2_MATRIX = LIBS.get_I4();
        LIBS.translateY(DAUN2_MATRIX, 12); LIBS.translateX(DAUN2_MATRIX, -22); LIBS.translateZ(DAUN2_MATRIX, -10);
        LIBS.scale(DAUN2_MATRIX, 4+ScaleDaun, 10, 4);

        BATANG2_MATRIX = LIBS.get_I4();
        LIBS.translateY(BATANG2_MATRIX, 7); LIBS.translateX(BATANG2_MATRIX, -22); LIBS.translateZ(BATANG2_MATRIX, -10);
        LIBS.scale(BATANG2_MATRIX, 1, 2, 1);

        GRASS_MATRIX = LIBS.get_I4();
        LIBS.translateY(GRASS_MATRIX, -0.5);LIBS.rotateX(GRASS_MATRIX, -Math.PI/2); LIBS.scale(GRASS_MATRIX, 40,40,40);

        Topi_MATRIX = LIBS.get_I4();
        LIBS.translateY(Topi_MATRIX, 1.5); LIBS.translateZ(Topi_MATRIX, Igglybuff_position[2]);
       
        if(AwanS == true){
          ScaleAwan += 0.005;
          if(ScaleAwan >= 1.5){
            AwanS = false;
          }
        }else{
          ScaleAwan -= 0.005;
          if(ScaleAwan <= 0.5){
            AwanS = true;
          }
        }

        GUMPALAN1_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN1_MATRIX, 40); LIBS.translateX(GUMPALAN1_MATRIX, 0); LIBS.translateZ(GUMPALAN1_MATRIX, -10);
        LIBS.scale(GUMPALAN1_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN2_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN2_MATRIX, 40); LIBS.translateX(GUMPALAN2_MATRIX, 5); LIBS.translateZ(GUMPALAN2_MATRIX, -10);
        LIBS.scale(GUMPALAN2_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN3_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN3_MATRIX, 40); LIBS.translateX(GUMPALAN3_MATRIX, -5); LIBS.translateZ(GUMPALAN3_MATRIX, -10);
        LIBS.scale(GUMPALAN3_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN4_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN4_MATRIX, 39); LIBS.translateX(GUMPALAN4_MATRIX, 0); LIBS.translateZ(GUMPALAN4_MATRIX, -8);
        LIBS.scale(GUMPALAN4_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN5_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN5_MATRIX, 39); LIBS.translateX(GUMPALAN5_MATRIX, 2); LIBS.translateZ(GUMPALAN5_MATRIX, -8);
        LIBS.scale(GUMPALAN5_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN6_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN6_MATRIX, 41); LIBS.translateX(GUMPALAN6_MATRIX, -2); LIBS.translateZ(GUMPALAN6_MATRIX, -10);
        LIBS.scale(GUMPALAN6_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);

        GUMPALAN7_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN7_MATRIX, 40); LIBS.translateX(GUMPALAN7_MATRIX, -25); LIBS.translateZ(GUMPALAN7_MATRIX, -25);
        LIBS.scale(GUMPALAN7_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN8_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN8_MATRIX, 40); LIBS.translateX(GUMPALAN8_MATRIX, -20); LIBS.translateZ(GUMPALAN8_MATRIX, -25);
        LIBS.scale(GUMPALAN8_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN9_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN9_MATRIX, 40); LIBS.translateX(GUMPALAN9_MATRIX, -30); LIBS.translateZ(GUMPALAN9_MATRIX, -25);
        LIBS.scale(GUMPALAN9_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN10_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN10_MATRIX, 39); LIBS.translateX(GUMPALAN10_MATRIX, -25); LIBS.translateZ(GUMPALAN10_MATRIX, -23);
        LIBS.scale(GUMPALAN10_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN11_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN11_MATRIX, 39); LIBS.translateX(GUMPALAN11_MATRIX, -23); LIBS.translateZ(GUMPALAN11_MATRIX, -23);
        LIBS.scale(GUMPALAN11_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);
        GUMPALAN12_MATRIX = LIBS.get_I4();
        LIBS.translateY(GUMPALAN12_MATRIX, 40); LIBS.translateX(GUMPALAN12_MATRIX, -27); LIBS.translateZ(GUMPALAN12_MATRIX, -25);
        LIBS.scale(GUMPALAN12_MATRIX, 2+ScaleAwan, 2, 2+ScaleAwan);

        if (goBack == false) {
          Igglybuff_position[2] += 0.1;
          if (Igglybuff_position[2] >= 5) {
            goBack = true;
          } 
        }else {
          Igglybuff_position[2] -= 0.1;
          if (Igglybuff_position[2] <= -5) {
            goBack = false;
          }
        }

          BADAN_MATRIX = LIBS.get_I4();
          LIBS.translateY(BADAN_MATRIX, 1); LIBS.translateZ(BADAN_MATRIX, Igglybuff_position[2]);
          if (goBack == true) {
            LIBS.rotateY(BADAN_MATRIX, Math.PI/10);
          }


          ACC1_MATRIX = LIBS.get_I4();  
          LIBS.translateZ(ACC1_MATRIX, 0.5+Igglybuff_position[2]); LIBS.translateY(ACC1_MATRIX, 1.95);

          ACC2_MATRIX = LIBS.get_I4();
          LIBS.translateZ(ACC2_MATRIX, 0.5+Igglybuff_position[2]); LIBS.translateY(ACC2_MATRIX, 1.8); LIBS.translateX(ACC2_MATRIX, 0.15);

          ACC3_MATRIX = LIBS.get_I4();
          LIBS.translateZ(ACC3_MATRIX, 0.5+Igglybuff_position[2]);  LIBS.translateY(ACC3_MATRIX, 1.8); LIBS.translateX(ACC3_MATRIX, -0.15);

          LegLeft_MATRIX = LIBS.get_I4();
          LIBS.translateY(LegLeft_MATRIX, -0.1); LIBS.translateX(LegLeft_MATRIX, 0.4); LIBS.translateZ(LegLeft_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(LegLeft_MATRIX, Math.PI/5); LIBS.rotateX(LegLeft_MATRIX, Math.PI/10);

          LegRight_MATRIX = LIBS.get_I4();
          LIBS.translateY(LegRight_MATRIX, -0.1); LIBS.translateX(LegRight_MATRIX, -0.4); LIBS.translateZ(LegRight_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(LegRight_MATRIX, -Math.PI/5); LIBS.rotateX(LegRight_MATRIX, Math.PI/10);

          ArmRight_MATRIX = LIBS.get_I4();
          LIBS.translateY(ArmRight_MATRIX, 1); LIBS.translateX(ArmRight_MATRIX, 1.03); LIBS.translateZ(ArmRight_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(ArmRight_MATRIX, Math.PI/3); LIBS.rotateX(ArmRight_MATRIX, Math.PI);

          ArmLeft_MATRIX = LIBS.get_I4();
          LIBS.translateY(ArmLeft_MATRIX, 1); LIBS.translateX(ArmLeft_MATRIX, -1); LIBS.translateZ(ArmLeft_MATRIX, Igglybuff_position[2])
          LIBS.rotateZ(ArmLeft_MATRIX, -Math.PI/3); LIBS.rotateX(ArmLeft_MATRIX, Math.PI);

          PUPIL_MATRIX = LIBS.get_I4();
          LIBS.translateZ(PUPIL_MATRIX,0.988+Igglybuff_position[2] )
          LIBS.translateY(PUPIL_MATRIX, -0.1);
          if (goBack == true) {
            LIBS.translateZ(PUPIL_MATRIX, -2);

          }
          
          MOUTH_MATRIX = LIBS.get_I4();
          LIBS.translateZ(MOUTH_MATRIX,0.5+Igglybuff_position[2]);
          LIBS.translateY(MOUTH_MATRIX, 0.3);
          LIBS.scale(MOUTH_MATRIX, 0.5,0.5,0.5);
          if (goBack == true) {
            LIBS.translateZ(MOUTH_MATRIX, -2);
          }


          SPIRAL_MATRIX = LIBS.get_I4();
          LIBS.scale(SPIRAL_MATRIX, 0.3,0.3,0.5);
          LIBS.translateY(SPIRAL_MATRIX, 1.3); LIBS.translateZ(SPIRAL_MATRIX, Igglybuff_position[2]+0.5);
          LIBS.rotateX(SPIRAL_MATRIX,-120);
          if (goBack == true) {
            LIBS.translateZ(SPIRAL_MATRIX, -1);
            LIBS.rotateX(SPIRAL_MATRIX, 35);
            LIBS.translateY(SPIRAL_MATRIX, 0.4);
          }

          //putar pada sumbu

          temp = LIBS.get_I4();
          LIBS.translateX(temp, -Igglybuff_position[0]);
          LegLeft_MATRIX = LIBS.multiply(LegLeft_MATRIX, temp);
          temp = LIBS.get_I4();
          LIBS.translateY(temp, -Igglybuff_position[1]);
          LegLeft_MATRIX = LIBS.multiply(LegLeft_MATRIX, temp);
          temp = LIBS.get_I4();
          LIBS.translateZ(temp, -Igglybuff_position[2]);

          if (rotate1 == true) {
            igglyLegLeftRotate -= 0.1;
            if(igglyLegLeftRotate <= -0.5){
              rotate1 = false;
            }
          }
          else {
            igglyLegLeftRotate += 0.1;
            if(igglyLegLeftRotate >= 0.5){
              rotate1 = true;
            }
          }
          if (goBack == true) {
            LIBS.rotateY(LegLeft_MATRIX, Math.PI/10);
          }
          if (igglyLegswitch == true) {
            temp = LIBS.get_I4();
            LIBS.rotateZ(temp, igglyLegLeftRotate);
            LegLeft_MATRIX = LIBS.multiply(LegLeft_MATRIX, temp);
            igglyLegswitch = false;
            temp = LIBS.get_I4();
            LIBS.rotateZ(temp, igglyLegLeftRotate);
            LegRight_MATRIX = LIBS.multiply(LegRight_MATRIX, temp);
            
          }
          else {
            temp = LIBS.get_I4();
            LIBS.rotateZ(temp, igglyLegLeftRotate);
            LegRight_MATRIX = LIBS.multiply(LegRight_MATRIX, temp);
            igglyLegswitch = true;
            temp = LIBS.get_I4();
            LIBS.rotateZ(temp, igglyLegLeftRotate);
            LegLeft_MATRIX = LIBS.multiply(LegLeft_MATRIX, temp);
          }

          temp = LIBS.get_I4();
          LIBS.translateX(temp, -Igglybuff_position[0]);
          LegRight_MATRIX = LIBS.multiply(LegRight_MATRIX, temp);
          temp = LIBS.get_I4();
          LIBS.translateY(temp, -Igglybuff_position[1]);
          LegRight_MATRIX = LIBS.multiply(LegRight_MATRIX, temp);
          temp = LIBS.get_I4();
          LIBS.translateZ(temp, -Igglybuff_position[2]);

          if (rotate2 == true) {
            igglyLegRightRotate -= rotatepeed;
            if(igglyLegRightRotate <= -0.35){
              rotate2 = false;
            }
          }
          else {
            igglyLegRightRotate += rotatepeed;
            if(igglyLegRightRotate >= 0.35){
              rotate2 = true;
            }
          }

          

          Badan.MODEL_MATRIX=BADAN_MATRIX; Badan.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Acc1.MODEL_MATRIX=ACC1_MATRIX; Acc1.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Acc2.MODEL_MATRIX=ACC2_MATRIX; Acc2.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Acc3.MODEL_MATRIX=ACC3_MATRIX; Acc3.render(VIEW_MATRIX, PROJECTION_MATRIX);
          LegLeft.MODEL_MATRIX=LegLeft_MATRIX; LegLeft.render(VIEW_MATRIX, PROJECTION_MATRIX);
          LegRight.MODEL_MATRIX=LegRight_MATRIX; LegRight.render(VIEW_MATRIX, PROJECTION_MATRIX);
          ArmRight.MODEL_MATRIX=ArmRight_MATRIX; ArmRight.render(VIEW_MATRIX, PROJECTION_MATRIX);
          ArmLeft.MODEL_MATRIX=ArmLeft_MATRIX; ArmLeft.render(VIEW_MATRIX, PROJECTION_MATRIX);
          RightPupil.MODEL_MATRIX=PUPIL_MATRIX; RightPupil.render(VIEW_MATRIX, PROJECTION_MATRIX);
          LeftPupil.MODEL_MATRIX=PUPIL_MATRIX; LeftPupil.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Grass.MODEL_MATRIX=GRASS_MATRIX; Grass.render(VIEW_MATRIX, PROJECTION_MATRIX);;
          Spiral.MODEL_MATRIX=SPIRAL_MATRIX ; Spiral.render(VIEW_MATRIX, PROJECTION_MATRIX);
          mouth.MODEL_MATRIX=MOUTH_MATRIX; mouth.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Batang1.MODEL_MATRIX = BATANG1_MATRIX; Batang1.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Daun1.MODEL_MATRIX=DAUN1_MATRIX; Daun1.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Batang2.MODEL_MATRIX = BATANG2_MATRIX; Batang2.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Daun2.MODEL_MATRIX=DAUN2_MATRIX; Daun2.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan1.MODEL_MATRIX = GUMPALAN1_MATRIX; Gumpalan1.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan2.MODEL_MATRIX = GUMPALAN2_MATRIX; Gumpalan2.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan3.MODEL_MATRIX = GUMPALAN3_MATRIX; Gumpalan3.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan4.MODEL_MATRIX = GUMPALAN4_MATRIX; Gumpalan4.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan5.MODEL_MATRIX = GUMPALAN5_MATRIX; Gumpalan5.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan6.MODEL_MATRIX = GUMPALAN6_MATRIX; Gumpalan6.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan7.MODEL_MATRIX = GUMPALAN7_MATRIX; Gumpalan7.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan8.MODEL_MATRIX = GUMPALAN8_MATRIX; Gumpalan8.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan9.MODEL_MATRIX = GUMPALAN9_MATRIX; Gumpalan9.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan10.MODEL_MATRIX = GUMPALAN10_MATRIX; Gumpalan10.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan11.MODEL_MATRIX = GUMPALAN11_MATRIX; Gumpalan11.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Gumpalan12.MODEL_MATRIX = GUMPALAN12_MATRIX; Gumpalan12.render(VIEW_MATRIX, PROJECTION_MATRIX);
          Topi.MODEL_MATRIX=Topi_MATRIX; Topi.render(VIEW_MATRIX, PROJECTION_MATRIX);
         

          if (goBack2 == false) {
            Stonjourner_position[2] += 0.1;
            if (Stonjourner_position[2] >= 30) {
              goBack2 = true;
            } 
          }else {
            Stonjourner_position[2] -= 0.1;
            if (Stonjourner_position[2] <= -30) {
              goBack2 = false;
            }
          }

        headModelMatrix = LIBS.get_I4();
        LIBS.translateX(headModelMatrix, -8);
        LIBS.translateY(headModelMatrix, 8.6);
        LIBS.translateZ(headModelMatrix, Stonjourner_position[2]);
        if (goBack2 == true) {
          LIBS.rotateY(BADAN_MATRIX, Math.PI/10);
        }

        object.MODEL_MATRIX = headModelMatrix;
        object.render(VIEW_MATRIX, PROJECTION_MATRIX);

        legModelMatrix = LIBS.get_I4();
        if(rightLeg == false){
          StonLegRightRotate += rotatepeed;
          if(StonLegRightRotate >= 0.65){
            rightLeg = true;
          }
        }else{
          StonLegRightRotate -= rotatepeed;
          if(StonLegRightRotate <= -0.65){
            rightLeg = false;
          }
        }

        LIBS.translateX(legModelMatrix, -4); 
        LIBS.translateY(legModelMatrix, 7.6); 
        LIBS.translateZ(legModelMatrix, Stonjourner_position[2]);
        LIBS.rotateX(legModelMatrix, StonLegRightRotate);

        legObject.MODEL_MATRIX = legModelMatrix;
        legObject.render(VIEW_MATRIX, PROJECTION_MATRIX);


        legModelMatrix2 = LIBS.get_I4();
        if(leftLeg == true){
          StonLegLeftRotate -= rotatepeed;
          if(StonLegLeftRotate <= -0.65){
            leftLeg = false;
          }
        }else{
          StonLegLeftRotate += rotatepeed;
          if(StonLegLeftRotate >= 0.65){
            leftLeg = true;
          }
        }
        
        LIBS.translateX(legModelMatrix2, -12);
        LIBS.translateY(legModelMatrix2, 7.6);
        LIBS.translateZ(legModelMatrix2, Stonjourner_position[2]);
        LIBS.rotateX(legModelMatrix2, StonLegLeftRotate);

        legObject2.MODEL_MATRIX = legModelMatrix2;
        legObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        shoulderModelMatrix = LIBS.get_I4();

        LIBS.translateX(shoulderModelMatrix, -3);
        LIBS.translateY(shoulderModelMatrix, 10.6);
        LIBS.translateZ(shoulderModelMatrix, Stonjourner_position[2]);
        LIBS.rotateZ(shoulderModelMatrix, -1);

        shoulderObject.MODEL_MATRIX = shoulderModelMatrix;
        shoulderObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        shoulderModelMatrix2 = LIBS.get_I4();

        LIBS.translateX(shoulderModelMatrix2, -13);
        LIBS.translateY(shoulderModelMatrix2, 10.6);
        LIBS.translateZ(shoulderModelMatrix2, Stonjourner_position[2]);
        LIBS.rotateZ(shoulderModelMatrix2, 1);

        shoulderObject2.MODEL_MATRIX = shoulderModelMatrix2;
        shoulderObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        armModelMatrix = LIBS.get_I4();

        LIBS.translateX(armModelMatrix, -2);
        LIBS.translateY(armModelMatrix, 11.65);
        LIBS.translateZ(armModelMatrix, Stonjourner_position[2]);
        LIBS.rotateZ(armModelMatrix, 1);

        armObject.MODEL_MATRIX = armModelMatrix;
        armObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        armModelMatrix2 = LIBS.get_I4();

        LIBS.translateX(armModelMatrix2, -14);
        LIBS.translateY(armModelMatrix2, 11.65);
        LIBS.translateZ(armModelMatrix2, Stonjourner_position[2]);
        LIBS.rotateZ(armModelMatrix2, -1);

        armObject2.MODEL_MATRIX = armModelMatrix2;
        armObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        handModelMatrix = LIBS.get_I4();

        LIBS.translateX(handModelMatrix, -2);
        LIBS.translateY(handModelMatrix, 13.7);
        LIBS.translateZ(handModelMatrix, Stonjourner_position[2]);

        handObject.MODEL_MATRIX = handModelMatrix;
        handObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        handModelMatrix2 = LIBS.get_I4();

        LIBS.translateX(handModelMatrix2, -14);
        LIBS.translateY(handModelMatrix2, 13.7);
        LIBS.translateZ(handModelMatrix2, Stonjourner_position[2]);

        handObject2.MODEL_MATRIX = handModelMatrix2;
        handObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        headPieceModelMatrix = LIBS.get_I4();

        LIBS.translateX(headPieceModelMatrix, -7.5);
        LIBS.translateY(headPieceModelMatrix, 11.6);
        LIBS.translateZ(headPieceModelMatrix, Stonjourner_position[2]);

        headPieceObject.MODEL_MATRIX = headPieceModelMatrix;
        headPieceObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        hatModelMatrix = LIBS.get_I4();

        LIBS.translateX(hatModelMatrix, -8.2);
        LIBS.translateY(hatModelMatrix, 12.6);
        LIBS.translateZ(hatModelMatrix, Stonjourner_position[2]);

        hatObject.MODEL_MATRIX = hatModelMatrix;
        hatObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        eyeModelMatrix = LIBS.get_I4();

        LIBS.translateX(eyeModelMatrix, -7);
        LIBS.translateY(eyeModelMatrix, 10.6);
        LIBS.translateZ(eyeModelMatrix, 0.2+Stonjourner_position[2]);
        if (goBack2 == true) {
          LIBS.translateZ(eyeModelMatrix, -1.5);

        }

        eyeObject.MODEL_MATRIX = eyeModelMatrix;
        eyeObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        eyeModelMatrix2 = LIBS.get_I4();

        LIBS.translateX(eyeModelMatrix2, -9);
        LIBS.translateY(eyeModelMatrix2, 10.6);
        LIBS.translateZ(eyeModelMatrix2, 0.2+Stonjourner_position[2]);
        if (goBack2 == true) {
          LIBS.translateZ(eyeModelMatrix2, -1.5);

        }

        eyeObject2.MODEL_MATRIX = eyeModelMatrix2;
        eyeObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        fingerModelMatrix = LIBS.get_I4();
        if(fingerUp == true){
          fingerRotate += 0.01;
          if(fingerRotate >= Math.PI/8){
            fingerUp = false;
          }
        }else{
          fingerRotate -= 0.01;
          if(fingerRotate <= 0){
            fingerUp = true;
          }
        }

        LIBS.translateX(fingerModelMatrix, -2.5);
        LIBS.translateY(fingerModelMatrix, 14.9);
        LIBS.translateZ(fingerModelMatrix, Stonjourner_position[2]);
        LIBS.rotateZ(fingerModelMatrix, fingerRotate);
        
        fingerObject.MODEL_MATRIX = fingerModelMatrix;
        fingerObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        fingerModelMatrix2 = LIBS.get_I4();
        

        LIBS.translateX(fingerModelMatrix2, -1.4);
        LIBS.translateY(fingerModelMatrix2, 14.9);
        LIBS.translateZ(fingerModelMatrix2, Stonjourner_position[2]);
        LIBS.rotateZ(fingerModelMatrix2, -fingerRotate);

        fingerObject2.MODEL_MATRIX = fingerModelMatrix2;
        fingerObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        fingerModelMatrix3 = LIBS.get_I4();

        LIBS.translateX(fingerModelMatrix3, -13.5);
        LIBS.translateY(fingerModelMatrix3, 14.9);
        LIBS.translateZ(fingerModelMatrix3, Stonjourner_position[2]);
        LIBS.rotateZ(fingerModelMatrix3, -fingerRotate);

        fingerObject3.MODEL_MATRIX = fingerModelMatrix3;
        fingerObject3.render(VIEW_MATRIX, PROJECTION_MATRIX);

        fingerModelMatrix4 = LIBS.get_I4();

        LIBS.translateX(fingerModelMatrix4, -14.6);
        LIBS.translateY(fingerModelMatrix4, 14.9);
        LIBS.translateZ(fingerModelMatrix4, Stonjourner_position[2]);
        LIBS.rotateZ(fingerModelMatrix4, fingerRotate);

        fingerObject4.MODEL_MATRIX = fingerModelMatrix4;
        fingerObject4.render(VIEW_MATRIX, PROJECTION_MATRIX);


        thumbModelMatrix = LIBS.get_I4();

        LIBS.translateX(thumbModelMatrix, -3);
        LIBS.translateY(thumbModelMatrix, 13.7);
        LIBS.translateZ(thumbModelMatrix, Stonjourner_position[2]);
        LIBS.rotateZ(thumbModelMatrix, 1.55);

        thumbObject.MODEL_MATRIX = thumbModelMatrix;
        thumbObject.render(VIEW_MATRIX, PROJECTION_MATRIX);

        thumbModelMatrix2 = LIBS.get_I4();

        LIBS.translateX(thumbModelMatrix2, -12.9);
        LIBS.translateY(thumbModelMatrix2, 13.7);
        LIBS.translateZ(thumbModelMatrix2, Stonjourner_position[2]);
        LIBS.rotateZ(thumbModelMatrix2, -1.55);

        thumbObject2.MODEL_MATRIX = thumbModelMatrix2;
        thumbObject2.render(VIEW_MATRIX, PROJECTION_MATRIX);

        mouthModelMatrix = LIBS.get_I4();

        LIBS.translateX(mouthModelMatrix, -8);
        LIBS.translateY(mouthModelMatrix, 9.6);
        LIBS.translateZ(mouthModelMatrix, Stonjourner_position[2]);
        if (goBack2 == true) {
          LIBS.translateZ(mouthModelMatrix, -2);
        }

        mouthSton.MODEL_MATRIX = mouthModelMatrix;
        mouthSton.render(VIEW_MATRIX, PROJECTION_MATRIX);

      
          // Curve.MODEL_MATRIX=MODEL_MATRIX10; Curve.render(VIEW_MATRIX, PROJECTION_MATRIX);

          window.requestAnimationFrame(animate);
      };
 
 
      animate(0);
  }
  window.addEventListener('load',main);
 
 



