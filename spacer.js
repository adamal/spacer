// eslint-disable-next-line no-unused-vars
function calculatePositions() {
    console.log("Function is being called");  // Added for debugging

    var sectionWidth = parseFloat(document.getElementById("sectionWidth").value);
    var boardWidth = parseFloat(document.getElementById("boardWidth").value);
    var numberOfBoards = parseInt(document.getElementById("numberOfBoards").value);
    var numberOfSpacesRadios = document.getElementsByName("numberOfSpaces");
    var numberOfSpaces;
    for (var i = 0; i < numberOfSpacesRadios.length; i++) {
        if (numberOfSpacesRadios[i].checked) {
            numberOfSpaces = numberOfSpacesRadios[i].value;
            break;
        }
    }
    var offset = parseFloat(document.getElementById("offset").value);
    const first = parseFloat(document.getElementById("firstBoard").value);
    const last = parseFloat(document.getElementById("lastBoard").value);

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

    const boardLengths = calculateLengths(first, last, numberOfBoards);

    positions = positions.map(p => p + offset);

    renderResult(positions, spaceWidth, boardLengths);
}

function calculateLengths(first, last, nBoards) {
    const delta = (last-first)/(nBoards-1);
    const boardLengths = [];
    for (let i = 0; i < nBoards; i++) {
        boardLengths.push(first+i*delta);
    }

    return boardLengths;
}

function renderResult(positions, spaceWidth, boardLengths) {
    const dataTableVertical = [positions.map(p=>p.toFixed(1)), boardLengths.map(bl => bl.toFixed(1))];
    // const dataTableHorizontal = transpose(dataTableVertical);
    const htmlTable = makeTable(dataTableVertical, ["left edge", "length, long edge"]);
    // Set up the final output
    const resultHTML = `
        <div class="mt-4 text-left">
            <div class="font-bold p-2">Spacing: <span>${(spaceWidth * 10).toFixed(0)}</span> mm</div>
            ${htmlTable}
        </div>
    `;

    // Render the final output into the result div
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = resultHTML;
}

function makeTable(tableData, labels) {
    // Check if the labels are for columns or rows
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