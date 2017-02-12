/* page.js */

/* "The Big Cheese": Handles pagelets, interactions, and such for whole page */

"use strict";

class Page {
  constructor() {
    
    // Color palette
    this.paletteLoc = "res/palettes/palette_3.csv";
    this.palette = null;

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

    this.loadPalette();

		// NOTE: Order of these calls is very important
    this.createCustomElements();
    this.setupFavicon();

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

  loadFriendishWord() {

    let friendishLoc = "res/content/words/friendish.csv";

    jQuery.get(friendishLoc, function(data) {

      let arrs = $.csv.toArrays(data);
      let rando = Math.ceil(Math.random() * (arrs.length - 1)); 

      let noun = arrs[rando][0];
      let lang = arrs[rando][1];

      $("#friendish").text(noun).attr("title", lang);        
    });

  }

  // Populate CSS from CSV palette
  loadPalette() {

    let palette = [];

    // TODO: Remove syncronous CSV fetching
    jQuery.ajaxSetup({ async:false });
    this.getPaletteCSV(function(data) {
      var arrs = $.csv.toArrays(data);
      for (var i = 1; i < arrs.length; i++) {
        palette.push(arrs[i][1]); 
      }
      jQuery.ajaxSetup({ async:true });
    });

    this.palette = palette;
    return palette;
  }

  getPaletteCSV(callback) {
    jQuery.get(this.paletteLoc, function(data) {
      callback(data);        
    });
  }

  getRandomColor() {
    var i = Math.floor(Math.random() * this.palette.length);
    var color = this.palette[i];
    return color;
  }

  // Randomly create favicon
	// TODO: Extract main functionality into library function (second commit)
  setupFavicon() {

    let canvas = createDOMObject("<canvas></canvas>");
    let context = canvas[0].getContext("2d");
 		// TODO: Add inline styling
		let icon = createDOMObject("<div xmlns='http://www.w3.org/1999/xhtml'><h1>FUCK</h1></div>");
		//let popCSS = $(".pop").css();
		//icon.css(popCSS);
		icon.addClass("pop");
		
    let data = "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>" +
             		"<foreignObject width='100%' height='100%'>" +
									icon.outerHTML() +	
             		"</foreignObject>" +
           		"</svg>"; 

		let DOMURL = self.URL || self.webkitURL || self;
		let img = new Image();
		let svg = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
		let url = DOMURL.createObjectURL(svg);
		img.onload = function() {
			context.drawImage(img, 0, 0);
			DOMURL.revokeObjectURL(url);
		};
		img.src = url;
		
    // Remove past, add new
    changeFavicon(url);

    // TODO: Figure out how to go from img -> favicon

    console.log(img);

		//this.pageE.append(img);

    // Link to favicon.png
  }

  generateColorNoun() {
    // Give random noun with random background color
    let color = this.getRandomColor();
    let noun = "--";
    let padFact = 0.75;

    let friendish = createDOMObject("<span></span>").text(noun).css({
      "background-color": color,
      "font-weight": "bold",
      "color": "white",
      "padding-top": (padFact * 0.25) + "em",
      "padding-left": (padFact * 0.5) + "em",
      "padding-right": (padFact * 0.5) + "em",
      "padding-bottom": (padFact * 0.5) + "em",
    }).attr("id", "friendish").addClass("pop").outerHTML();

    // Async: fetch friend word
    this.loadFriendishWord();

    return friendish;
  }

  createCustomElements() {
    // Motivation: I'm a control freak. GitHub pages will not allow link 
    // clicks to be stopped and processed with custom JS code; rather, 
    // they just redirect to the URL anyways! I want to dynamically load content
    // on this page without any silly redirects. Thus, I create my own type
    // of link that GitHub cannot interfere with.
    
    // Short for "dynamic link"
    var DLink = document.registerElement("d-a", {
      prototype: Object.create(HTMLElement.prototype)
    }); 
  }

  fragHandler(e) {

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
    
    // Side pane link events
    var pathLoadMap = {
      "home":self.loadHome,
      "about":self.loadAbout,
      "projects":self.loadProjects,
      "events":self.loadEvents,
      "research":self.loadResearch,
      "academics":self.loadAcademics,
      "resume":self.loadResume
    }; 

		// Handle custom and outsid links
    $("d-a").click(function(e) {
      // Get link
      var href = e.currentTarget.attributes["href"].value;
     
      // Check if custom link	
			if (href.substring(0, 2) == "./") {
				// Load custom content
				var pathName = href.substring(2); 
				var pathLoadFunc = pathLoadMap[pathName]; 
				pathLoadFunc(self);
			} else { 
        // Regular link
        window.location.href = href; 	
      }
    });

    // Cell presses
    $(".pop").click(function(e) {
      // TODO: React to cell press
      console.log("Cell clicked!");
    });
  }

  loadHome(self) {
    self.contentE.empty();
    self.board.show();
  }

  loadAbout(self) {
    self.board.hide();
    self.contentE.load("res/content/main/about.html");
    self.contentE.show();
  }
  
  loadProjects(self) {
    self.board.hide();
    self.contentE.load("res/content/main/projects.html");
    self.contentE.show();
  }

  loadEvents(self) {
    self.board.hide();
    self.contentE.load("res/content/main/events.html");
    self.contentE.show();
  }

  loadResearch(self) {
    self.board.hide();
    self.contentE.load("res/content/main/research.html");
    self.contentE.show();
  }
  
  loadAcademics(self) {
    self.board.hide();
    self.contentE.load("res/content/main/academics.html");
    self.contentE.show();
  }
  
  loadResume(self) {
		window.location.assign('res/pdf/resume.pdf');
  }

  center(el) {
    el.css({
      position:"absolute",
      left: ($(window).width() - el.outerWidth()) / 2,
      //top: ($(window).height() - el.outerHeight()) / 2
    });
  }

  loadBoard() {
    this.board = new Board(this.boardE, this.doodleE, this.morgueE, this.ranksE, 
      this.cellSize, this.boardSize, this.boardSize, this.palette);
    this.engine = new Engine(this.board, this.renderRate);

    // Kick 'em in the balls
    this.engine.start();

    // Hide non-Chrome user warning
    this.contentE.hide();
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
    var noun = this.generateColorNoun();
		var introStr = "<p id='intro'>Hello " + noun + " &mdash; <i>my name is</i></p>";
		var nameStr = "<h1>LUKE WEBER</h1>";
    var sep = "<p class='sep'>//</p>";
		var subtitleStr = "<div id='subtitle'><div id='handle'>@lukedottec</div> " + sep + " computer scientist</div>";
		var mugshotStr = "<div id='mugshot'></div>";

		var intro = createDOMObject(introStr);
		var name = createDOMObject(nameStr);
		var subtitle = createDOMObject(subtitleStr);
		this.mugshot = createDOMObject(mugshotStr);
		this.loadMugshot(this.mugshot);

		// Connection
		tableColLeft.append(intro);	
		tableColLeft.append(name);	
		tableColLeft.append(subtitle);	
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

    // Origin for shape
    var row = Math.floor(this.landscape.numRows * 0.5); 
    var col = Math.floor(this.landscape.numCols * 0.75); 
    var origin = [row, col];

    // Load shape, giving it landscape and origin
		this.shape = new FollowerShape(this.landscape);	
    this.shape.setOrigin(origin);

    // Setup mouse over event
    var self = this;
    this.titleE.mousemove(function(e) {
      //console.log("mouse over landscape"); 
      self.shape.draw();
    });
	}

	loadMugshot(mugshot) {

    var imgWrapper = createDOMObject("<div></div>");
		var img = createDOMObject("<img src='res/images/mugshot.png' />");
    imgWrapper.width("13em");
    img.css({
      "width": "7em",
      "display": "block",
      "margin": "auto",
      "opacity": "1"
    });
    imgWrapper.append(img);
		mugshot.append(imgWrapper);						

    mugshot.css({
      "color":"gray", 
      "font-style":"italic"
    }).attr("title", "Hiding under the floorboards, I have finally found you...");
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
    // TODO: Automatically pull these from /res/content
    var linkTopics = ["home", "about", "projects", "events", "research", "academics", "resume"];
    linkTopics.forEach(function(item) {
      var ls = "<d-a href='./" + item +"'>" + item + "</d-a>";
      var l = createDOMObject(ls);
      links.append(l);
    });
    this.sideE.append(links);

    // Social media
    var tableStr = "<table></table"; 
    var tableRowStr = "<tr></tr>"; 
    var tableColStr = "<td></td>"; 
		var linkStr = "<d-a></d-a>";
		var imgStr = "<img>";

    var imgLinkMap = {
			"row1":{
				"res/images/github.png":"https://github.com/lukedottec",
				"res/images/linkedin.png":"https://www.linkedin.com/in/lukedottec",
			},
			"row2":{
				"res/images/facebook.png":"https://www.facebook.com/lukedottec",
				"res/images/email.png":"mailto:lukedottec@gmail.com"
			}
    };

		var table = createDOMObject(tableStr);
		for (var r in imgLinkMap) {
			var o = imgLinkMap[r];
			var row = createDOMObject(tableRowStr);

			for (var l in o) {
				var url = o[l]; 
				var col = createDOMObject(tableColStr);

				var link = createDOMObject(linkStr);
				var img = createDOMObject(imgStr);	
				link.attr("href", url);
				img.attr("src", l);
				img.css("width", this.cellSize * 1.5 + "em");
				img.css("height", this.cellSize * 1.5 + "em");

				link.append(img);
				col.append(link);
				row.append(col);	
			} 	
			table.append(row);	
		}
		this.sideE.append(table);		

  }

  loadFoot() {
    // Smelly
		this.footE.html("<div>MultiConway [<d-a href='https://github.com/lukedottec/BunFun'>Source</d-a>]</div><div><i>Variation of Conway's Game of Life</i></div>");	
  }
}
