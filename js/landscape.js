/* landscape.js */

/* Landscape grid given to shape to animate on */

"use strict";

class Landscape extends Grid {

  constructor(el, width, height) {
    super();

    this.el = el;
    this.width = width; // px
    this.height = height; // px

    this.numRows = null;
    this.numCols = null;

    // Cells will be DOM (not JS) objects, which
    // are a 1-D array treated logically as a 
    // 2-D array
    this.cells = [];
    this.cellSize = 1; // em

    this.init(); 
  }

  // Create landscape board of cells
  init() {
    // Set HTML
	  this.el.height(this.height);
		this.el.width(this.width);

		var wEm = $(this.width).toEm();
		var hEm = $(this.height).toEm();

		// Determine dimenions of landscape grid; need integer
		this.numRows = Math.floor(parseInt(hEm.substring(0, hEm.length - 2))) / this.cellSize;
		this.numCols = Math.floor(parseInt(wEm.substring(0, wEm.length - 2))) / this.cellSize;

		var cellStr = "<div class='cell'></div>";
		var rowStr = "<div class='row'></div>";
	
		// Create grid
		for (var i = 0; i < this.numRows; i++) {
			var row = createDOMObject(rowStr);	
			for (var j = 0; j < this.numCols; j++) {
				var cell = createDOMObject(cellStr);	
		
				cell.width(this.cellSize + "em");
				cell.height(this.cellSize + "em");

				row.append(cell);
        this.cells.push(cell);
			}
			this.el.append(row);
		}

    console.log(this);
    console.log("Landscape initialized");
  }

  getCell(x, y) {
    let index = (this.numCols * y) + x;
    return this.cells[index];
  }

  // Asynchronous dipsplaying of cell
  aShowCell(cell, color) {
		setTimeout(function() {
			var rand =  1 * Math.floor(Math.random() * 2);
			cell.addClass("pop");
			cell.css("background-color", color);			
			cell.css("opacity", Math.random());			
			setTimeout(function() {
				cell.removeClass("pop");
				cell.css("opacity", 0);			
			}, 100);
		}, Math.random() * 1000);
	}
}
