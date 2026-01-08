const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const turnCounter = document.getElementById("turnCounter");

// グリッドサイズ
const cellSize = 10;
const gridSize = 51; // 奇数にする（アリを中央に配置）
const canvasSize = gridSize * cellSize;

canvas.width = canvasSize;
canvas.height = canvasSize;

let grid, x, y, direction, running, turn;

// 初期化関数
function init() {
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    x = Math.floor(gridSize / 2);
    y = Math.floor(gridSize / 2);
    direction = 0;
    running = false;
    turn = 0;
    turnCounter.textContent = `ターン数: ${turn}`;
    startBtn.textContent = "開始";
    drawGrid();
}

// 盤面を描画
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = grid[i][j] ? "black" : "white";
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
    drawAnt();
}

// アリを描画
function drawAnt() {
    ctx.fillStyle = "red";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

// アリを移動
function moveAnt() {
    if (!running) return;

    // 現在のセルの色で動作を決定
    if (grid[y][x] === 0) {
        // 白なら左回転 & 黒に変更
        direction = (direction + 3) % 4;
        grid[y][x] = 1;
    } else {
        // 黒なら右回転 & 白に変更
        direction = (direction + 1) % 4;
        grid[y][x] = 0;
    }

    // 移動
    switch (direction) {
        case 0: y--; break;
        case 1: x++; break;
        case 2: y++; break;
        case 3: x--; break;
    }

    // 画面外に出ないようループ
    x = (x + gridSize) % gridSize;
    y = (y + gridSize) % gridSize;

    // ターン数を更新
    turn++;
    turnCounter.textContent = `ターン数: ${turn}`;

    drawGrid();
    requestAnimationFrame(moveAnt); // 次のフレームで再実行
}

// 開始・一時停止ボタンの処理
startBtn.addEventListener("click", () => {
    if (!running) {
        running = true;
        startBtn.textContent = "一時停止";
        moveAnt();
    } else {
        running = false;
        startBtn.textContent = "再開";
    }
});

// リセットボタンの処理
resetBtn.addEventListener("click", () => {
    running = false;
    init();
});

init();