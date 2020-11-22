/**
 * PROG5 - Tetris in WebGL by Graham Efthymiou
 * CSC461 Fall 2020
 * gefthym
 * tetris.js
 */

var gridOffset;
var xOffset;
var yOffset;
var vertexBuffer;
var normalBuffer;
var indexBuffer;
var pieces = ["I", "T", "L", "J", "S", "Z", "O"];
class Tetris {
    constructor(canvasWidth, canvasHeight, threeD) {
        this.player = null
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //this.backgroundTexture = loadTexture(background);
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.depth = 40;
        this.tetriminos = [];
        vertexBuffer = gl.createBuffer();
        normalBuffer = gl.createBuffer();
        indexBuffer = gl.createBuffer();
        this.backgroundVertices = [];
        this.normals = [];
        this.backgroundIndices = [];
        this.grid = this.createGrid(width, height);
        gridOffset = width / 3;
        xOffset = (width / 3) / 10;
        yOffset = height / 20;
        var projection;
        if (!threeD) {
            this.eye = vec3.fromValues(width / 2, this.height / 2, 0);
            this.viewMatrix = mat4.lookAt(mat4.create(), this.eye, vec3.fromValues(width / 2, this.height / 2, this.depth), vec3.fromValues(0, 1, 0));
            //ortho
            projection = mat4.ortho(mat4.create(), -this.width + (this.width / 2), this.width / 2, -this.height + (this.height / 2), this.height / 2, 0, this.depth + 1);
        } else {
            this.eye = vec3.fromValues(width / 2, this.height / 2, 0);
            this.viewMatrix = mat4.lookAt(mat4.create(), this.eye, vec3.fromValues(width / 2, this.height / 2, this.depth), vec3.fromValues(0, 1, 0));
            //perspective
            projection = mat4.perspective(mat4.create(), Math.PI / 1.09, width / height, 0.1, this.width);
        }
        mat4.multiply(this.viewMatrix, projection, this.viewMatrix);
        this.initializeBackground();
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        this.player = new Tetrimino(piece, 4, 18);
        gl.uniform3fv(eyeUniform, this.eye);
    }
    initializeBackground() {
        this.backgroundVertices = [];
        this.backgroundIndices = [];
        this.normals = [];
        this.backgroundVertices.push(this.width, 0, this.depth, 0, 0, this.depth, this.width, this.height, this.depth, 0, this.height, this.depth);
        for (let i = 0; i < 4; i++) {
            this.normals.push(0, 0, 1);
        }
        //add width gridlines to vertices
        for (let i = 0; i <= 10; i++) {
            this.backgroundVertices.push(gridOffset + xOffset * i, this.height, this.depth - 1);
            this.backgroundVertices.push(gridOffset + xOffset * i, 0, this.depth - 1);
            this.normals.push(0, 0, 1);
            this.normals.push(0, 0, 1);
        }
        //add height gridlines
        for (let i = 0; i <= 20; i++) {
            this.backgroundVertices.push(gridOffset, yOffset * i, this.depth - 1);
            this.backgroundVertices.push(2 * gridOffset, yOffset * i, this.depth - 1);
            this.normals.push(0, 0, 1);
            this.normals.push(0, 0, 1);
        }
        //console.log(this.backgroundVertices);
        this.backgroundIndices.push(0, 1, 2, 2, 1, 3);
    }
    clearRows() {
        for (let y = 0; y < 20; y++) {
            let count = 0;
            for (let x = 0; x < 10; x++) {
                if (this.grid[x][y] == null) {
                    break;
                } else {
                    count++;
                }
            }
            if (count == 10) {
                //clear row
                if (y == 19) {
                    for (let i = 0; i < 10; i++) {
                        this.grid[i][y] = null;
                    }
                } else {
                    for (let j = y; j < 20; j++) {
                        for (let i = 0; i < 10; i++) {
                            this.grid[i][j] = this.grid[i][j + 1];
                            if (this.grid[i][j] != null) {
                                mat4.translate(this.grid[i][j].modelMat, this.grid[i][j].modelMat, vec3.fromValues(0, -yOffset, 0));
                            }
                        }
                    }
                    //decrement y to recheck dropped pieces
                    y--;
                }
            }
        }
    }
    newPlayerPiece() {
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        this.player = new Tetrimino(piece, 4, 18);
    }
    addTetrimino(type) {

    }
    gameOver() {
        //console.log('checking');
        for (let i = 0; i < 10; i++) {
            if (this.grid[i][19] != null) {
                gameOver = true;
                return;
            }
        }
        gameOver = false;
    }
    createGrid(width, height) {
        //10 by 20
        var grid = [];
        for (let x = 0; x < 10; x++) {
            grid[x] = [];
            for (let y = 0; y < 20; y++) {
                grid[x][y] = null;
            }
        }
        return grid;
    }
    render() {
        //window.requestAnimationFrame(this.render);
        //console.log('render');
        //if piece will collide now plant it down and spawn new piece
        gl.uniformMatrix4fv(viewUniform, false, this.viewMatrix);
        this.initializeBackground();
        this.renderBackground();
        this.renderUI();
        //test render block at block index 0, 0
        //this.plantOnGrid(new Tetrimino("T", 4, 16));
        this.renderBlocks();
        //if game is over dont render player
        if (!gameOver) {
            this.renderPlayer();
        } else {
            //render game over text
            var canvas = document.getElementById("otherCanvas");
            //console.log(canvas);
            var ctx = canvas.getContext("2d");
            //console.log(ctx);
            ctx.font = "80pt Calibri";
            ctx.fillStyle = 'white';
            ctx.fillText("GAME OVER!", width / 4.5, height / 2);
        }
        //window.requestAnimationFrame(this.render);
    }

    renderPlayer() {
        if (this.player != null) {
            if (this.player.type == "O" || this.player.type == "I") {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.player.grid[i][j] != null) {
                            this.player.grid[i][j].modelMat = mat4.fromTranslation(mat4.create(),
                                    vec3.fromValues(xOffset*this.player.x + xOffset*i + gridOffset,
                                            yOffset*this.player.y + yOffset*j, this.depth - 4));
                            this.player.grid[i][j].render();
                        }
                    }
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (this.player.grid[i][j] != null) {
                            this.player.grid[i][j].modelMat = mat4.fromTranslation(mat4.create(),
                                vec3.fromValues(xOffset*this.player.x + xOffset*i + gridOffset,
                                            yOffset*this.player.y + yOffset*j, this.depth - 4));
                            this.player.grid[i][j].render();
                        }
                    }
                }
            }
        }
    }
    plantOnGrid(tetrimino) {
        if (tetrimino.type == "O" || tetrimino.type == "I") {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let x = tetrimino.x + i;
                    let y = tetrimino.y + j;
                    if (x > 9 || x < 0) continue;
                    if (y < 0) continue;
                    if (this.grid[x][y] == null)
                        this.grid[x][y] = tetrimino.grid[i][j];
                    if (this.grid[x][y] != null) {
                        this.grid[x][y].modelMat = mat4.fromTranslation(mat4.create(),
                            vec3.fromValues(xOffset*tetrimino.x + xOffset*i + gridOffset,
                                            yOffset*tetrimino.y + yOffset*j, this.depth - 4));
                    }
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let x = tetrimino.x + i;
                    let y = tetrimino.y + j;
                    if (x > 9 || x < 0) continue;
                    if (y < 0) continue;
                    if (this.grid[x][y] == null)
                        this.grid[x][y] = tetrimino.grid[i][j];
                    if (this.grid[x][y] != null) {
                        this.grid[x][y].modelMat = mat4.fromTranslation(mat4.create(),
                            vec3.fromValues(xOffset*tetrimino.x + xOffset*i + gridOffset,
                                            yOffset*tetrimino.y + yOffset*j, this.depth - 4));
                    }
                }
            }
        }
        tetris.clearRows();
    }
    renderBlocks() {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 20; j++) {
                if (this.grid[i][j] != null) {
                    //console.log(this.grid[i][j]);
                    this.grid[i][j].render();
                }
            }
        }
    }
    renderUI() {

    }
    rotate() {
        // square doesnt rotate
        if (this.player.type == "O") return;
        const rotatedGrid = this.player.rotate();
        if (this.validRotate(rotatedGrid)) {
            this.player.grid = rotatedGrid;
        }
    }

    validRotate(grid) {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                //if this new space and grid space overlap no rotate
                if (grid[i][j] != null) {
                    const realI = i + this.player.x;
                    const realJ = j + this.player.y;
                    if (realJ > 19) continue;
                    if (realI < 0 || realI > 9 || realJ < 0) {
                        return false;
                    } else if (this.grid[realI][realJ] != null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    willCollide(dir) {
        const piece = this.player;
        if (piece == null) return;
        if (dir == "down") {
            if (piece.type == "O" || piece.type == "I") {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (piece.grid[i][j] != null) {
                            const newJ = j + piece.y - 1;
                            if (i + piece.x < 0 || i + piece.x > 9) {
                                continue;
                            }
                            if (newJ < 0) {
                                return true;
                            } else if (this.grid[i + piece.x][newJ] != null) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (piece.grid[i][j] != null) {
                            const newJ = j + piece.y - 1;
                            if (i + piece.x < 0 || i + piece.x > 9) {
                                continue;
                            }
                            if (newJ < 0) {
                                return true;
                            } else if (this.grid[i + piece.x][newJ] != null) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        if (dir == "left") {
            if (piece.type == "O" || piece.type == "I") {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (piece.grid[i][j] != null) {
                            const newI = i + piece.x + 1;
                            if (i + piece.x < 0) {
                                continue;
                            }
                            if (newI > 9) {
                                return true;
                            } else if (this.grid[newI][j + piece.y] != null) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (piece.grid[i][j] != null) {
                            const newI = i + piece.x + 1;
                            if (i + piece.x < 0) {
                                continue;
                            }
                            if (newI > 9) {
                                return true;
                            } else if (this.grid[newI][j + piece.y] != null) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        if (dir == "right") {
            if (piece.type == "O" || piece.type == "I") {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (piece.grid[i][j] != null) {
                            const newI = i + piece.x - 1;
                            if (i + piece.x > 9) {
                                continue;
                            }
                            if (newI < 0) {
                                return true;
                            } else if (this.grid[newI][j + piece.y] != null) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (piece.grid[i][j] != null) {
                            const newI = i + piece.x - 1;
                            if (i + piece.x > 9) {
                                continue;
                            }
                            if (newI < 0) {
                                return true;
                            } else if (this.grid[newI][j + piece.y] != null) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    renderBackground() {
        gl.uniformMatrix4fv(modelUniform, false, mat4.create());
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.backgroundVertices), gl.STATIC_DRAW); // coords to that buffer
        gl.vertexAttribPointer(vertexAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW); // coords to that buffer
        //console.log(this.normals);
        gl.vertexAttribPointer(normalAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.uniform3fv(diffuseUniform, [0.86, 0.86, 0.86]);
        gl.uniform3fv(ambientUniform, [0.1, 0.1, 0.1]);
        gl.uniform3fv(specularUniform, [0.3, 0.3, 0.3]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.backgroundIndices), gl.STATIC_DRAW);
        //don't render background its ugly
        //gl.drawElements(gl.TRIANGLES, this.backgroundIndices.length, gl.UNSIGNED_SHORT, 0);

        //gridlines
        gl.uniform3fv(diffuseUniform, [1, 1, 1]);
        this.backgroundIndices = [];
        for (let i = 1; i <= 22; i++) {
            this.backgroundIndices.push(3 + i);
        }
        //add height gridlines
        for (let i = 1; i <= 42; i++) {
            this.backgroundIndices.push(25 + i);
        }
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.backgroundIndices), gl.STATIC_DRAW);
        gl.drawElements(gl.LINES, this.backgroundIndices.length, gl.UNSIGNED_SHORT, 0);
    }
    clearRow() {

    }
}

class Tetrimino {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;

        //color
        if (type == "T") {
            this.color = [0.9, 0.33, 0.5];
        }
        if (type == "I") {
            this.color = [0.88, 0.7, 1.0];
        }
        if (type == "O") {
            this.color = [1.0, 1.0, 0.0];
        }
        if (type == "J") {
            this.color = [0.0, 0.0, 1];
        }
        if (type == "L") {
            this.color = [1.0, 0.65, 0.0];
        }
        if (type == "S") {
            this.color = [0.0, 1.0, 0.0];
        }
        if (type == "Z") {
            this.color = [1.0, 0.0, 0.0];
        }
        this.grid = this.createGrid(type);
    }

    createGrid(type) {
        var grid = []
        if (type == "I") {
            grid = [
                [null, new Block(this.color), null, null],
                [null, new Block(this.color), null, null],
                [null, new Block(this.color), null, null],
                [null, new Block(this.color), null, null]
            ]
        }
        if (type == "L") {
            grid = [
                [null, new Block(this.color), null],
                [null, new Block(this.color), null],
                [null, new Block(this.color), new Block(this.color)]
            ]
        }
        if (type == "J") {
            grid = [
                [null, new Block(this.color), null],
                [null, new Block(this.color), null],
                [new Block(this.color), new Block(this.color), null]
            ]
        }
        if (type == "O") {
            grid = [
                [null, new Block(this.color), new Block(this.color), null],
                [null, new Block(this.color), new Block(this.color), null],
                [null, null, null, null],
                [null, null, null, null]
            ]
        }
        if (type == "T") {
            grid = [
                [null, null, null],
                [new Block(this.color), new Block(this.color), new Block(this.color)],
                [null, new Block(this.color), null]
            ]
        }
        if (type == "S") {
            grid = [
                [null, new Block(this.color), new Block(this.color)],
                [new Block(this.color), new Block(this.color), null],
                [null, null, null]
            ]
        }
        if (type == "Z") {
            grid = [
                [new Block(this.color), new Block(this.color), null],
                [null, new Block(this.color), new Block(this.color)],
                [null, null, null]
            ]
        }
        return grid;
    }

    rotate() {
        var newGrid = this.grid.map(function(arr) {
            return arr.slice();
        });
        const n = this.grid.length;
        const x = Math.floor(n / 2);
        const y = n - 1;
        for (let i = 0; i < x; i++) {
            for (let j = i; j < y - i; j++) {
                let k = newGrid[i][j];
                newGrid[i][j] = newGrid[y - j][i];
                newGrid[y - j][i] = newGrid[y - i][y - j];
                newGrid[y - i][y - j] = newGrid[j][y - i]
                newGrid[j][y - i] = k
            }
        }
        return newGrid;
    }

    render() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.grid[i][j].render();
            }
        }
    }
}

class Block {
    constructor(color) {
        this.color = color;
        this.modelMat = mat4.create();
        this.vertices = [
            // Front face
            0, 0, 0,
            xOffset, 0, 0,
            xOffset, yOffset, 0,
            0, yOffset, 0,

            // Back face
            0.0, 0.0, 3,
            xOffset, 0.0, 3,
            xOffset, yOffset, 3,
            0.0, yOffset, 3,

            // Top face
            0, yOffset, 0,
            xOffset, yOffset, 0.0,
            xOffset, yOffset, 3,
            0, yOffset, 3,

            // Bottom face
            0, 0, 0,
            xOffset, 0, 0.0,
            xOffset, 0, 3,
            0, 0, 3,

            // Right face
            0, 0, 0,
            0, yOffset, 0,
            0, 0, 3,
            0, yOffset, 3,

            // Left face
            xOffset, 0, 0,
            xOffset, yOffset, 0,
            xOffset, 0, 3,
            xOffset, yOffset, 3,

        ];

        this.normals = [
            // Front face
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // Back face
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // Top face
            0, 1, 0,
            0, 1, 0.0,
            0, 1, 0,
            0, 1, 0,

            // Bottom face
            0, -1, 0,
            0, -1, 0.0,
            0, -1, 0,
            0, -1, 0,

            // Right face
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // Left face
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

        ];
        this.indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     17, 18, 19,   // right
            20, 21, 22,     21, 22, 23,   // left
          ];
    }

    render() {
        gl.uniformMatrix4fv(modelUniform, false, this.modelMat);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW); // coords to that buffer
        gl.vertexAttribPointer(vertexAttrib, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW); // coords to that buffer
        gl.vertexAttribPointer(normalAttrib, 3, gl.FLOAT, false, 0, 0);
        //console.log(this.color);
        gl.uniform3fv(diffuseUniform, this.color);
        gl.uniform3fv(ambientUniform, [0.1, 0.1, 0.1]);
        gl.uniform3fv(specularUniform, [0.3, 0.3, 0.3]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        //draw white outline around block sides
    }
}