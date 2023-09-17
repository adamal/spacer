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
    var spaceWidthMm = totalSpacingWidth / spaces * 10;

    var positions = [];
    var position = beginWithSpacing ? spaceWidthMm : 0;

    for (var i = 0; i < numberOfBoards; i++) {
        positions.push(position);
        position += boardWidth + spaceWidthMm;
    }

    renderResult(positions, spaceWidthMm)
    // var resultDiv = document.getElementById("result");
    // resultDiv.innerHTML = "<strong>Spacing width: </strong>" + spaceWidth.toFixed(2) + " cm<br><strong>Positions from edge (in cm):</strong><br>" + positions.map(x => x.toFixed(2)).join("<br>");
}

function renderResult(positions, spaceWidth) {
    // Get the template content
    const template = document.getElementById("result-template").content.cloneNode(true);

    // Fill the template with data
    template.querySelector(".spacing-width").textContent = spaceWidth.toFixed(0);

    const positionsList = template.querySelector(".positions-list");

    const isHorizontalLayout = false;
    if (isHorizontalLayout) {
        positionsList.classList.add("flex", "space-x-4");
    } else {
        positionsList.classList.remove("flex", "space-x-4");
    }

    positions.forEach(pos => {
        const li = document.createElement("li");
        li.textContent = pos.toFixed(1);
        positionsList.appendChild(li);
    });

    // Render the template into the result div
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ''; // Clear previous content
    resultDiv.appendChild(template);
}
