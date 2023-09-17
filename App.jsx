import { createSignal, onCleanup } from 'solid-js';

// Pure function to calculate board positions
function calculateBoardPositions(sectionWidth, boardWidth, idealSpacing, activeSpaces, manualNumberOfBoards, numberOfBoards) {
  let numSpaces = activeSpaces === 'plusOne' ? numberOfBoards + 1 : (activeSpaces === 'equal' ? numberOfBoards : numberOfBoards - 1);
  const totalSpacingWidth = sectionWidth - (numberOfBoards * boardWidth);
  const spacingWidth = totalSpacingWidth / numSpaces;

  let positions = '';
  let totalWidth = 0;
  for (let i = 0; i < numberOfBoards; i++) {
    if (i < numberOfBoards || activeSpaces === 'equal' || activeSpaces === 'plusOne') {
      totalWidth += spacingWidth;
      positions += (totalWidth).toFixed(1) + ' cm, ';
    }
    totalWidth += boardWidth;
    positions += (totalWidth).toFixed(1) + ' cm, ';
  }

  return {
    spacingWidth: spacingWidth * 10,
    positions: positions.slice(0, -2),
    numberOfBoards,
  };
}

export default function App() {
  const [sectionWidth, setSectionWidth] = createSignal(0);
  const [boardWidth, setBoardWidth] = createSignal(10);
  const [idealSpacing, setIdealSpacing] = createSignal(5);
  const [activeSpaces, setActiveSpaces] = createSignal('plusOne');
  const [manualNumberOfBoards, setManualNumberOfBoards] = createSignal(false);
  const [numberOfBoards, setNumberOfBoards] = createSignal(0);

  // Effect to calculate board positions when relevant values change
  let results;
  onCleanup(() => {
    const sectionWidthVal = parseFloat(sectionWidth()) || 0;
    const boardWidthVal = parseFloat(boardWidth()) || 0;
    const idealSpacingVal = parseFloat(idealSpacing()) / 10 || 0.5; // converting to cm

    if (!manualNumberOfBoards() || !numberOfBoards()) {
      setNumberOfBoards(Math.round((sectionWidthVal + idealSpacingVal) / (boardWidthVal + idealSpacingVal)));
    }

    results = calculateBoardPositions(sectionWidthVal, boardWidthVal, idealSpacingVal, activeSpaces(), manualNumberOfBoards(), numberOfBoards());
  });

  return (
    <div class="max-w-2xl mx-auto p-4">
      <div class="flex mb-4">
        <label for="sectionWidth" class="w-1/2 pr-2">Section width (cm):</label>
        <input type="number" id="sectionWidth" class="w-1/2 border rounded p-1" value={sectionWidth()} onInput={(e) => setSectionWidth(e.target.value)} />
      </div>

      <div class="flex mb-4">
        <label for="boardWidth" class="w-1/2 pr-2">Board width (cm):</label>
        <input type="number" id="boardWidth" class="w-1/2 border rounded p-1" value={boardWidth()} onInput={(e) => setBoardWidth(e.target.value)} />
      </div>

      <div class="flex mb-4">
        <label for="idealSpacing" class="w-1/2 pr-2">Ideal spacing (mm):</label>
        <input type="number" id="idealSpacing" class="w-1/2 border rounded p-1" value={idealSpacing()} onInput={(e) => setIdealSpacing(e.target.value)} />
      </div>

      <div class="flex mb-4">
        <label class="w-1/2 pr-2">Number of spaces:</label>
        <div class="space-button-container w-1/2 flex">
          <button class={`space-button w-1/3 p-2 border rounded text-center ${activeSpaces() === 'plusOne' ? 'active' : ''}`} onClick={() => { setManualNumberOfBoards(false); setActiveSpaces('plusOne'); }}>+1</button>
          <button class={`space-button w-1/3 p-2 border rounded text-center ${activeSpaces() === 'equal' ? 'active' : ''}`} onClick={() => { setManualNumberOfBoards(false); setActiveSpaces('equal'); }}>0</button>
          <button class={`space-button w-1/3 p-2 border rounded text-center ${activeSpaces() === 'minusOne' ? 'active' : ''}`} onClick={() => { setManualNumberOfBoards(false); setActiveSpaces('minusOne'); }}>-1</button>
        </div>
      </div>

      <div class="flex mb-4">
        <label for="numberOfBoards" class="w-1/2 pr-2">Number of boards:</label>
        <input type="number" id="numberOfBoards" class="w-1/2 border rounded p-1" value={numberOfBoards()} onInput={(e) => { setNumberOfBoards(parseInt(e.target.value)); setManualNumberOfBoards(true); }} />
      </div>

      <div id="result" class="mb-4">
        <div>Spacing width: {results?.spacingWidth.toFixed(1)} mm</div>
        <div>Positions from the edge: {results?.positions}</div>
        <div>Closest board count for ideal spacing: {results?.numberOfBoards}</div>
        <div>Actual spacing for closest board count: {results?.spacingWidth.toFixed(1)} mm</div>
      </div>

      {/* Visual representation can be added here */}
    </div>
  );
}
