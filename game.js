const width = window.innerWidth || document.documentElement.clientWidth ||
    document.body.clientWidth;
const height = window.innerHeight || document.documentElement.clientHeight ||
    document.body.clientHeight;
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

var vertexAttrib;
var normalAttrib;
var uvAttrib;
// set up the webGL environment
function setupWebGL() {

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
        attribute vec2 aTextureCoord; // uv coord

        varying highp vec2 vTextureCoord; //interpolated uv

        uniform mat4 model; // the model matrix
        uniform mat4 viewProj; // the project view model matrix

        void main(void) {
            vTextureCoord = aTextureCoord;
            gl_Position = viewProj * vec4(aVertexPosition, 1.0);
        }`;

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        uniform sampler2D uSampler;
        varying highp vec2 vTextureCoord;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
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

                uvAttrib = gl.getAttribLocation(shaderProgram, "aTextureCoord");
                gl.enableVertexAttribArray(uvAttrib);
                // locate vertex uniforms
                modelUniform = gl.getUniformLocation(shaderProgram, "model"); // ptr to mmat
                viewUniform = gl.getUniformLocation(shaderProgram, "viewProj"); // ptr to pvmmat
                samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 

    catch (e) {
        console.log(e);
    } // end catch
}

function setupGrid() {
    tetris = new Tetris(width, height);

}

function renderGrid() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    tetris.render();
} // end render triangles
function main() {
    setupWebGL();
    setupShaders();
    setupGrid();
    renderGrid();
} // end main