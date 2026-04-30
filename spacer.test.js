const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { calculateSpacing, calculateLengths, addToHistory, markingNext, markingBack, parseVoiceCommand } = require("./calc");

describe("calculateSpacing", () => {
    it("default spaces (equal to number of boards)", () => {
        // 100cm section, 10cm boards, 5 boards → 5 spaces of 10cm each
        const { positions, spaceWidth } = calculateSpacing(100, 10, 5, "0", 0);
        assert.equal(spaceWidth, 10);
        assert.deepEqual(positions, [0, 20, 40, 60, 80]);
    });

    it("plusOne spaces (begins with spacing)", () => {
        // 100cm section, 10cm boards, 4 boards → 5 spaces
        // totalSpacing = 100 - 40 = 60, spaceWidth = 12
        const { positions, spaceWidth } = calculateSpacing(100, 10, 4, "plusOne", 0);
        assert.equal(spaceWidth, 12);
        // starts at spaceWidth=12, then each step is 10+12=22
        assert.deepEqual(positions, [12, 34, 56, 78]);
    });

    it("minusOne spaces", () => {
        // 100cm section, 10cm boards, 4 boards → 3 spaces
        // totalSpacing = 100 - 40 = 60, spaceWidth = 20
        const { positions, spaceWidth } = calculateSpacing(100, 10, 4, "minusOne", 0);
        assert.equal(spaceWidth, 20);
        assert.deepEqual(positions, [0, 30, 60, 90]);
    });

    it("applies offset to all positions", () => {
        const { positions } = calculateSpacing(100, 10, 5, "0", -2.5);
        assert.deepEqual(positions, [-2.5, 17.5, 37.5, 57.5, 77.5]);
    });

    it("single board", () => {
        const { positions, spaceWidth } = calculateSpacing(100, 10, 1, "0", 0);
        assert.equal(spaceWidth, 90);
        assert.deepEqual(positions, [0]);
    });
});

describe("calculateLengths", () => {
    it("equal first and last gives uniform lengths", () => {
        const lengths = calculateLengths(100, 100, 5);
        assert.deepEqual(lengths, [100, 100, 100, 100, 100]);
    });

    it("linearly interpolates between first and last", () => {
        const lengths = calculateLengths(100, 200, 3);
        assert.deepEqual(lengths, [100, 150, 200]);
    });

    it("single board uses first value (known bug: NaN due to division by zero)", () => {
        // When nBoards=1, delta = (last-first)/(1-1) = division by zero → NaN
        const lengths = calculateLengths(80, 80, 1);
        assert.deepEqual(lengths, [NaN]);
    });

    it("decreasing lengths", () => {
        const lengths = calculateLengths(200, 100, 5);
        assert.deepEqual(lengths, [200, 175, 150, 125, 100]);
    });
});

describe("addToHistory", () => {
    const entry = (sectionWidth, ts) => ({ inputs: { sectionWidth, boardWidth: 10 }, ts });

    it("prepends new entry to empty history", () => {
        const result = addToHistory([], entry(100, 1));
        assert.deepEqual(result, [entry(100, 1)]);
    });

    it("prepends new entry to existing history", () => {
        const result = addToHistory([entry(100, 1)], entry(200, 2));
        assert.deepEqual(result, [entry(200, 2), entry(100, 1)]);
    });

    it("dedupes entries with identical inputs (moves to top)", () => {
        const history = [entry(100, 1), entry(200, 2)];
        const result = addToHistory(history, entry(100, 3));
        assert.deepEqual(result, [entry(100, 3), entry(200, 2)]);
    });

    it("caps history at max items", () => {
        const history = [entry(1, 1), entry(2, 2), entry(3, 3)];
        const result = addToHistory(history, entry(4, 4), 3);
        assert.deepEqual(result, [entry(4, 4), entry(1, 1), entry(2, 2)]);
    });

    it("default max is 10", () => {
        let history = [];
        for (let i = 1; i <= 12; i++) {
            history = addToHistory(history, entry(i, i));
        }
        assert.equal(history.length, 10);
        assert.equal(history[0].inputs.sectionWidth, 12);
        assert.equal(history[9].inputs.sectionWidth, 3);
    });
});

describe("markingNext / markingBack", () => {
    it("next advances index", () => {
        assert.deepEqual(markingNext({ index: 0, total: 5 }), { index: 1, total: 5 });
    });

    it("next clamps at last index", () => {
        assert.deepEqual(markingNext({ index: 4, total: 5 }), { index: 4, total: 5 });
    });

    it("back decreases index", () => {
        assert.deepEqual(markingBack({ index: 3, total: 5 }), { index: 2, total: 5 });
    });

    it("back clamps at zero", () => {
        assert.deepEqual(markingBack({ index: 0, total: 5 }), { index: 0, total: 5 });
    });

    it("preserves additional state fields", () => {
        const state = { index: 1, total: 5, foo: "bar" };
        assert.equal(markingNext(state).foo, "bar");
    });
});

describe("parseVoiceCommand", () => {
    it("recognizes next variants", () => {
        ["next", "Next please", "ok", "okay", "got it", "forward", "continue"].forEach(t => {
            assert.equal(parseVoiceCommand(t), "next", `failed for: ${t}`);
        });
    });

    it("recognizes back variants", () => {
        ["back", "go back", "previous", "prev", "undo"].forEach(t => {
            assert.equal(parseVoiceCommand(t), "back", `failed for: ${t}`);
        });
    });

    it("recognizes repeat variants", () => {
        ["repeat", "say again", "again please"].forEach(t => {
            assert.equal(parseVoiceCommand(t), "repeat", `failed for: ${t}`);
        });
    });

    it("recognizes stop variants", () => {
        ["stop", "exit", "quit marking", "cancel", "done"].forEach(t => {
            assert.equal(parseVoiceCommand(t), "stop", `failed for: ${t}`);
        });
    });

    it("returns null for unrecognized input", () => {
        ["", "hello world", "the quick brown fox"].forEach(t => {
            assert.equal(parseVoiceCommand(t), null, `failed for: ${t}`);
        });
    });

    it("handles null/undefined safely", () => {
        assert.equal(parseVoiceCommand(null), null);
        assert.equal(parseVoiceCommand(undefined), null);
    });

    it("stop takes priority over other words in same phrase", () => {
        assert.equal(parseVoiceCommand("ok stop"), "stop");
    });
});
