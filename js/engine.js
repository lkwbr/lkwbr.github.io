/* engine.js */

/* Engine for simulating multi-Conway */

"use strict";

class Engine {
  constructor(board, interval) {
    this.board = board; 
    this.interval = interval;
    this.intervalID = null;
    this.t = 0; // time

    // First-time draw
    this.board.draw();
  }

  // Vroom every interval 
  start() {
    // TODO
    this.intervalID = setInterval.call(this, this.vroom, this.interval); 
    console.log("Turned key");
  }

  stop() {
    clearInterval(this.intervalID);
    console.log("Engine stopped");
  }

  // Drive universe through an epic expedition through both space and time
  vroom() {
    console.log("Vroom!");

    // O(n): Enumerate board
    for (var i = 0; i < this.board.numRows; i++) {
      for (var j = 0; j < this.board.numCols; j++) {

        var cell = this.board.getCell(i, j);

        var colorDict = {}; 
        var adj = this.board.getAdjacentCells(i, j);

        // Get frequencies of colors of surrounding cells
        var self = this; // temp
        adj.forEach(function(item) {
          var color = item.color;
          if (color in colorDict) { colorDict[color] += 1; }  
          else { colorDict[color] = 1; }
        }); 

        // Birth and/or kill cells 
        if (cell == null) { 
          var maxFreq = -1;
          var maxColor = null;
          for (var color in colorDict) {
            if (colorDict.hasOwnProperty(color)) {
              if (colorDict[color] > maxFreq) {
                maxColor = color; 
                maxFreq = colorDict[color];    
              } 
            }
          }

          // Reproduction (for same-color cells)
          // TODO: Could rarely reproduce cells of different colors and
          // have the resultant child be a "mixed" color
          if (maxFreq === 3) { 
            var babyCell = this.board.createCell(maxColor, i, j);
          } 
        } else {

          // One year off cell's life
          cell.remaining--;
          
          // NOTE: neighbors >= relatives
          var neighbors = adj.length;
          var relatives = colorDict[cell.color];
          relatives = (relatives == null) ? 0: relatives;

          // Death by:
          //    - Underpopulation (from same-color cells), 
          //    - Overpopulation (from any cell), or 
          //    - Old age
          var noBreed = (relatives != 2) && (relatives != 3);
          var underPop = (relatives < 2) && noBreed;
          var overPop = (neighbors > 3) && noBreed;
          var oldAge = cell.remaining == 0;
          var dead = underPop || overPop || oldAge;  

          if (dead) { 
            this.board.setCell(null, i, j); 
          }
        }
      }
    } 

    // Draw and increment time 
    this.t++;
    this.board.draw();
  }
}
