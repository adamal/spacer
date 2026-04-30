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

if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculateSpacing, calculateLengths, addToHistory };
}
