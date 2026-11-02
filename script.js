const THEMES = {
    yellow: {
        name: "warm Yellow",
        bg: "#141005",
        core: "rgba(255, 230, 140, 0.85)",
        mid: "rgba(255, 180, 40, 0.28)",
        wire: "#ffc04d",
        tint: "rgba(255, 220, 100, 0.08)"
    },
    red: {
        name: "Crimson Red",
        bg: "#140406",
        core: "rgba(255, 120, 120, 0.085)",
        mid: "rgba(255, 35, 50, 0.28)",
        wire: "#ff5252",
        tint: "rgba(255, 60, 70, 0.08)"
    },
    blue: {
        name: "Ice Blue",
        bg: "#051016",
        core: "rgba(180, 240, 255, 0.85)",
        mid: "rgba(60, 185, 235, 0.28)",
        wire: "#7be4ff",
        tint: "rgba(80, 200, 255, 0.08)"
    }
};
const bgA = document.getElementById("bg-a");
const bgB = document.getElementById("bg-b");
const glass = document.querySelector(".glass");
const filament = document.querySelector(".filament");
const select = document.getElementById("themeSelect");
const dimSlider = document.getElementById("dimSlider");
const colorPicker = document.getElementById("colorPicker");
const powerBtn = document.getElementById("powerBtn");
const lamp = document.getElementById("lamp");

let activeBg = bgA;
let currentTheme = THEMES.yellow;
let isOn = true;

function init() {
    const frag = document.createDocumentFragment();
    for (const key in THEMES) {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = THEMES[key].name;
        frag.appendChild(opt);
    }
    
    const customOpt = document.createElement("option");
    customOpt.value = "custom";
    customOpt.textContent = "+ Create Your Own..";
    frag.appendChild(customOpt);

    select.appendChild(frag);
    activeBg.style.background = getGradient(currentTheme);
    applyBulbStyle(currentTheme);
}

function getGradient(t) {
    return `radial-gradient(circle at 50% 180px, ${t.core} 0%, ${t.mid} 32%, transparent 70%)`;
}

function applyBulbStyle(theme){
    document.body.style.backgroundColor = theme.bg;
    filament.style.stroke = theme.wire;
    glass.style.fill = theme.tint;
    glass.style.stroke = theme.wire;
}

function buildCustomTheme(hex) {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const bgR = Math.round(r * 0.08);
    const bgG = Math.round(g * 0.08);
    const bgB = Math.round(b * 0.08);

    return {
        name: "custom",
        bg: `rgb(${bgR}, ${bgG}, ${bgB})`,
        core: `rgba(${r}, ${g}, ${b}, 0.85)`,
        mid: `rgba(${r}, ${g}, ${b}, 0.28)`,
        wire: hex,
        tint: `rgba(${r}, ${g}, ${b}, 0.08)`
    };
}

function renderLight(theme) {
    currentTheme = theme;
    if (!isOn) return;

    const nextBg = activeBg === bgA ? bgB : bgA;
    nextBg.style.background = getGradient(theme);
    applyBulbStyle(theme);

    nextBg.classList.add("active");
    activeBg.classList.remove("active");
    activeBg = nextBg;
}

function togglePower(){
    isOn = !isOn;
    document.body.classList.toggle("on", isOn);
    if(isOn) {
         activeBg.style.background = getGradient(currentTheme);
         applyBulbStyle(currentTheme);
         activeBg.classList.add("active");
    }else {
        bgA.classList.remove("active");
        bgB.classList.remove("active");
        document.body.style.backgroundColor = "#090a0c";
        filament.style.stroke = "#333";
        glass.style.fill = "rgba(255, 255, 255, 0.02)";
        glass.style.stroke = "rgba(255, 255, 255, 0.12)";
    }
}

select.addEventListener("change", (e) => {
    const val = e.target.value;
    if(val === "custom") {
        colorPicker.classList.add("show");
        renderLight(buildCustomTheme(colorPicker.value));
        if (!isOn) togglePower();
        else renderLight(currentTheme); 
        setTimeout(() => colorPicker.click(), 50);
    } else {
        colorPicker.classList.remove("show");
        const picked = THEMES[val];
        if (picked) renderLight(picked);
    }   
});

let rafPending = false;

colorPicker.addEventListener("input", (e) => {
    const hex = e.target.value;
    if(!isOn) {
        isOn = true;
        document.body.classList.toggle("on", true);
        activeBg.classList.add("active");
    }
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
        currentTheme = buildCustomTheme(hex);
        document.body.style.transition = "none";
        glass.style.transition = "none";
        filament.style.transition = "none";

        const liveLayer = bgB.classList.contains("active") ? bgB : bgA;
        activeBg = liveLayer;
        liveLayer.style.background = getGradient(currentTheme);
        applyBulbStyle(currentTheme);
        rafPending = false;
    });
     
});

dimSlider.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--dim", e.target.value);

});

powerBtn.addEventListener("click", togglePower);

init();

// auido and ambient light system 

let ctx = null;
let hum = null;
let humVol = null;

function playSound(on) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(on ? 1400 : 800, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);

    vol.gain.setValueAtTime(0.35, t);
    vol.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);

    if (on) {
        if (!hum) {
            hum = ctx.createOscillator();
            humVol = ctx.createGain();
            hum.type = "sine";
            hum.frequency.value = 60;
            humVol.gain.value = 0.015;
            hum.connect(humVol);
            humVol.connect(ctx.destination);
            hum.start();
        }
        humVol.gain.setTargetAtTime(0.015, t, 0.05);
    } else if (humVol) {
        humVol.gain.setTargetAtTime(0, t, 0.03);
    } 
}
const chain = document.getElementById("chain");
const line = document.getElementById("chainLine");
const knob = document.getElementById("chainKnob");
const hit = document.getElementById("chainHit");
const baseY = 198;
let startY = 0;
let pull = 0;
let drag = false;

chain.addEventListener("pointerdown", (e) => {
    drag = true;
    startY = e.clientY;
    pull = 0;
    chain.classList.add("dragging");
    chain.setPointerCapture(e.pointerId);
});

chain.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dy = Math.max(0, e.clientY - startY);
    pull = Math.min(55, dy * 0.65);
    
    chain.style.transform = `translateY(${pull}px)`;
});

function drop() {
    if (!drag) return;
    drag = false;
    chain.classList.remove("dragging");
    chain.style.transform = "translateY(0px)";

    if (pull >= 12 ) {
        togglePower();
        playSound(isOn);
    }
}
chain.addEventListener("pointerup", drop);
chain.addEventListener("pointercancel", drop);