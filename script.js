const THEMES = {
    yellow: {
        name: "warn Yellow",
        bg: "#141005",
        core: "rgba(255, 230, 140, 0.85)",
        mid: "rgba(255, 180, 40, 0.28)",
        wire: "#ffc04d",
        tint: "rgba(255, 220, 100, 0.08)"
    }
};
const bgA = document.getElementById("bg-a");
const bgB = document.getElementById("bg-b");
const glass = document.querySelector(".glass");
const filament = document.querySelector(".filament");
const select = document.getElementById("themeSelect");
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
    renderLight(currentTheme);
}

function getGradient(t) {
    return `radial-gradient(circle at 50% 180px, ${t.core} 0%, ${t.mid} 32%, transparent 70%)`;
}

function renderLight(theme) {
    currentTheme = theme;
    if (!isOn) return;
    const nextBg = activeBg === bgA ? bgB : bgA;
    nextBg.style.background = getGradient(theme);
    document.body.style.backgroundColor = theme.bg;

    filament.style.stroke = theme.wire;
    glass.style.fill = theme.tint;
    glass.style.stroke = theme.wire;

    nextBg.classList.add("active");
    activeBg.classList.remove("active");
    active = nextBg;
}

function togglePower(){
    isOn = !isOn;
    document.body.classList.toggle("on", isOn);
    if(isOn) {
        renderLight(currenttheme);
    }else {
        bgA.classList.remove("active");
        bgB.classList.remove("active");
        document.body.style.backgroundColor = "#090a0c";
        filament.style.stroke = "333";
        glass.style.fill = "rgba(255, 255, 0.02)";
        glass.style.stroke = "rgba(255, 255, 255, 0.12)";
    }
}

select.addEventListener("change", (e) => {
    const picked = THEMES[e.target.value];
    if (picked) renderLight(picked);
});

powerBtn.addEventListener("click", togglePower);
lamp.addEventListener("click", togglePower);

init();