let food = { x: 5, y: 5 };

const getFoodGridSize = () => (typeof GRID_SIZE !== "undefined" ? GRID_SIZE : 20);

const spawnFood = () => {
    let validPosition = false;
    let newX, newY;

    while (!validPosition) {
        newX = Math.floor(Math.random() * getFoodGridSize());
        newY = Math.floor(Math.random() * getFoodGridSize());

        validPosition = !snake.some((segment) => segment.x === newX && segment.y === newY);
    }

    food = { x: newX, y: newY };
};

const resetFood = () => {
    food = { x: 5, y: 5 };
};
