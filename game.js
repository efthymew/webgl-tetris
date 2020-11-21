/**
 * PROG5 - Tetris in WebGL by Graham Efthymiou
 * CSC461 Fall 2020
 * gefthym
 * game.js
 */

const width = 1024
const height = 576
/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var tetris = null;
//uniform locations
var diffuseUniform;
var ambientUniform;
var specularUniform;

//uniform matrices
var viewUniform;
var modelUniform;
var samplerUniform;

var diffuseUniform;
var ambientUniform;
var specularUniform;

var eyeUniform;
var vertexAttrib;
var normalAttrib;
var uvAttrib;

var gameOver = false;
// set up the webGL environment
function setupWebGL() {
    document.onkeypress = onKeyDown;
    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
        }
    } // end try

    catch (e) {
        console.log(e);
    } // end catch

} // end setupWebGL
function setupShaders() {
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal

        uniform mat4 model; // the model matrix
        uniform mat4 viewProj; // the project view model matrix

        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader

        void main(void) {
            aVertexNormal;
            vec4 newPos = model * vec4(aVertexPosition, 1.0);
            vWorldPos = newPos.xyz;
            vVertexNormal = normalize(aVertexNormal);
            gl_Position = viewProj * newPos;
        }`;

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision
        uniform vec3 diffuseU;
        uniform vec3 ambientU;
        uniform vec3 specularU;
        uniform vec3 eyeLoc;

        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader

        void main(void) {
            vec3 lightA = vec3(1.0, 1.0, 1.0);
            vec3 lightD = vec3(1.0, 1.0, 1.0);
            vec3 lightS = vec3(1.0, 1.0, 1.0);
            vec3 lightPos = vec3(1024 / 2, 576 / 2, 600);
            
            // ambient term
            vec3 ambient = ambientU*lightA; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(lightPos - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = diffuseU*lightD*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(eyeLoc - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),100.0);
            vec3 specular = specularU*lightS*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet
            gl_FragColor = vec4(colorOut, 1.0);
        }`;

    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader, fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader, vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)

                // locate and enable vertex attributes
                vertexAttrib = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vertexAttrib); // connect attrib to array
                normalAttrib = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(normalAttrib); // connect attrib to array
                // locate vertex uniforms
                modelUniform = gl.getUniformLocation(shaderProgram, "model"); // ptr to mmat
                diffuseUniform = gl.getUniformLocation(shaderProgram, "diffuseU");
                ambientUniform = gl.getUniformLocation(shaderProgram, "ambientU");
                specularUniform = gl.getUniformLocation(shaderProgram, "specularU");
                viewUniform = gl.getUniformLocation(shaderProgram, "viewProj"); // ptr to pvmmat
                samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
                eyeUniform = gl.getUniformLocation(shaderProgram, "eyeLoc");
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 

    catch (e) {
        console.log(e);
    } // end catch
}

function setupGrid() {
    //third param is whether u want the game in real 3d or not (ortho vs perspective)
    tetris = new Tetris(width, height, true);

}

function renderGrid() {
    window.requestAnimationFrame(renderGrid);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    tetris.gameOver();
    tetris.render();
} // end render triangles
function main() {
    setupWebGL();
    setupShaders();
    setupGrid();
    renderGrid();
    autoMovePiece();
} // end main

function autoMovePiece() {
    if (!gameOver) {
        if (tetris.willCollide("down")) {
            tetris.plantOnGrid(tetris.player);
            tetris.newPlayerPiece();
        } else {
            tetris.player.y--;
        }
        setTimeout(autoMovePiece, 1000);
    } else {
        console.log('game over');
        window.cancelAnimationFrame(renderGrid);
    }
}