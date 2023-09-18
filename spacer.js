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
    // const isHorizontalLayout = false;  // Toggle between true or false as desired
    // const quantities = positions.map(pos => pos * 1.5);  // Mocking a second array of data

    // // Generate content based on layout
    // // const generateContent = (pos, quantity) => {
    // //     if (isHorizontalLayout) {
    // //         return `
    // //             <div class="flex space-x-4">
    // //                 <div>${pos.toFixed(1)}</div>
    // //                 <div>${quantity.toFixed(1)}</div>
    // //             </div>
    // //         `;
    // //     } else {
    // //         return `
    // //             <tr>
    // //                 <td>${pos.toFixed(1)}</td>
    // //                 <td>${quantity.toFixed(1)}</td>
    // //             </tr>
    // //         `;
    // //     }
    // };

    // const generatedPositions = positions.map((pos, index) => 
    //     generateContent(pos, quantities[index])
    // ).join("");

    // const wrapper = isHorizontalLayout ? "div" : "table";

    const dataTableVertical = [positions.map(p=>p.toFixed(1)), boardLengths.map(bl => bl.toFixed(1))];
    const dataTableHorizontal = transpose(dataTableVertical);
    const htmlTable = makeTable(dataTableVertical, ["left edge", "length, long edge"]);
    
    // <div class="mt-2 font-bold">${isHorizontalLayout ? "Positions and Quantities:" : "Positions from edge (in cm) and Quantities:"}</div>
    // <${wrapper} class="mt-2 positions-container">
    //     ${generatedPositions}
    // </${wrapper}>
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
            body += `<td class="p-2">${tableData[col][row]}</td>`;
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

// Example usage:
const tableData = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
const labels = ["A", "B", "C"];
console.log(makeTable(tableData, labels));  // This will generate a table with column headers


function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}