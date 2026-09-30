// Food Generation & Management

let food = { x: 5, y: 5, type: "normal" };
let specialFood = null;
let specialFoodTimer = null;

const getFoodGridSize = () => (typeof GRID_SIZE !== "undefined" ? GRID_SIZE : 20);

// Helper to get all free cells on the grid
const getAvailableCells = () => {
    const size = getFoodGridSize();
    const occupied = new Set();

    if (typeof snake !== "undefined" && Array.isArray(snake)) {
        snake.forEach(seg => occupied.add(`${seg.x},${seg.y}`));
    }

    if (specialFood) {
        occupied.add(`${specialFood.x},${specialFood.y}`);
    }

    const available = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!occupied.has(`${x},${y}`)) {
                available.push({ x, y });
            }
        }
    }
    return available;
};

const spawnFood = () => {
    const available = getAvailableCells();
    if (available.length === 0) {
        return false; // Board is completely full
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    food = {
        x: available[randomIndex].x,
        y: available[randomIndex].y,
        type: "normal"
    };

    // Chance to spawn special bonus food (20% chance after score > 30 and if none active)
    if (!specialFood && typeof score !== "undefined" && score >= 30 && Math.random() < 0.25) {
        spawnSpecialFood();
    }

    return true;
};

const spawnSpecialFood = () => {
    const available = getAvailableCells().filter(cell => !(cell.x === food.x && cell.y === food.y));
    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    specialFood = {
        x: available[randomIndex].x,
        y: available[randomIndex].y,
        type: "golden",
        ticksLeft: 25 // Remains for 25 snake ticks
    };
};

const tickSpecialFood = () => {
    if (specialFood) {
        specialFood.ticksLeft--;
        if (specialFood.ticksLeft <= 0) {
            specialFood = null;
        }
    }
};

const resetFood = () => {
    food = { x: 5, y: 5, type: "normal" };
    specialFood = null;
};
