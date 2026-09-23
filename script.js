const board = document.getElementById("game-board");
const gameOverModal = document.getElementById("game-over-modal");
const startPauseBtn = document.getElementById("start-pause-btn");
const resetBtn = document.getElementById("reset-btn");
const restartBtn = document.getElementById("restart-btn");
const speedSelect = document.getElementById("speed-select");

const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

let grid = [];

const createBoard = () => {
    board.innerHTML = "";
    grid = [];

    for (let y = 0; y < GRID_SIZE; y++) {
        const row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("cell-checkbox");
            checkbox.dataset.x = x;
            checkbox.dataset.y = y;

            checkbox.addEventListener("change", (e) => {
                e.preventDefault();
                Render();
            });

            board.appendChild(checkbox);
            row.push(checkbox);
        }
        grid.push(row);
    }
};

const Render = () => {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cb = grid[y][x];
            cb.checked = false;
            cb.className = "cell-checkbox";
        }
    }

    snake.forEach((segment, index) => {
        if (segment.x >= 0 && segment.x < GRID_SIZE && segment.y >= 0 && segment.y < GRID_SIZE) {
            const cb = grid[segment.y][segment.x];
            cb.checked = true;
            cb.classList.add("snake");
            if (index === 0) {
                cb.classList.add("snake-head");
            }
        }
    });

    if (food.x >= 0 && food.x < GRID_SIZE && food.y >= 0 && food.y < GRID_SIZE) {
        const cb = grid[food.y][food.x];
        cb.checked = true;
        cb.classList.add("food");
    }
};

const triggerGameOver = () => {
    isGameOver = true;
    stopGameLoop();

    gameOverModal.classList.remove("hidden");
    startPauseBtn.textContent = "Start";
};

const resetGame = () => {
    isGameOver = false;
    isPaused = false;
    gameOverModal.classList.add("hidden");
    startPauseBtn.textContent = "Pause";

    initSnake();
    spawnFood();
    Render();
    startGameLoop(Render, triggerGameOver);
};

const togglePause = () => {
    if (isGameOver) {
        resetGame();
        return;
    }

    isPaused = !isPaused;
    if (isPaused) {
        stopGameLoop();
        startPauseBtn.textContent = "Resume";
    } else {
        startPauseBtn.textContent = "Pause";
        startGameLoop(Render, triggerGameOver);
    }
};

document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            changeDirection({ x: 0, y: -1 });
            e.preventDefault();
            break;
        case "ArrowDown":
        case "s":
        case "S":
            changeDirection({ x: 0, y: 1 });
            e.preventDefault();
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            changeDirection({ x: -1, y: 0 });
            e.preventDefault();
            break;
        case "ArrowRight":
        case "d":
        case "D":
            changeDirection({ x: 1, y: 0 });
            e.preventDefault();
            break;
        case " ":
            togglePause();
            e.preventDefault();
            break;
    }
});

btnUp.addEventListener("click", () => changeDirection({ x: 0, y: -1 }));
btnDown.addEventListener("click", () => changeDirection({ x: 0, y: 1 }));
btnLeft.addEventListener("click", () => changeDirection({ x: -1, y: 0 }));
btnRight.addEventListener("click", () => changeDirection({ x: 1, y: 0 }));

startPauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);

speedSelect.addEventListener("change", (e) => {
    speedMs = parseInt(e.target.value, 10);
    if (!isPaused && !isGameOver) {
        startGameLoop(Render, triggerGameOver);
    }
});

const init = () => {
    createBoard();
    resetGame();
};

init();