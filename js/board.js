/* board.js */

"use strict";

class Cell {
  constructor(color, width, height, row, col) {
    this.remaining = 10 + Math.floor(Math.random() * 10); // time-frames 
    this.growthRate = 1; // unit free
    this.text = "";

    this.color = color;
    this.width = width;
    this.height = height; 

    this.row = row;
    this.col = col;
  }
}

class Node {
	constructor(data) {
		this.data = data;
		this.next = null;
	}
}

// Simple: Remove from head, add to tail
class Queue {
	constructor() {
		this.root = null;
		this.length = 0;
	}

	enqueue(data) {
		this.length++;

		// Root case
		if (this.root == null) { this.root = new Node(data); }

		// Rest of the time
		var temp = this.root;	
		while (temp.next != null) {
			temp = temp.next;
		}
		temp.next = new Node(data);
	}

	dequeue(data) {
		this.length--;

		if (data == null) {
			// Root case
			if (this.root == null) { return null; }

			// Normal
			var top = this.root;
			this.root = this.root.next; 
			return top;
		}
	}

	print() {
		var temp = this.root;
		var s = "MORGUE: ";
		while (temp != null) {
			s += temp.data + ","
			temp = temp.next;
		}
	}
}

class Board {
  constructor(panel, el, title, info, cellSize, numRows, numCols, palette) {
    
		// TODO: Rename
    this.init = true;

		// UI stuff
    this.panel = panel; 
    this.el = el; 
    this.title = title;
    this.info = info;
		this.hidden = false;

		// Board characteristics
    this.cellWidth = this.cellHeight = cellSize; // em
    this.numRows = numRows;
    this.numCols = numCols;
    this.population = 0.85; // density

		// Event stuff
		this.setupEvents();
    this.eventContexts = {};

		// Bring out 'ya dead!
		this.morgue = new Queue(); 

		// Setup UI (partly) 
    this.palette = palette; 
    this.palettePop = Array.apply(null, Array(this.palette.length)).map(function (x, i) { return i; });
    this.cells = this.generate(numRows, numCols);
  }

  // Create and return (randomized) DOM board object
  generate(numRows, numCols) {
    var cells = [];
    for (var i = 0; i < numRows; i++) {	
      for (var j = 0; j < numCols; j++) {
        // Balance cells and space
        var rand = Math.random(); 
        if (rand < this.population) {
          // Create & add cell with random color 
          rand = Math.floor(Math.random() * this.palette.length);
          var color = this.palette[rand];
          cells.push(new Cell(color, this.cellWidth, this.cellHeight, i, j));  
        } else {
          cells.push(null);  
        }
      }	
    }	

    return cells;
  }  

  isInBounds(row, col) {
    if ((row < 0) || (row >= this.numRows) || (col < 0) || (col >= this.numCols)) {
      return false; 
    } else { 
      return true; 
    }
  }

  // Create new cell of given color at (row, col)
  createCell(color, row, col) {
    if (this.isInBounds(row, col) != true) { return null; } 
    var cell = new Cell(color, this.cellWidth, this.cellHeight, row, col); 
    this.cells[this.getIndex(row, col)] = cell;
    return cell;
  } 

  // Put given cell at (row, col)
  setCell(cell, row, col) {
		// Check if cell has been killed
		if (cell == null) { 
			this.morgue.enqueue(this.cells[this.getIndex(row, col)].color); 
		}

    if (this.isInBounds(row, col) != true) { return null; } 
    this.cells[this.getIndex(row, col)] = cell;
	}

  getIndex(row, col) {
    return (row * this.numRows) + col;
  }

  getCellID(row, col) {
    return row + "-" + col;
  }

  getCell(row, col) {
    if (this.isInBounds(row, col) != true) { return null; } 
    return this.cells[this.getIndex(row, col)];
  }

  getAdjacentCells(row, col) {
    var adj = [];

    // Check all surrounding 8 cells
    var adders = [[0, 1], [0, -1], [1, 1], [1, 0], [1, -1], [-1, 1], [-1, 0], [-1, -1]];
    for (var i = 0; i < adders.length; i++) {
      var candidate = this.getCell(row + adders[i][0], col + adders[i][1]);
      if (candidate != null) {
        adj.push(candidate);  
      }
    }

    return adj; 
  }

  // Distance between two cells
  getDistance(one, two) {
    // Check valid argumens
    if (((one instanceof Cell) == false) || ((two instanceof Cell) == false)) {
      return null; 
    }

    // Manhatten distance
    var dist = Math.abs(one.row - two.row) + Math.abs(one.col - two.col); 
    return dist;
  }
 
	setupEvents() {
		// TODO
	}

	// Subscribe to fragments which "fall" off end
	// of fragment assembly line; func argument must
	// be a function which accepts JSON object with
	// "color" field
	// NOTE: Currently only one subscriber per event
	subscribe(eventName, context, func) {		
		this.eventContexts[eventName] = context;	
		$(document).on(eventName, func); 	
	}
	
	// Trigger event with given name with given data,
	// which is a JSON object with field "color"
	trigger(eventName, data) {
		// Pass the context for function in
		// the event data (because JavaScript :3 )
		$.event.trigger({
			type:eventName,
			color:data,
			context:this.eventContexts[eventName]
		});
	}
 
  // Dynamic, changing
  showTitle() {

		// Init
    if (this.init == true) {

			// Create fragments
      var fragStr = "<div></div>";
      var self = this;
			for (var i = 0; i < this.numCols; i++) { 	
        var frag = createDOMObject(fragStr);
				frag.css("width", this.cellWidth + "em");	
				frag.css("height", this.cellHeight + "em");
				frag.addClass("frag");

        self.title.append(frag);
      }
    }

    // Update info
		var frags = [];
    this.title.children().each(function() {
      frags.push($(this)); 
    });
		var i = frags.length - 1; 

		// Shift everything over to right
		while (i >= 0) {
			var frag = frags[i];
			var backFrag = (i == (frags.length - 1)) ? null : frags[i + 1];
			var fragColor = frag.css("background-color");

			// Only pop live cells 
			if (fragColor != "rgba(0, 0, 0, 0)") {
				frag.addClass("pop");	
			} else {
				frag.removeClass("pop");	
			}

			if (backFrag == null) {
				// At very right: push a cell body to a subscriber, if any 
				var eventData = {"color": fragColor};
				this.trigger("frag", eventData);	
			} else {
				backFrag.css("background-color", fragColor);
			}

			i--;
		}

		// Insert at leftmost  
		// Add new frag (if there's a body available)	
		var newFrag = this.morgue.dequeue();
		if (newFrag == null) {
			// Set cell empty	
			frags[0].css("background-color", "rgba(255, 255, 255, 0)");
		} else {
			frags[0].css("background-color", newFrag.data);
		}
  }

	width() {
		return this.numCols * this.cellWidth; // em 
	}

	// Keep running, but stop displaying the board
	hide() {
		this.hidden = true;
		this.el.hide();
	}

	// Show board  
	show() {
		this.hidden = false;
		this.el.show();
	}

  // Dynamic, possibly changing information on each iteration
  showInfo() {

    // Create info area first
    if (this.init == true) {
      var swatchStr = "<div></div>";
      var i = 0;
			var bw = this.width(); 
			var sw = (bw / this.palette.length) + "em";

      var self = this;
      this.palette.forEach(function(item) {
        var swatch = createDOMObject(swatchStr);
        swatch.addClass("swatch");
        swatch.addClass("pop");
        swatch.attr("id", "swatch-" + i); 
        swatch.css("background-color", item);
				swatch.css("height", self.cellHeight + "em");	
				swatch.css("width", sw);	

        self.info.append(swatch);
        i++;
      });
    }

		// Rank colors in palette based on population
		var colorMax = Math.max(...this.palettePop);
		var colorProps = [];
		var colorOffset = 0.9; // i.e. min transparency
		var totalPop = 0;	
		this.palettePop.forEach(function(item) {
			var prop = ((1 - colorOffset) * (item / colorMax)) + colorOffset;	
			colorProps.push(prop);
			totalPop += item;	
		});

    // Update info
		var i = 0; 
		var self = this;
    this.info.children().each(function() {
      var swatch = $(this);
      var opacity = colorProps[i];
	
			// Special treatment for top-dog
			if (opacity == 1) {
			} else {
			}	

			// Set dynamic width
			var dsw = (((self.palettePop[i] / totalPop) * self.width()) / self.cellWidth); 
			swatch.css("width", dsw + "em");	

			// Set opacity
      swatch.css("opacity", opacity); 	
			i++;
    });
  }

  // Logic -> UI
  draw() {
    // HTML templates
    var cellTmp = "<div class='cell'></div>";
    var rowTmp = "<div class='row'></div>"
    var colTmp = "<div class='col'></div>"

    // First-time stuff -- build board
    if (this.init) { 
      // Gimme your lunch money
      this.el.empty(); 
      
      // Add cells
      for (var i = 0; i < this.numRows; i++) {
        var row = createDOMObject(rowTmp); 
        for (var j = 0; j < this.numCols; j++) {
          var cell = createDOMObject(cellTmp);
          var id = this.getCellID(i, j);
          cell.attr("id", id);

          row.append(cell);
        }
        this.el.append(row);
      } 
    }

		// No need to display when it's not showing
		if (this.hidden != true) {

			// Clear population data
			this.palettePop.fill(0);

			// Display cell object state (namely color) to UI cell 
			for (var i = 0; i < this.numRows; i++) {
				for (var j = 0; j < this.numCols; j++) {
					var objCell = this.getCell(i, j);
					var id = this.getCellID(i, j);
					var uiCell = $("#" + id); 

					// Properties
					var text = null; 
					var color = null; 
					var width = null; 
					var height = null;

					if (objCell == null) { 
						// Defaults
						text = "";
						color = "transparent";
						width = this.cellWidth;
						height = this.cellHeight; 

						// Denote active for CSS
						uiCell.removeClass("pop");

					} else {
						// Live cell
						text = objCell.text;
						color = objCell.color;
						width = objCell.width;
						height = objCell.height; 

						// Denote active for CSS
						uiCell.addClass("pop");

						// Update knowledge about population
						// TODO: Move to engine.js
						var colorIndex = 0; 
						this.palette.some(function(item) {
							if (color == item) { return true; };
							colorIndex++;
						});
						this.palettePop[colorIndex] += 1;
					} 

					// Display
					uiCell.text(text);
					uiCell.css("background-color", color);
					uiCell.css("width", width + "em");
					uiCell.css("height", height + "em");

				}
			}
		}

    this.showTitle();
    // Update info
    // NOTE: Gotta be run while this.init is true, and
    // after we display/process each cell
    this.showInfo();

    // Do some stuff after board has been setup
    if (this.init == true) {
      $(window).resize();
      this.init = false;
    }
  }
}
