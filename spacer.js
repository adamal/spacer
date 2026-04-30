// eslint-disable-next-line no-unused-vars
function calculatePositions() {
    const inputs = readInputs();

    const { positions, spaceWidth } = calculateSpacing(
        inputs.sectionWidth, inputs.boardWidth, inputs.numberOfBoards,
        inputs.numberOfSpaces, inputs.offset);
    const boardLengths = calculateLengths(inputs.first, inputs.last, inputs.numberOfBoards);

    renderResult(positions, spaceWidth, boardLengths);
    saveToHistory(inputs);
    renderHistory();
}

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
