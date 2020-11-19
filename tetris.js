//function for loading texture
// created with help of https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/
function loadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    var image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {

            gl.generateMipmap(gl.TEXTURE_2D);
        } else {

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;
    //console.log(image);

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

class Tetris {
    constructor(canvasWidth, canvasHeight, background="galaxy.jpg") {
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.backgroundTexture = loadTexture(background);
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.depth = 40;
        this.tetriminos = [];
        this.vertexBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
        this.backgroundVertices = [];
        this.backgroundIndices = [];
        this.backgroundUVs = [];
        this.eye = vec3.fromValues(0, this.height / 2, -1);
        this.viewMatrix = mat4.lookAt(mat4.create(), this.eye, vec3.fromValues(0, this.height / 2, 1), vec3.fromValues(0, 1, 0));
        var fovy = 2 * Math.atan2(this.depth, this.height / 2);
        var perspective = mat4.perspective(mat4.create(), fovy, this.width / this.height, 1e-4, 1e4);
        mat4.multiply(this.viewMatrix, perspective, this.viewMatrix);
        this.initializeBackground();
    }
    initializeBackground() {
        this.backgroundVertices.push(this.width / 2, 0, this.depth, -this.width / 2, 0, this.depth, this.width / 2, this.height, this.depth, -this.width / 2, this.height, this.depth);
        this.backgroundIndices.push(0, 1, 2, 2, 1, 3);
        this.backgroundUVs.push(0, 0, 1, 0, 1, 0, 1, 1);
    }
    addTetrimino(type) {

    }

    render() {
        console.log('render');
        gl.uniformMatrix4fv(viewUniform, false, this.viewMatrix);
        this.renderBackground();
        this.renderBlocks();
        this.renderUI();
    }

    renderBlocks() {

    }
    renderUI() {

    }

    renderBackground() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.backgroundVertices),gl.STATIC_DRAW); // coords to that buffer
        gl.vertexAttribPointer(vertexAttrib,3,gl.FLOAT,false,0,0);
        gl.vertexAttribPointer(normalAttrib,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.backgroundUVs),gl.STATIC_DRAW); // coords to that buffer
        gl.vertexAttribPointer(uvAttrib,2,gl.FLOAT,false,0,0);

        //textures
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.backgroundIndices), gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, this.backgroundIndices.length, gl.UNSIGNED_SHORT, 0);
    }
    clearRow() {

    }
}

class Tetrimino {
    constructor(type) {

    }

    rotate() {

    }

    drop() {

    }

    moveLeft() {

    }

    moveRight() {

    }

    render() {

    }

    moveDown() {

    }
}

class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}