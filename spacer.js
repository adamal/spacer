function calculatePositions() {
    console.log("Function is being called");  // Added for debugging

    var sectionWidth = parseFloat(document.getElementById("sectionWidth").value);
    var boardWidth = parseFloat(document.getElementById("boardWidth").value);
    var numberOfBoards = parseInt(document.getElementById("numberOfBoards").value);
    var numberOfSpaces = document.getElementById("numberOfSpaces").value;

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

    var resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<strong>Spacing width: </strong>" + spaceWidth.toFixed(2) + " cm<br><strong>Positions from edge (in cm):</strong><br>" + positions.map(x => x.toFixed(2)).join("<br>");
}
