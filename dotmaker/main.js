
// ドット絵エディタのメインスクリプト

// --- 初期設定 ---
let cols = 16, rows = 16; // ドットの列数・行数
let pixels = []; // ドット絵データ（2次元配列）
let currentColor = { h: 0, s: 100, b: 100, r: 255, g: 0, b2: 0 }; // 現在の色

const canvas = document.getElementById('dotCanvas');
const ctx = canvas.getContext('2d');

// --- モード管理 ---
let mode = "draw"; // "draw" | "erase" | "eyedropper" | "select"

// --- パレット機能 ---
let palette = []; // 最大10色

function updatePaletteView() {
    const area = document.getElementById('paletteArea');
    area.innerHTML = '';
    palette.forEach((color, idx) => {
        const div = document.createElement('div');
        div.className = 'palette-color';
        div.style.background = color;
        div.title = color;
        div.onclick = function() {
            // パレット色を選択
            const rgb = color.match(/\d+/g).map(Number);
            document.getElementById('r').value = rgb[0];
            document.getElementById('g').value = rgb[1];
            document.getElementById('b').value = rgb[2];
            setColorFromRGB();
        };
        area.appendChild(div);
    });
}

document.getElementById('addToPaletteBtn').onclick = function() {
    const rgb = hsbToRgb(currentColor.h, currentColor.s, currentColor.b);
    const colorStr = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    // すでに同じ色があれば追加しない
    if (!palette.includes(colorStr)) {
        if (palette.length >= 10) palette.shift(); // 10色を超えたら古い色を削除
        palette.push(colorStr);
        updatePaletteView();
    }
};

// --- HSB→RGB変換関数 ---
function hsbToRgb(h, s, v) {
    s /= 100;
    v /= 100;
    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// --- RGB→HSB変換関数 ---
function rgbToHsb(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        b: Math.round(v * 100)
    };
}

// --- 色プレビューを更新する関数 ---
function updateColorPreview() {
    const rgb = hsbToRgb(currentColor.h, currentColor.s, currentColor.b);
    document.getElementById('colorPreview').style.background = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

// --- HSBスライダーから色を設定する関数 ---
function setColorFromHSB() {
    currentColor.h = parseInt(document.getElementById('hue').value);
    currentColor.s = parseInt(document.getElementById('sat').value);
    currentColor.b = parseInt(document.getElementById('bri').value);
    const rgb = hsbToRgb(currentColor.h, currentColor.s, currentColor.b);
    document.getElementById('r').value = rgb.r;
    document.getElementById('g').value = rgb.g;
    document.getElementById('b').value = rgb.b;
    currentColor.r = rgb.r;
    currentColor.g = rgb.g;
    currentColor.b2 = rgb.b;
    updateColorPreview();
}

// --- RGB入力欄から色を設定する関数 ---
function setColorFromRGB() {
    currentColor.r = parseInt(document.getElementById('r').value);
    currentColor.g = parseInt(document.getElementById('g').value);
    currentColor.b2 = parseInt(document.getElementById('b').value);
    const hsb = rgbToHsb(currentColor.r, currentColor.g, currentColor.b2);
    document.getElementById('hue').value = hsb.h;
    document.getElementById('sat').value = hsb.s;
    document.getElementById('bri').value = hsb.b;
    currentColor.h = hsb.h;
    currentColor.s = hsb.s;
    currentColor.b = hsb.b;
    updateColorPreview();
}

// --- ドット絵データを初期化する関数 ---
function initPixels() {
    pixels = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ color: null });
        }
        pixels.push(row);
    }
}

// --- キャンバスに描画する関数 ---
function drawCanvas() {
    const displayPixelSize = 20;
    canvas.width = cols * displayPixelSize;
    canvas.height = rows * displayPixelSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (pixels[y][x].color) {
                ctx.fillStyle = pixels[y][x].color;
                ctx.fillRect(x * displayPixelSize, y * displayPixelSize, displayPixelSize, displayPixelSize);
            }
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x * displayPixelSize, y * displayPixelSize, displayPixelSize, displayPixelSize);
        }
    }
    drawSelectionRect();
}

// --- 範囲選択・移動用変数 ---
let selection = null; // {x1, y1, x2, y2}
let isSelecting = false;
let isDraggingSelection = false;
let dragOffset = {x: 0, y: 0};
let selectedPixels = null;

// --- モード切替ボタン ---
document.getElementById('selectBtn').onclick = function () {
    mode = (mode === "select") ? "draw" : "select";
    updateModeUI();
};
document.getElementById('eraserBtn').onclick = function () {
    mode = (mode === "erase") ? "draw" : "erase";
    updateModeUI();
};
document.getElementById('eyedropperBtn').onclick = function () {
    mode = (mode === "eyedropper") ? "draw" : "eyedropper";
    updateModeUI();
};

// --- モードUI表示 ---
function updateModeUI() {
    document.getElementById('selectStatus').textContent = (mode === "select") ? "範囲選択ON" : "";
    document.getElementById('selectBtn').style.background = (mode === "select") ? "#ccf" : "";
    document.getElementById('eraserStatus').textContent = (mode === "erase") ? "消しゴムON" : "";
    document.getElementById('eraserBtn').style.background = (mode === "erase") ? "#ffd" : "";
    document.getElementById('eyedropperStatus').textContent = (mode === "eyedropper") ? "スポイトON" : "";
    document.getElementById('eyedropperBtn').style.background = (mode === "eyedropper") ? "#cff" : "";
}

// --- マウスドラッグで連続塗り対応 ---
let isDrawing = false;

canvas.addEventListener('mousedown', function (e) {
    const displayPixelSize = 20;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / displayPixelSize);
    const y = Math.floor((e.clientY - rect.top) / displayPixelSize);

    if (mode === "select") {
        if (selection && x >= selection.x1 && x <= selection.x2 && y >= selection.y1 && y <= selection.y2) {
            isDraggingSelection = true;
            dragOffset.x = x - selection.x1;
            dragOffset.y = y - selection.y1;
        } else {
            isSelecting = true;
            selection = {x1: x, y1: y, x2: x, y2: y};
        }
        drawCanvas();
        return;
    }

    if (mode === "eyedropper") {
        const color = pixels[y][x].color;
        if (color) {
            const rgb = color.match(/\d+/g).map(Number);
            document.getElementById('r').value = rgb[0];
            document.getElementById('g').value = rgb[1];
            document.getElementById('b').value = rgb[2];
            setColorFromRGB();
        }
        mode = "draw";
        updateModeUI();
        return;
    }

    if (mode === "erase") {
        isDrawing = true;
        pixels[y][x].color = null;
        drawCanvas();
        return;
    }

    // draw(着色)
    isDrawing = true;
    const rgb = hsbToRgb(currentColor.h, currentColor.s, currentColor.b);
    pixels[y][x].color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    drawCanvas();
});

canvas.addEventListener('mousemove', function (e) {
    const displayPixelSize = 20;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / displayPixelSize);
    const y = Math.floor((e.clientY - rect.top) / displayPixelSize);

    if (mode === "select") {
        if (isSelecting) {
            selection.x2 = x;
            selection.y2 = y;
            drawCanvas();
        }
        if (isDraggingSelection && selectedPixels) {
            let nx1 = x - dragOffset.x;
            let ny1 = y - dragOffset.y;
            let w = selectedPixels[0].length;
            let h = selectedPixels.length;
            selection.x1 = Math.max(0, Math.min(cols - w, nx1));
            selection.y1 = Math.max(0, Math.min(rows - h, ny1));
            selection.x2 = selection.x1 + w - 1;
            selection.y2 = selection.y1 + h - 1;
            drawCanvas();
        }
        return;
    }

    if (!isDrawing) return;

    if (mode === "erase") {
        pixels[y][x].color = null;
        drawCanvas();
        return;
    }
    if (mode === "draw") {
        const rgb = hsbToRgb(currentColor.h, currentColor.s, currentColor.b);
        pixels[y][x].color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        drawCanvas();
        return;
    }
});

canvas.addEventListener('mouseup', function (e) {
    isDrawing = false;
    if (mode === "select") {
        if (isSelecting) {
            isSelecting = false;
            let {x1, y1, x2, y2} = selection;
            selection.x1 = Math.max(0, Math.min(x1, x2));
            selection.y1 = Math.max(0, Math.min(y1, y2));
            selection.x2 = Math.min(cols - 1, Math.max(x1, x2));
            selection.y2 = Math.min(rows - 1, Math.max(y1, y2));
            selectedPixels = [];
            for (let y = selection.y1; y <= selection.y2; y++) {
                let row = [];
                for (let x = selection.x1; x <= selection.x2; x++) {
                    row.push(pixels[y] && pixels[y][x] ? {...pixels[y][x]} : {color: null});
                }
                selectedPixels.push(row);
            }
            drawCanvas();
        }
        if (isDraggingSelection) {
            isDraggingSelection = false;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (x >= selection.x1 && x <= selection.x2 && y >= selection.y1 && y <= selection.y2) {
                        pixels[y][x].color = null;
                    }
                }
            }
            for (let dy = 0; dy < selectedPixels.length; dy++) {
                for (let dx = 0; dx < selectedPixels[0].length; dx++) {
                    let px = selection.x1 + dx;
                    let py = selection.y1 + dy;
                    if (px >= 0 && px < cols && py >= 0 && py < rows) {
                        pixels[py][px].color = selectedPixels[dy][dx].color;
                    }
                }
            }
            // 移動後に範囲選択解除
            selectedPixels = null;
            selection = null;
            drawCanvas();
        }
    }
});
canvas.addEventListener('mouseleave', function (e) {
    isDrawing = false;
});

// --- 消しゴム・スポイト・範囲選択の排他制御はupdateModeUIで管理 ---

// --- リサイズ処理 ---
document.getElementById('resizeBtn').onclick = function () {
    cols = parseInt(document.getElementById('cols').value);
    rows = parseInt(document.getElementById('rows').value);
    const newPixels = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            if (pixels[y] && pixels[y][x]) {
                row.push({ color: pixels[y][x].color });
            } else {
                row.push({ color: null });
            }
        }
        newPixels.push(row);
    }
    pixels = newPixels;
    drawCanvas();
};

// --- ボタン・スライダーのイベント登録 ---
document.getElementById('hsb2rgb').onclick = setColorFromHSB;
document.getElementById('rgb2hsb').onclick = setColorFromRGB;

['hue', 'sat', 'bri'].forEach(id => {
    document.getElementById(id).addEventListener('input', setColorFromHSB);
});
['r', 'g', 'b'].forEach(id => {
    document.getElementById(id).addEventListener('input', setColorFromRGB);
});

// --- 保存処理 ---
document.getElementById('saveBtn').onclick = function () {
    const type = document.getElementById('fileType').value;
    const savePixelSize = parseInt(document.getElementById('pixelSize').value);
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = cols * savePixelSize;
    tmpCanvas.height = rows * savePixelSize;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (pixels[y][x].color) {
                tmpCtx.fillStyle = pixels[y][x].color;
                tmpCtx.fillRect(x * savePixelSize, y * savePixelSize, savePixelSize, savePixelSize);
            }
        }
    }

    let mime = 'image/png';
    if (type === 'jpeg') mime = 'image/jpeg';
    if (type === 'ico') mime = 'image/x-icon';

    const url = tmpCanvas.toDataURL(mime);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dot.${type}`;
    a.click();
};

// --- 画像読み込み処理 ---
document.getElementById('imageLoader').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const info = document.getElementById('imageInfo');
    const attention = document.getElementById('imageSizeAttention');
    info.textContent = '';
    attention.textContent = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // 画像サイズ表示
            info.textContent = `元の画像サイズ: ${img.width}×${img.height} px`;

            // キャンバスサイズ・1ドットの大きさを画像サイズ・1に自動設定
            cols = img.width;
            rows = img.height;
            document.getElementById('cols').value = cols;
            document.getElementById('rows').value = rows;
            document.getElementById('pixelSize').value = 1;

            // ドット配列を画像サイズで初期化
            pixels = [];
            for (let y = 0; y < rows; y++) {
                let row = [];
                for (let x = 0; x < cols; x++) {
                    row.push({ color: null });
                }
                pixels.push(row);
            }

            // 画像をそのままドット化
            const tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = cols;
            tmpCanvas.height = rows;
            const tmpCtx = tmpCanvas.getContext('2d');
            tmpCtx.drawImage(img, 0, 0, cols, rows);
            const imgData = tmpCtx.getImageData(0, 0, cols, rows).data;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const idx = (y * cols + x) * 4;
                    const r = imgData[idx];
                    const g = imgData[idx + 1];
                    const b = imgData[idx + 2];
                    const a = imgData[idx + 3];
                    if (a < 128) {
                        pixels[y][x].color = null;
                    } else {
                        pixels[y][x].color = `rgb(${r},${g},${b})`;
                    }
                }
            }
            attention.textContent = '';
            drawCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// --- 選択範囲の描画 ---
function drawSelectionRect() {
    if (!selection) return;
    const displayPixelSize = 20;
    ctx.save();
    ctx.strokeStyle = "#00f";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
        selection.x1 * displayPixelSize,
        selection.y1 * displayPixelSize,
        (selection.x2 - selection.x1 + 1) * displayPixelSize,
        (selection.y2 - selection.y1 + 1) * displayPixelSize
    );
    ctx.restore();
}

// RGB入力欄から現在の色を取得
function getCurrentColorString() {
    const r = Number(document.getElementById('r').value);
    const g = Number(document.getElementById('g').value);
    const b = Number(document.getElementById('b').value);
    return `rgb(${r},${g},${b})`;
}

// 全体を指定色で塗りつぶす
document.getElementById('fillAllBtn').onclick = function() {
    const color = getCurrentColorString();
    for (let y = 0; y < pixels.length; y++) {
        for (let x = 0; x < pixels[0].length; x++) {
            pixels[y][x].color = color;
        }
    }
    drawCanvas();
};

// 選択範囲を指定色で塗りつぶす
document.getElementById('fillSelectionBtn').onclick = function() {
    if (!selection) return;
    const color = getCurrentColorString();
    const x1 = Math.min(selection.x1, selection.x2);
    const x2 = Math.max(selection.x1, selection.x2);
    const y1 = Math.min(selection.y1, selection.y2);
    const y2 = Math.max(selection.y1, selection.y2);
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (pixels[y] && pixels[y][x]) {
                pixels[y][x].color = color;
            }
        }
    }
    drawCanvas();
};

// 選択範囲があるときだけ「選択範囲を塗りつぶす」ボタンを有効化
function updateFillSelectionBtn() {
    document.getElementById('fillSelectionBtn').disabled = !selection;
}

// 範囲選択のたびにボタン状態を更新
const origDrawCanvas = drawCanvas;
drawCanvas = function() {
    origDrawCanvas();
    updateFillSelectionBtn();
};
updateFillSelectionBtn();


// --- 初期化 ---
initPixels();
drawCanvas();
setColorFromHSB();
updateColorPreview();
updatePaletteView();
updateModeUI();

document.addEventListener("DOMContentLoaded", function () {
    const helpBtn = document.getElementById("helpMenuBtn");
    const helpMenu = document.getElementById("helpMenu");

    helpBtn.addEventListener("click", () => {
        helpMenu.classList.toggle("show");
    });
});
