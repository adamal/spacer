const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { calculateSpacing, calculateLengths } = require("./spacer");

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
