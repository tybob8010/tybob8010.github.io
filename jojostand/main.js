const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ===== 定数・設定 ===== */
const rankMap = { A: 5, B: 4, C: 3, D: 2, E: 1, "?": 0};
const statIds = ["power", "speed", "range", "durability", "precision", "growth"];
const statNames = ["破壊力", "スピード", "射程距離", "持続力", "精密動作性", "成長性"];

const PLACEHOLDER_STAND = "ザ・〇ールド";
const PLACEHOLDER_MASTER = "D〇O";

const bgPatterns = {
  purple: { inner: "#5b2b7a", outer: "#120018" },
  blue:   { inner: "#1a3b7a", outer: "#000518" },
  pink:   { inner: "#8a2b5a", outer: "#220010" },
  gold:   { inner: "#7a622b", outer: "#1a1200" },
  green:  { inner: "#1a5a2b", outer: "#001205" },
  red:    { inner: "#7a1a1a", outer: "#1a0000" },
  orange: { inner: "#8a4a1a", outer: "#1a0800" },
  monochrome: { inner: "#333333", outer: "#000000" }
};

/* ===== 初期化・イベント設定 ===== */
statIds.forEach(id => {
  const s = document.getElementById(id);
  ["A", "B", "C", "D", "E", "?"].forEach(v => {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    s.appendChild(o);
  });
  s.value = "A";
});

document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', draw);
});

/* ===== 画像処理 ===== */
let standImg = null;
document.getElementById("imageInput").onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const img = new Image();
  img.onload = () => { 
    standImg = img; 
    draw(); 
  };
  img.src = URL.createObjectURL(f);
};

/* ===== 保存機能 ===== */
document.getElementById("save").onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "stand_16-9.png";
  a.click();
};

document.getElementById("saveBanner").onclick = () => {
  const bCanvas = document.createElement("canvas");
  const bCtx = bCanvas.getContext("2d");
  bCanvas.width = 1500;
  bCanvas.height = 500;
  const bgType = document.getElementById("bgType").value;
  const colors = bgPatterns[bgType];
  const grad = bCtx.createRadialGradient(750, 250, 50, 750, 250, 900);
  grad.addColorStop(0, colors.inner);
  grad.addColorStop(1, colors.outer);
  bCtx.fillStyle = grad;
  bCtx.fillRect(0, 0, 1500, 500);
  const startX = (1500 - 960) / 2;
  bCtx.drawImage(canvas, 0, 20, 960, 500, startX, 0, 960, 500);
  const a = document.createElement("a");
  a.href = bCanvas.toDataURL("image/png");
  a.download = "stand_3-1.png";
  a.click();
};

/* ===== 描画コア関数 ===== */
function draw() {
  const bgType = document.getElementById("bgType").value;
  const colors = bgPatterns[bgType];
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 50, canvas.width/2, canvas.height/2, 600);
  grad.addColorStop(0, colors.inner);
  grad.addColorStop(1, colors.outer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const values = statIds.map(id => rankMap[document.getElementById(id).value]);
  drawStandChart(280, 315, 125, values);

  if (standImg) {
    ctx.save();
    ctx.shadowColor = "rgb(0, 0, 0, 1.0)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = -25;
    ctx.shadowOffsetY = -2;
    const targetHeight = 440;
    const scale = targetHeight / standImg.height;
    const targetWidth = standImg.width * scale;
    ctx.drawImage(standImg, 520, 50, targetWidth, targetHeight);
    ctx.restore();
  }

  // --- テキスト描画セクション ---
  ctx.save();

  // 見出し部分の描画設定
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px 'Times New Roman', serif"; // さらに少し大きく
  ctx.strokeStyle = "#000"; // クッキリした黒
  ctx.lineWidth = 4;        // 輪郭を太く
  ctx.lineJoin = "round";   // 角を丸くして綺麗に

  // 見出し：STAND NAME
  ctx.textAlign = "left";
  ctx.strokeText("| STAND NAME |", 60, 45);
  ctx.fillText("| STAND NAME |", 60, 45);

  const standName = document.getElementById("standName").value || PLACEHOLDER_STAND;
  jojoText(standName, 60, 105, 54, standName === PLACEHOLDER_STAND, false);

  // 見出し：STAND MASTER
  ctx.textAlign = "right";
  ctx.strokeText("| STAND MASTER |", 900, 460);
  ctx.fillText("| STAND MASTER |", 900, 460);

  const master = document.getElementById("masterName").value || PLACEHOLDER_MASTER;
  jojoText(master, 900, 520, 54, master === PLACEHOLDER_MASTER, true);

  ctx.restore();
}

function drawStandChart(cx, cy, maxR, values) {
  const steps = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;

  for (let i = 1; i <= steps; i++) {
    const r = maxR * i / steps;
    if (i === steps) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const tickLen = 8;
      for (let j = 0; j < 6; j++) {
        const angle = ang(j);
        const tx = cx + Math.cos(angle) * r;
        const ty = cy + Math.sin(angle) * r;
        const vx = Math.cos(angle + Math.PI / 2);
        const vy = Math.sin(angle + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(tx - vx * (tickLen/2), ty - vy * (tickLen/2));
        ctx.lineTo(tx + vx * (tickLen/2), ty + vy * (tickLen/2));
        ctx.stroke();
      }
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang(i)) * maxR, cy + Math.sin(ang(i)) * maxR);
    ctx.stroke();
  }

  const rankLabels = ["E", "D", "C", "B", "A"];
  ctx.font = "12px 'Times New Roman', serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.textAlign = "left";
  rankLabels.forEach((label, i) => {
    const r = maxR * (i + 1) / steps;
    ctx.fillText(label, cx + 8, cy - r + 4); 
  });

  ctx.beginPath();
  values.forEach((v, i) => {
    const r = maxR * v / steps;
    const x = cx + Math.cos(ang(i)) * r;
    const y = cy + Math.sin(ang(i)) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(252,230,171,0.5)";
  ctx.fill();
  ctx.strokeStyle = "rgba(252,230,171,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const rankR = maxR + 25;
  const labelR = maxR + 58;
  values.forEach((v, i) => {
    const angle = ang(i);
    const currentRank = Object.keys(rankMap).find(key => rankMap[key] === v);
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * rankR, cy + Math.sin(angle) * rankR);
    ctx.font = "900 24px 'Times New Roman', serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentRank, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(cx + Math.cos(angle) * labelR, cy + Math.sin(angle) * labelR);
    let rot = angle + Math.PI / 2;
    if (angle > 0 && angle < Math.PI) rot += Math.PI; 
    ctx.rotate(rot);
    ctx.font = "bold 14px serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(statNames[i], 0, 0);
    ctx.restore();
  });
}

function jojoText(text, x, y, size, isPlaceholder, right) {
  ctx.save();
  ctx.font = `900 ${size}px "Times New Roman", serif`;
  ctx.textAlign = right ? "right" : "left";

  if (isPlaceholder) {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText(text, x, y);
  } else {
    // 輪郭線をかなり強調
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;        // 太めの輪郭
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
    
    // 少しだけ内側に発光（白）
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

function ang(i) { return (Math.PI * 2 / 6) * i - Math.PI / 2; }

draw();