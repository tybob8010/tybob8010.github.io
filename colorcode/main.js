const hexInput = document.getElementById('hexInput');
const colorDisplay = document.getElementById('colorDisplay');
const colorCode = document.getElementById('colorCode');

/* RGB */
const rI = document.getElementById('rInput');
const gI = document.getElementById('gInput');
const bI = document.getElementById('bInput');
const rR = document.getElementById('rRange');
const gR = document.getElementById('gRange');
const bR = document.getElementById('bRange');

/* HSB */
const hI = document.getElementById('hInput');
const sI = document.getElementById('sInput');
const vI = document.getElementById('vInput');
const hR = document.getElementById('hRange');
const sR = document.getElementById('sRange');
const vR = document.getElementById('vRange');

/* ========= HEX ========= */
hexInput.addEventListener('input', () => {
    let raw = hexInput.value.trim();
    if (!raw.startsWith('#')) raw = '#' + raw;
    raw = raw.slice(0, 7);
    hexInput.value = raw.replace(/^##/, '#');

    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
        applyHex(hexInput.value);
    } else {
        invalid();
    }
});

/* ========= RGB ========= */
[rI,gI,bI,rR,gR,bR].forEach(el => {
    el.addEventListener('input', () => {
        syncRGB();
        const r=+rI.value,g=+gI.value,b=+bI.value;
        if (validRGB(r,g,b)) {
            const hex = rgbToHex(r,g,b);
            applyHex(hex);
        }
    });
});

/* ========= HSB ========= */
[hI,sI,vI,hR,sR,vR].forEach(el => {
    el.addEventListener('input', () => {
        syncHSB();
        const h=+hI.value,s=+sI.value,v=+vI.value;
        if (validHSB(h,s,v)) {
            const rgb = hsbToRgb(h,s,v);
            applyHex(rgbToHex(rgb.r,rgb.g,rgb.b));
        }
    });
});

/* ========= 適用 ========= */
function applyHex(hex) {
    colorDisplay.style.backgroundColor = hex;
    colorCode.textContent = hex;
    colorCode.style.color = hex;
    hexInput.value = hex;

    const rgb = hexToRgb(hex);
    setRGB(rgb);
    setHSB(rgb);
}

function invalid() {
    colorDisplay.style.backgroundColor = '#000';
    colorCode.textContent = '無効なカラーコード';
    colorCode.style.color = '#fff';
}

/* ========= コピー ========= */
function copyHex() {
    navigator.clipboard.writeText(hexInput.value);
}
function copyRGB() {
    navigator.clipboard.writeText(`rgb(${rI.value}, ${gI.value}, ${bI.value})`);
}
function copyHSB() {
    navigator.clipboard.writeText(`hsb(${hI.value}, ${sI.value}, ${vI.value})`);
}

/* ========= 同期 ========= */
function syncRGB() {
    rI.value=rR.value=rI.value;
    gI.value=gR.value=gI.value;
    bI.value=bR.value=bI.value;
}
function syncHSB() {
    hI.value=hR.value=hI.value;
    sI.value=sR.value=sI.value;
    vI.value=vR.value=vI.value;
}

function setRGB({r,g,b}) {
    rI.value=rR.value=r;
    gI.value=gR.value=g;
    bI.value=bR.value=b;
}
function setHSB({r,g,b}) {
    const hsb = rgbToHsb(r,g,b);
    hI.value=hR.value=hsb.h;
    sI.value=sR.value=hsb.s;
    vI.value=vR.value=hsb.v;
}

/* ========= 変換 ========= */
function hexToRgb(hex){
    const n=parseInt(hex.slice(1),16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function rgbToHex(r,g,b){
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function rgbToHsb(r,g,b){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    const d=max-min;
    let h=0;
    if(d){
        if(max===r) h=60*((g-b)/d%6);
        else if(max===g) h=60*((b-r)/d+2);
        else h=60*((r-g)/d+4);
    }
    if(h<0) h+=360;
    return {h:Math.round(h), s:Math.round(max?d/max*100:0), v:Math.round(max*100)};
}
function hsbToRgb(h,s,v){
    s/=100; v/=100;
    const c=v*s, x=c*(1-Math.abs(h/60%2-1)), m=v-c;
    let r=0,g=0,b=0;
    if(h<60)[r,g,b]=[c,x,0];
    else if(h<120)[r,g,b]=[x,c,0];
    else if(h<180)[r,g,b]=[0,c,x];
    else if(h<240)[r,g,b]=[0,x,c];
    else if(h<300)[r,g,b]=[x,0,c];
    else[r,g,b]=[c,0,x];
    return {r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};
}

function validRGB(r,g,b){return [r,g,b].every(v=>v>=0&&v<=255);}
function validHSB(h,s,v){return h>=0&&h<=360&&s>=0&&s<=100&&v>=0&&v<=100;}

function setExample(hex){
    hexInput.value=hex;
    hexInput.dispatchEvent(new Event('input'));
}
