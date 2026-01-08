const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const rows = 30; // 行数
const cols = 30; // 列数
const cellSize = 20; // セルのサイズ
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
let running = false;
let interval;
let speed = 200;
let turnCount = 0;

// 盤面の描画
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.fillStyle = grid[r][c] ? "black" : "white";
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "gray";
            ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }
}

// グリッドの更新
function updateGrid() {
    let newGrid = grid.map(arr => [...arr]);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let neighbors = countNeighbors(r, c);
            if (grid[r][c]) {
                newGrid[r][c] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
            } else {
                newGrid[r][c] = (neighbors === 3) ? 1 : 0;
            }
        }
    }
    grid = newGrid;
    drawGrid();
    turnCount++;
    document.getElementById("turnCount").textContent = `ターン数: ${turnCount}`;
}

// 隣接するセルの数を数える
function countNeighbors(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                count += grid[nr][nc];
            }
        }
    }
    return count;
}

// ゲームの開始・停止を切り替える
function toggleGame() {
    running = !running;
    document.getElementById("startStopBtn").textContent = running ? "停止" : "開始";
    if (running) {
        interval = setInterval(updateGrid, speed);
    } else {
        clearInterval(interval);
    }
}

// 盤面をクリアする
function clearGrid() {
    running = false;
    clearInterval(interval);
    document.getElementById("startStopBtn").textContent = "開始";
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    turnCount = 0;
    document.getElementById("turnCount").textContent = `ターン数: ${turnCount}`;
    drawGrid();
}

// 速度を変更する
function changeSpeed() {
    speed = parseInt(document.getElementById("speed").value);
    if (running) {
        clearInterval(interval);
        interval = setInterval(updateGrid, speed);
    }
}

// キャンバスクリックでセルを切り替える
canvas.addEventListener("click", (event) => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let col = Math.floor(x / cellSize);
    let row = Math.floor(y / cellSize);
    grid[row][col] = grid[row][col] ? 0 : 1;
    drawGrid();
});

// ゲーム開始・停止ボタンにイベントリスナーを追加
document.getElementById("startStopBtn").addEventListener("click", toggleGame);

drawGrid(); // 初期盤面を描画