
const GRID_SIZE = 20;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let gameInterval = null;
let isPaused = false;
let isGameOver = false;
let speedMs = 120;

const initSnake = () => {
    const centerY = Math.floor(GRID_SIZE / 2);
    const centerX = Math.floor(GRID_SIZE / 2);

    snake = [
        { x: centerX + 1, y: centerY },
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
};

const changeDirection = (newDir) => {
    if (isPaused || isGameOver) return;

    if (newDir.x !== 0 && direction.x === -newDir.x) return;
    if (newDir.y !== 0 && direction.y === -newDir.y) return;

    nextDirection = newDir;
};

const moveSnakeStep = (onRender, onGameOver) => {
    if (isPaused || isGameOver) return;

    direction = { ...nextDirection };

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        onGameOver();
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        onGameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        spawnFood();
    } else {
        snake.pop();
    }

    if (onRender) onRender();
};

const startGameLoop = (onRender, onGameOver) => {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => moveSnakeStep(onRender, onGameOver), speedMs);
};

const stopGameLoop = () => {
    clearInterval(gameInterval);
};
