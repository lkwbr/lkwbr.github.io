/* landscape.js */

"use strict";

class Landscape extends Grid {

  constructor(el, width, height) {
    super();

    this.el = el;
    this.width = width; // px
    this.height = height; // px

    this.numRows = null;
    this.numCols = null;

    // Cells will be DOM (not JS) objects
    this.cells = null;

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
    var cells = [];
		for (var i = 0; i < this.numRows; i++) {
			var row = createDOMObject(rowStr);	
			for (var j = 0; j < this.numCols; j++) {
				var cell = createDOMObject(cellStr);	
		
				//var randColor = this.board.palette[Math.floor(Math.random() * this.board.palette.length)];
				//this.aShowCell(cell, randColor);
				
				cell.width(this.cellSize + "em");
				cell.height(this.cellSize + "em");

				row.append(cell);
			}
			this.landscape.append(row);
		}
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

  loadShape(shape) {
    // TODO
    // Create interface contract for a shape and use "extends"
  }
}
