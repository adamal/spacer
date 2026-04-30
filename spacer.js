// eslint-disable-next-line no-unused-vars
function calculatePositions() {
    const inputs = readInputs();

    const { positions, spaceWidth } = calculateSpacing(
        inputs.sectionWidth, inputs.boardWidth, inputs.numberOfBoards,
        inputs.numberOfSpaces, inputs.offset);
    const boardLengths = calculateLengths(inputs.first, inputs.last, inputs.numberOfBoards);

    lastResult = { positions, spaceWidth, boardLengths };
    renderResult(positions, spaceWidth, boardLengths);
    saveToHistory(inputs);
    renderHistory();
}

let lastResult = null;

function readInputs() {
    let numberOfSpaces;
    const radios = document.getElementsByName("numberOfSpaces");
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) { numberOfSpaces = radios[i].value; break; }
    }
    return {
        sectionWidth: parseFloat(document.getElementById("sectionWidth").value),
        boardWidth: parseFloat(document.getElementById("boardWidth").value),
        numberOfBoards: parseInt(document.getElementById("numberOfBoards").value),
        numberOfSpaces,
        offset: parseFloat(document.getElementById("offset").value),
        first: parseFloat(document.getElementById("firstBoard").value),
        last: parseFloat(document.getElementById("lastBoard").value),
    };
}

function applyInputs(inputs) {
    document.getElementById("sectionWidth").value = inputs.sectionWidth;
    document.getElementById("boardWidth").value = inputs.boardWidth;
    document.getElementById("numberOfBoards").value = inputs.numberOfBoards;
    document.getElementById("offset").value = inputs.offset;
    document.getElementById("firstBoard").value = isNaN(inputs.first) ? "" : inputs.first;
    document.getElementById("lastBoard").value = isNaN(inputs.last) ? "" : inputs.last;
    const radios = document.getElementsByName("numberOfSpaces");
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = (radios[i].value === inputs.numberOfSpaces);
    }
}

const HISTORY_KEY = "spacer.history.v2";

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveToHistory(inputs) {
    const history = loadHistory();
    const updated = addToHistory(history, { inputs, ts: Date.now() });
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn("Could not save history", e);
    }
}

function summarizeInputs(inputs) {
    const spacesLabel = inputs.numberOfSpaces === "plusOne" ? "+1"
        : inputs.numberOfSpaces === "minusOne" ? "-1" : "0";
    return `${inputs.sectionWidth}mm / ${inputs.numberOfBoards}×${inputs.boardWidth}mm (${spacesLabel})`;
}

// eslint-disable-next-line no-unused-vars
function toggleHistory() {
    const panel = document.getElementById("historyPanel");
    const isHidden = panel.classList.contains("hidden");
    if (isHidden) {
        renderHistory();
        panel.classList.remove("hidden");
    } else {
        panel.classList.add("hidden");
    }
}

function renderHistory() {
    const panel = document.getElementById("historyPanel");
    if (!panel) return;
    const history = loadHistory();
    if (history.length === 0) {
        panel.innerHTML = `<div class="p-2 text-sm text-gray-500">No history yet</div>`;
        return;
    }
    panel.innerHTML = history.map((h, i) => `
        <button type="button" data-history-index="${i}"
            class="history-item block w-full text-left p-2 hover:bg-gray-100 border-b text-sm">
            ${summarizeInputs(h.inputs)}
        </button>
    `).join("");
    panel.querySelectorAll(".history-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.getAttribute("data-history-index"));
            const entry = loadHistory()[idx];
            if (!entry) return;
            applyInputs(entry.inputs);
            document.getElementById("historyPanel").classList.add("hidden");
            calculatePositions();
        });
    });
}

document.addEventListener("DOMContentLoaded", renderHistory);

// --- Keep screen awake (Wake Lock API) ---
let wakeLock = null;

async function acquireWakeLock() {
    if (!("wakeLock" in navigator)) return false;
    try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
        return true;
    } catch (e) {
        console.warn("Wake lock request failed", e);
        wakeLock = null;
        return false;
    }
}

async function releaseWakeLock() {
    if (wakeLock) {
        try { await wakeLock.release(); } catch (e) { /* ignore */ }
        wakeLock = null;
    }
}

function setupKeepAwake() {
    const toggle = document.getElementById("keepAwakeToggle");
    if (!toggle) return;

    if (!("wakeLock" in navigator)) {
        toggle.disabled = true;
        toggle.parentElement.title = "Wake Lock not supported in this browser";
        toggle.parentElement.classList.add("opacity-50", "cursor-not-allowed");
        return;
    }

    toggle.addEventListener("change", async () => {
        if (toggle.checked) {
            const ok = await acquireWakeLock();
            if (!ok) toggle.checked = false;
        } else {
            await releaseWakeLock();
        }
    });

    // Re-acquire when the tab becomes visible again (browsers auto-release on hide)
    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible" && toggle.checked && !wakeLock) {
            const ok = await acquireWakeLock();
            if (!ok) toggle.checked = false;
        }
    });
}

document.addEventListener("DOMContentLoaded", setupKeepAwake);

function renderResult(positions, spaceWidth, boardLengths) {
    const dataTableVertical = [positions.map(p=>p.toFixed(0)), boardLengths.map(bl => bl.toFixed(0))];
    const htmlTable = makeTable(dataTableVertical, ["left edge [mm]", "length, long edge [mm]"]);
    const resultHTML = `
        <div class="mt-4 text-left">
            <div class="font-bold p-2">Spacing: <span>${spaceWidth.toFixed(0)}</span> mm</div>
            <button onclick="startMarkingMode()" type="button"
                class="my-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Start marking ▶
            </button>
            ${htmlTable}
        </div>
    `;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = resultHTML;
}

function makeTable(tableData, labels) {
    const areColumnHeaders = labels.length === tableData.length;
    const areRowLabels = !areColumnHeaders && labels.length === tableData[0].length;

    let headers = "";
    let body = "";

    if (areColumnHeaders) {
        headers = `
            <thead>
                <tr>
                    ${labels.map(label => `<th class="p-2 font-bold">${label}</th>`).join("")}
                </tr>
            </thead>
        `;
    }

    body = "<tbody>";
    const rowCount = tableData[0].length;

    for (let row = 0; row < rowCount; row++) {
        body += "<tr>";
        if (areRowLabels) {
            body += `<td class="p-2 font-bold">${labels[row]}</td>`;
        }
        for (let col = 0; col < tableData.length; col++) {
            body += `<td class="p-2"><span class="p-2"><input type="checkbox"></span>${tableData[col][row]}</td>`;
        }
        body += "</tr>";
    }
    body += "</tbody>";

    return `
        <table class="border-collapse w-full">
            ${headers}
            ${body}
        </table>
    `;
}

function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}

// --- Marking mode ---
let markingState = null;

// eslint-disable-next-line no-unused-vars
function startMarkingMode() {
    if (!lastResult || !lastResult.positions || lastResult.positions.length === 0) return;
    markingState = { index: 0, total: lastResult.positions.length };
    document.getElementById("markingOverlay").classList.remove("hidden");
    setupVoiceToggleAvailability();
    renderMarking();
    speakCurrent();
}

// eslint-disable-next-line no-unused-vars
function exitMarkingMode() {
    document.getElementById("markingOverlay").classList.add("hidden");
    stopVoiceRecognition();
    cancelSpeech();
    markingState = null;
}

// eslint-disable-next-line no-unused-vars
function markingNextStep() {
    if (!markingState) return;
    const next = markingNext(markingState);
    // If already at last and trying to advance, exit
    if (next.index === markingState.index && markingState.index === markingState.total - 1) {
        speak("Done");
        setTimeout(exitMarkingMode, 800);
        return;
    }
    markingState = next;
    renderMarking();
    speakCurrent();
}

// eslint-disable-next-line no-unused-vars
function markingPrev() {
    if (!markingState) return;
    markingState = markingBack(markingState);
    renderMarking();
    speakCurrent();
}

// eslint-disable-next-line no-unused-vars
function markingRepeat() {
    speakCurrent();
}

function renderMarking() {
    if (!markingState || !lastResult) return;
    const i = markingState.index;
    const pos = lastResult.positions[i];
    const len = lastResult.boardLengths[i];
    document.getElementById("markingPosition").textContent = pos.toFixed(0);
    const lengthEl = document.getElementById("markingLength");
    if (len !== undefined && !isNaN(len)) {
        lengthEl.textContent = `Board length: ${len.toFixed(0)} mm`;
        lengthEl.classList.remove("hidden");
    } else {
        lengthEl.textContent = "";
        lengthEl.classList.add("hidden");
    }
    document.getElementById("markingProgress").textContent =
        `Position ${i + 1} of ${markingState.total}`;
}

// --- Text to speech ---
function cancelSpeech() {
    if ("speechSynthesis" in window) {
        try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
}

function speak(text) {
    if (!("speechSynthesis" in window)) return;
    cancelSpeech();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    speechSynthesis.speak(utter);
}

function speakCurrent() {
    if (!markingState || !lastResult) return;
    const pos = lastResult.positions[markingState.index];
    speak(`${pos.toFixed(0)} millimeters`);
}

// --- Speech recognition (voice commands) ---
let recognition = null;
let voiceWanted = false;

function getRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function setupVoiceToggleAvailability() {
    const toggle = document.getElementById("voiceToggle");
    const label = document.getElementById("voiceToggleLabel");
    if (!toggle) return;
    if (!getRecognitionCtor()) {
        toggle.disabled = true;
        toggle.checked = false;
        label.title = "Voice recognition not supported in this browser";
        label.classList.add("opacity-50", "cursor-not-allowed");
    }
}

function setVoiceStatus(text) {
    const el = document.getElementById("voiceStatus");
    if (el) el.textContent = text;
}

function startVoiceRecognition() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    if (recognition) return;

    voiceWanted = true;
    recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (!event.results[i].isFinal) continue;
            const transcript = event.results[i][0].transcript;
            const cmd = parseVoiceCommand(transcript);
            setVoiceStatus(cmd ? `Heard: "${transcript.trim()}" → ${cmd}` : `Heard: "${transcript.trim()}"`);
            if (cmd === "next") markingNextStep();
            else if (cmd === "back") markingPrev();
            else if (cmd === "repeat") markingRepeat();
            else if (cmd === "stop") exitMarkingMode();
        }
    };

    recognition.onerror = (e) => {
        console.warn("Speech recognition error", e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
            voiceWanted = false;
            const toggle = document.getElementById("voiceToggle");
            if (toggle) toggle.checked = false;
            setVoiceStatus("Microphone permission denied");
        }
    };

    recognition.onend = () => {
        // Browsers stop after silence; restart if user still wants it
        if (voiceWanted && markingState) {
            try { recognition.start(); } catch (e) { /* may throw if already starting */ }
        } else {
            recognition = null;
            setVoiceStatus("");
        }
    };

    try {
        recognition.start();
        setVoiceStatus("Listening… say next, back, repeat, or stop");
    } catch (e) {
        console.warn("Could not start recognition", e);
    }
}

function stopVoiceRecognition() {
    voiceWanted = false;
    if (recognition) {
        try { recognition.stop(); } catch (e) { /* ignore */ }
    }
    setVoiceStatus("");
}

function setupVoiceToggle() {
    const toggle = document.getElementById("voiceToggle");
    if (!toggle) return;
    toggle.addEventListener("change", () => {
        if (toggle.checked) startVoiceRecognition();
        else stopVoiceRecognition();
    });
}

document.addEventListener("DOMContentLoaded", setupVoiceToggle);

// Keyboard shortcuts in marking mode
document.addEventListener("keydown", (e) => {
    if (!markingState) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault(); markingNextStep();
    } else if (e.key === "ArrowLeft") {
        e.preventDefault(); markingPrev();
    } else if (e.key.toLowerCase() === "r") {
        e.preventDefault(); markingRepeat();
    } else if (e.key === "Escape") {
        e.preventDefault(); exitMarkingMode();
    }
});
