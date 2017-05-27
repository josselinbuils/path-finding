const blockWidth = 10;
const blockHeight = 10;

let canvas, map;

let clicked = false;

document.addEventListener('DOMContentLoaded', function () {
    canvas = document.querySelector('canvas');

    canvas.width = window.innerWidth - window.innerWidth % blockWidth;
    canvas.height = window.innerHeight - window.innerHeight % blockHeight;

    createEmptyMap();

    canvas.addEventListener('mousedown', event => {
        clicked = true;
        addBlockAtCursor(event);
    });

    document.addEventListener('mouseup', () => clicked = false);
    canvas.addEventListener('mousemove', event => clicked && addBlockAtCursor(event));

}, false);

/* Public */

window.clearMap = () => {
    cleanCanvas();
    createEmptyMap();
};

window.generateMap = () => {

    window.clearMap();

    map.forEach((line, y) => {
        line.forEach((column, x) => addBlock(Math.random() < 0.8 ? '.' : '#', x, y));
    });
};

window.start = () => {
    addBlock('C', 0, 0);
    addBlock('O', map[0].length - 1, map.length - 1);

    let nodeCallback = (x, y) => {
        let distance = getDistanceToTarget(x, y);
        drawBlock(x, y, 'rgb(' + Math.min(255, distance) + ', ' + Math.max(150 - distance, 0) + ', 0)');
    };

    let pathCallback = (x, y) => drawBlock(x, y, 'greenyellow');

    let algoSelec = document.getElementById('algorithms'),
        algoMethodName = algoSelec.options[algoSelec.selectedIndex].value,
        heuristicType,
        heuristicWeight = parseInt(document.getElementById('heuristic-weight').value);

    if (algoMethodName.indexOf('AStar') !== -1) {
        let s = algoMethodName.split(':');
        algoMethodName = s[0];
        heuristicType = s[1];
    }

    try {
        new window[algoMethodName](heuristicWeight, heuristicType).findBestPath(map, 5, nodeCallback, pathCallback);
    } catch (e) {
        console.error(e);
    }
};

/* Private */

function addBlock(block, x, y) {
    map[y][x] = block;

    let color;

    switch (block) {
        case 'C':
            color = 'blue';
            break;
        case 'O':
            color = 'green';
            break;
        case '#':
            color = 'white';
    }

    if (block !== '.') {
        drawBlock(x, y, color);
    }
}

function addBlockAtCursor(mouseEvent) {
    addBlock('#', Math.floor(mouseEvent.clientX / blockWidth), Math.floor(mouseEvent.clientY / blockHeight));
}

function cleanCanvas() {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function createEmptyMap() {
    let width = canvas.width / blockWidth,
        height = canvas.height / blockHeight;

    map = [];

    for (let y = 0; y < height; y++) {
        map[y] = [];

        for (let x = 0; x < width; x++) {
            map[y][x] = '.';
        }
    }
}

function drawBlock(x, y, color) {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
}

function getDistanceToTarget(x, y) {
    return Math.round(Math.sqrt(Math.pow(x - map[0].length - 1, 2) + Math.pow(y - map.length - 1, 2)));
}