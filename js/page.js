/* page.js */

/* Handles pagelets and such for navigation */

"use strict";

class Page {
  constructor() {
    // Main page elements
    this.pageE = $("#page");
    this.titleE = $("#title");
		this.landscapeE = null; // dynamically created
    this.mugshotE = null; // " " 
    this.sideE = $("#side");
    this.contentE = $("#content");
    this.boardE = $("#board");
    this.doodleE = $("#doodle");
    this.morgueE = $("#morgue");
    this.ranksE = $("#ranks");
    this.footE = $("#foot");

    // Environment properties
    this.boardSize = 30; // cells 
    this.cellSize = 1; // em
    this.renderRate = 1000; // ms 
    
    // Objects
    this.board = null;
    this.engine = null;
		this.shape = null;
		this.landscape = null;
  }

  // TODO: Turn doodle into content, and have this be able to run in background
  // while there are other displays over it
  // TODO: UI elements dynamically responding to state of board
  // TODO: Better naming
  // TODO: Way better MVC compliancy!

  // Party starts
  init() {
		// NOTE: Order of these calls is very important

    // Load title, board, and side panel
    this.loadTitle(); 
    this.loadBoard(); 
    this.loadSide();
    this.loadFoot();

    this.setupWidth();
    this.setupEvents();

		this.loadLandscape();
		this.loadShape();

    // Adjust window
    $(window).resize();
  }

  fragHandler(e) {
    //console.log(e);
    var color = e.color.color;
    var context = e.context;

    // Move side's fragments over
    // NOTE: This code is same as in board.js, so think about extracting and
    // making modular
    // TODO: Don't hard-code #nav
    var frags = [];
    $("#side #nav").children().each(function() {
      frags.push($(this));
    });
    var i = frags.length - 1

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
			} else {
				backFrag.css("background-color", fragColor);
			}

			i--;
		}

		// Insert at leftmost from event 
		frags[0].css("background-color", color);
  }

  graveyard() {
    // TODO: Randomly pile up dead bodies below
    // TODO: Be able to select individual cells by hovering
    // TODO: Find a way to sustain the game longer with cooler patterns
  }

  setupWidth() {
    // Set page width to board
    var bw = $(this.board.width()).toPx();
    bw = parseInt(bw.substring(0, bw.length - 2)); // trim "px"
    var sw = this.sideE.width();
    var pw = $(bw + sw).toEm();

    this.pageE.width(pw);
    this.contentE.width(bw);
    this.footE.width(bw);
  }

	// NOTE: Only call after setupWidth
	width() {
    var bw = $(this.board.width()).toPx();
    bw = parseInt(bw.substring(0, bw.length - 2)); // trim "px"
    var sw = this.sideE.width();
    var pw = $(bw + sw).toEm();

		return pw;
	}

  setupEvents() {

    var self = this;

    // Board-centering event
    $(window).resize(function() {
			// Center whole UI
      self.center(self.pageE);
    }); 

    // Subscribe to board's "frag" line
    this.board.subscribe("frag", this, this.fragHandler);
    
    // Stop link redirecting
    $('a').click(function() {
      return false;
    });

    // Side pane link events
    var linkLoadMap = {
      "home":self.loadHome,
      "about":self.loadAbout,
      "projects":self.loadProjects,
      "research":self.loadResearch,
      "academics":self.loadAcademics,
      "resume":self.loadResume
    }; 
    $("#side #links a").click(function(e) {
      // Get link name
      var linkName = e.target.pathname.substring(1); 
      var linkLoadFunc = linkLoadMap[linkName]; 
      
      linkLoadFunc(self);
    });
  }

  loadHome(self) {
    self.contentE.empty();
    self.board.show();
  }

  loadAbout(self) {
    self.board.hide();
    self.contentE.load("res/content/about.html");
  }
  
  loadProjects(self) {
    self.board.hide();
    self.contentE.load("res/content/projects.html");
  }

  loadResearch(self) {
    self.board.hide();
    self.contentE.load("res/content/research.html");
  }
  
  loadAcademics(self) {
    self.board.hide();
    self.contentE.load("res/content/academics.html");
  }
  
  loadResume(self) {
		window.location.assign('res/pdf/resume.pdf');
  }

  center(el) {
    el.css({
      position:"absolute",
      left: ($(window).width() - el.outerWidth()) / 2,
      top: ($(window).height() - el.outerHeight()) / 2
    });
  }

  loadBoard() {
    this.board = new Board(this.boardE, this.doodleE, this.morgueE, this.ranksE, this.cellSize, this.boardSize, this.boardSize);
    this.engine = new Engine(this.board, this.renderRate);

    // Kick 'em in the balls
    this.engine.start();
  }

  loadTitle() {
		
		// Grid
		var landscapeStr = "<div id='landscape'></div>";
		this.landscapeE = createDOMObject(landscapeStr);

		// Table
		var tableStr = "<table></table>";
		var tableRowStr = "<tr></tr>";
		var tableColStr = "<td></td>";

		var table = createDOMObject(tableStr);
		var tableRow = createDOMObject(tableRowStr);
		var tableColLeft = createDOMObject(tableColStr);
		var tableColRight = createDOMObject(tableColStr);

		// Content
		var introStr = "<p id='intro'>hello friend, my name is</p>";
		var nameStr = "<h1>luke weber</h1>";
		var handleStr = "<div id='handle'>@lukedottec</div> // computer scientist // n00b";
		var mugshotStr = "<div id='mugshot'></div>";

		var intro = createDOMObject(introStr);
		var name = createDOMObject(nameStr);
		var handle = createDOMObject(handleStr);
		this.mugshot = createDOMObject(mugshotStr);
		this.loadMugshot(this.mugshot);

		// Connection
		tableColLeft.append(intro);	
		tableColLeft.append(name);	
		tableColLeft.append(handle);	
		tableColRight.append(this.mugshot);	
		tableRow.append(tableColLeft);
		tableRow.append(tableColRight);
		table.append(tableRow);

		// NOTE: Setting height here; not best decision
		this.titleE.height("9em");

		// Table adjustment
		table.css("width", "100%");
		var tableWidth = table.outerWidth();
		var leftWidth = tableColLeft.outerWidth();
		var rightWidth = tableWidth - leftWidth; 
		tableColRight.width(rightWidth);

		// Final connection
		this.titleE.append(this.landscapeE);
    this.titleE.append(table);
  }

	loadLandscape() {	

		// Width and height
		var height = this.titleE.outerHeight();
		var width = this.titleE.outerWidth();

		// Landscape creation  
		this.landscape = new Landscape(this.landscapeE, width, height);
	}

	loadShape() {
		
		// Determine origin		
		

		
		this.shape = new Shape();	
		
		// Load shape into landscape	
		this.landscape.loadShape(this.shape);
	}

	loadMugshot(mugshot) {
		var img = createDOMObject("<img src='https://s-media-cache-ak0.pinimg.com/236x/9a/3b/1d/9a3b1df438ed9966344b79720da5f211.jpg' />");
		//mugshot.append(img);						
	}

  loadSide() {
    // Create nav
    var navString = "<div id='nav'></div>";
    var nav = createDOMObject(navString);

    // Create fragment top
    var fragStr = "<div></div>";
    var numFrag = 10;
    for (var i = 0; i < numFrag; i++) { 	
      var frag = createDOMObject(fragStr);
      frag.css("width", this.cellSize + "em");	
      frag.css("height", this.cellSize + "em");
      frag.addClass("frag");

      nav.append(frag);
    }
    this.sideE.append(nav);

    // Create link body
    var linksString = "<div id='links'></div>";
    var links = createDOMObject(linksString); 
    
    // Write links
    var linkTopics = ["home", "about", "projects", "research", "academics", "resume"];
    linkTopics.forEach(function(item) {
      var ls = "<a href='./" + item +"'>" + item + "</a>";
      var l = createDOMObject(ls);
      links.append(l);
    });
    this.sideE.append(links);
  }

  loadFoot() {
    // Smelly
		this.footE.html("<div>MultiConway <a href='.'>[Source]</a></div><div><i>Variation of Conway's Game of Life</i></div>");	
  }
}
