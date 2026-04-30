function calculateSpacing(sectionWidth, boardWidth, numberOfBoards, numberOfSpaces, offset) {
    var spaces;
    var beginWithSpacing = false;
    switch (numberOfSpaces) {
    case "plusOne":
        spaces = numberOfBoards + 1;
        beginWithSpacing = true;
        break;
    case "minusOne":
        spaces = numberOfBoards - 1;
        break;
    default:
        spaces = numberOfBoards;
        break;
    }

    var totalSpacingWidth = sectionWidth - (numberOfBoards * boardWidth);
    var spaceWidth = totalSpacingWidth / spaces;

    var positions = [];
    var position = beginWithSpacing ? spaceWidth : 0;

    for (var i = 0; i < numberOfBoards; i++) {
        positions.push(position);
        position += boardWidth + spaceWidth;
    }

    positions = positions.map(p => p + offset);

    return { positions, spaceWidth };
}

function calculateLengths(first, last, nBoards) {
    const delta = (last-first)/(nBoards-1);
    const boardLengths = [];
    for (let i = 0; i < nBoards; i++) {
        boardLengths.push(first+i*delta);
    }

    return boardLengths;
}

// Adds `entry` to the front of `history`. If an entry with the same
// `inputs` already exists, it is removed first (so the entry moves to
// the top). The list is capped at `max` items.
function addToHistory(history, entry, max = 10) {
    const sameInputs = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const filtered = history.filter(h => !sameInputs(h.inputs, entry.inputs));
    return [entry, ...filtered].slice(0, max);
}

// --- Marking mode state ---
// state shape: { index: number, total: number }
function markingNext(state) {
    return { ...state, index: Math.min(state.index + 1, state.total - 1) };
}

function markingBack(state) {
    return { ...state, index: Math.max(state.index - 1, 0) };
}

// Map a heard transcript to a marking command. Returns one of:
// "next" | "back" | "repeat" | "stop" | null
function parseVoiceCommand(transcript) {
    if (!transcript) return null;
    const t = transcript.toLowerCase().trim();
    // order matters: check more specific phrases first
    if (/\b(stop|exit|quit|cancel|done)\b/.test(t)) return "stop";
    if (/\b(repeat|again|say again)\b/.test(t)) return "repeat";
    if (/\b(back|previous|prev|undo)\b/.test(t)) return "back";
    if (/\b(next|forward|ok|okay|got it|continue)\b/.test(t)) return "next";
    return null;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        calculateSpacing,
        calculateLengths,
        addToHistory,
        markingNext,
        markingBack,
        parseVoiceCommand,
    };
}
