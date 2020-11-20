//file with user input stuff
function onKeyDown(e) {
    if (tetris.player == null || gameOver) {
        return;
    }
    switch (e.code) {
        case "KeyA":
            if (!tetris.willCollide("left")) {
                tetris.player.x++;
            }
            break;
        case "KeyD":
            if (!tetris.willCollide("right")) {
                tetris.player.x--;
            }
            break;
        case "KeyS":
            if (!tetris.willCollide("down")) {
                tetris.player.y--;
            }
            break;
        case "ArrowLeft":
            if (!tetris.willCollide("left")) {
                tetris.player.x++;
            }
            break;
        case "ArrowRight":
            if (!tetris.willCollide("right")) {
                tetris.player.x--;
            }
            break;
        case "ArrowDown":
            if (!tetris.willCollide("down")) {
                tetris.player.y--;
            }
            break;
        case "KeyW":
            tetris.player.rotate();
            break;
        case "ArrowUp":
            tetris.player.rotate();
            break;
        case "Space":
            while (!tetris.willCollide("down")) {
                tetris.player.y--;
            }
            tetris.plantOnGrid(tetris.player);
            tetris.newPlayerPiece();
            break;
    }
}

function onKeyUp(e) {
    e = e || window.event;
    switch (e.code) {
        case "KeyA":
            leftButtonDown = false;
            break;
        case "KeyD":
            rightButtonDown = false;
            break;
        case "KeyS":
            downButtonDown = false;
            break;
        case "ArrowLeft":
            leftButtonDown = false;
            break;
        case "ArrowRight":
            rightButtonDown = false;
            break;
        case "ArrowDown":
            leftButtonDown = false;
            break;
    }
}