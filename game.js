// Game Engine & State Management

const GRID_SIZE = 20;

let snake = [];
let direction = { x: 1, y: 0 };
let directionQueue = [];
let gameInterval = null;
let isPaused = false;
let isGameOver = false;
let isVictory = false;
let speedMs = 120;
let wrapWalls = false;

let score = 0;
let highScore = 0;
let foodEatenCount = 0;

// Load persisted high score safely
try {
    const saved = localStorage.getItem("checkbox_snake_high_score");
    if (saved !== null) {
        highScore = parseInt(saved, 10) || 0;
    }
} catch (e) {
    highScore = 0;
}

const initSnake = () => {
    const centerY = Math.floor(GRID_SIZE / 2);
    const centerX = Math.floor(GRID_SIZE / 2);

    snake = [
        { x: centerX + 1, y: centerY },
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY }
    ];
    direction = { x: 1, y: 0 };
    directionQueue = [];
    isGameOver = false;
    isVictory = false;
    foodEatenCount = 0;
};

// Queue directions to prevent instant self-collision on rapid key inputs
const changeDirection = (newDir) => {
    if (isPaused || isGameOver || isVictory) return;

    // Check against the last queued direction, or the active direction if queue is empty
    const referenceDir = directionQueue.length > 0 
        ? directionQueue[directionQueue.length - 1] 
        : direction;

    // Prevent direct 180-degree reversal
    if (newDir.x !== 0 && referenceDir.x === -newDir.x) return;
    if (newDir.y !== 0 && referenceDir.y === -newDir.y) return;
    // Avoid queueing identical direction
    if (newDir.x === referenceDir.x && newDir.y === referenceDir.y) return;

    // Limit buffer to maximum 2 ahead moves to keep controls snappy
    if (directionQueue.length < 2) {
        directionQueue.push(newDir);
    }
};

const moveSnakeStep = (callbacks = {}) => {
    const { onRender, onGameOver, onEatFood, onWin } = callbacks;
    if (isPaused || isGameOver || isVictory) return;

    // Pop next queued direction if available
    if (directionQueue.length > 0) {
        direction = directionQueue.shift();
    }

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Wall collision or wrap-around
    if (wrapWalls) {
        head.x = (head.x + GRID_SIZE) % GRID_SIZE;
        head.y = (head.y + GRID_SIZE) % GRID_SIZE;
    } else {
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            isGameOver = true;
            stopGameLoop();
            if (onGameOver) onGameOver("wall");
            return;
        }
    }

    // Check self-collision (excluding the tail if the snake doesn't grow this step)
    const isEatingNormal = (head.x === food.x && head.y === food.y);
    const isEatingSpecial = (specialFood && head.x === specialFood.x && head.y === specialFood.y);
    const willGrow = isEatingNormal || isEatingSpecial;

    // For collision, if it won't grow, the last tail cell will vacate this tick
    const bodyToCheck = willGrow ? snake : snake.slice(0, -1);
    if (bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y)) {
        isGameOver = true;
        stopGameLoop();
        if (onGameOver) onGameOver("self");
        return;
    }

    // Move head forward
    snake.unshift(head);

    // Calculate score multiplier based on speed
    const speedMultiplier = Math.max(1, Math.round(180 / speedMs));

    let ateFood = false;

    // Handle normal food
    if (isEatingNormal) {
        const points = 10 * speedMultiplier;
        score += points;
        foodEatenCount++;
        ateFood = true;

        if (score > highScore) {
            highScore = score;
            try {
                localStorage.setItem("checkbox_snake_high_score", highScore.toString());
            } catch (e) {
                // Ignore storage error
            }
        }

        if (onEatFood) onEatFood("normal", head, points);

        // Win condition: Snake fills entire board!
        if (snake.length >= GRID_SIZE * GRID_SIZE) {
            isVictory = true;
            stopGameLoop();
            if (onWin) onWin();
            if (onRender) onRender();
            return;
        }

        spawnFood();
    }

    // Handle golden/special bonus food
    if (isEatingSpecial) {
        const bonusPoints = 30 * speedMultiplier;
        score += bonusPoints;
        ateFood = true;

        if (score > highScore) {
            highScore = score;
            try {
                localStorage.setItem("checkbox_snake_high_score", highScore.toString());
            } catch (e) {
                // Ignore storage error
            }
        }

        if (onEatFood) onEatFood("golden", head, bonusPoints);
        specialFood = null;
    }

    // If no food was eaten, trim the tail
    if (!ateFood) {
        snake.pop();
    }

    // Countdown active special food timer
    if (typeof tickSpecialFood === "function") {
        tickSpecialFood();
    }

    if (onRender) onRender();
};

const startGameLoop = (callbacks = {}) => {
    stopGameLoop();
    gameInterval = setInterval(() => moveSnakeStep(callbacks), speedMs);
};

const stopGameLoop = () => {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
};

const setGameSpeed = (ms, callbacks) => {
    speedMs = ms;
    if (!isPaused && !isGameOver && !isVictory && gameInterval !== null) {
        startGameLoop(callbacks);
    }
};
