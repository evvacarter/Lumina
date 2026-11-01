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
    const picked = THEMES[e.target.value];
    if (picked) renderLight(picked);
});

dimSlider.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--dim", e.target.value);

});

powerBtn.addEventListener("click", togglePower);
lamp.addEventListener("click", togglePower);

init();