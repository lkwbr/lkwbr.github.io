/* page.js */

/*
The Big Cheese:
  Dynamically handles pagelets, interactions, animations, and general
  information for whole website.
*/

"use strict";

class Page {
    constructor() {

        // Color palette
        this.paletteLoc = "res/palettes/palette_2.csv";
        this.palette = null;

        // Main page elements
        this.pageE = $("#page");
        this.titleE = $("#title");
        this.landscapeE = null; // dynamically created
        this.mugshotE = null;   // " "
        this.sideE = $("#side");
        this.contentE = $("#content");
        this.boardE = $("#board");
        this.doodleE = $("#doodle");
        this.morgueE = $("#morgue");
        this.ranksE = $("#ranks");
        this.footE = $("#foot");

        // Environment properties
        this.boardSize = 25;    // cells
        this.cellSize = 0.5;      // em
        this.renderRate = 5000; // ms

        // Objects
        this.board = null;
        this.engine = null;
        this.shape = null;
        this.landscape = null;
    }

    // Party starts
    init() {

        // NOTE: Order of these calls is very important
        this.loadPalette();
        this.createCustomElements();
        this.setupFavicon();

        // Load title, board, and side panel
        this.loadTitle();
        this.loadBoard();
        // this.loadSide();
        this.loadFoot();

        this.setupWidth();
        this.setupEvents();

        this.loadLandscape();
        this.loadShape();

        // Adjust window
        $(window).resize();
    }

    loadFriendishWord() {

        /*

        let friendishLoc = "res/content/words/friendish.csv";

        jQuery.get(friendishLoc, function (data) {

            // #let arrs = $.csv.toArrays(data);
            let arrs = [
                // ['word', 'language'],
                // ['buddy', 'English'],
                // ['amigo', 'Spanish'],
                // ['venn', 'Norwegian'],
                // ['друг', 'Russian'],
                // ['ven', 'Danish'],
                // ['mik', 'Albanian'],
                // ['বন্ধু', 'Bengali'],
                // ['priateľ', 'Slovak'],
                // ['přítel', 'Czech'],
                // ['vän', 'Swedish'],
                // ['arkadaş', 'Turkish'],
                // ['दोस्त', 'Hindi'],
                // ['amigos', 'Portuguese'],
                // ['umngane', 'Zulu'],
                // ['ընկեր', 'Armenian'],
                // ['vriend', 'Afrikaans'],
                // ['Frënd', 'Luxembourgish'],
                // ['один', 'Ukrainian'],
                // ['prijatelj', 'Croatian'],
                // ['пријатељ', 'Serbian']
            ]
            let rando = Math.ceil(Math.random() * (arrs.length - 1));

            let noun = arrs[rando][0];
            let lang = arrs[rando][1];

            $("#friendish").text(noun).attr("title", lang);
        });
        */

    }

    // Populate CSS from CSV palette
    loadPalette() {

        let palette = [
            // '#CAE7B9',
            // '#F3DE8A',
            // '#EB9486',
            // '#7E7F9A',
            // '#97A7B3'
        ];

        // TODO: Remove syncronous CSV fetching
        jQuery.ajaxSetup({ async: false });
        this.getPaletteCSV(function (data) {
            var arrs = $.csv.toArrays(data);
            for (var i = 1; i < arrs.length; i++) {
                palette.push(arrs[i][1]);
            }
            jQuery.ajaxSetup({ async: true });
        });

        console.log('palette', palette)

        this.palette = palette;
        return palette;
    }

    getPaletteCSV(callback) {
        jQuery.get(this.paletteLoc, function (data) {
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
        let svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
        let url = DOMURL.createObjectURL(svg);
        img.onload = function () {
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
        // let color = this.getRandomColor();
        let color = '#000' 
        let noun = "you";
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
        var DLink = customElements.define("d-a", HTMLElement)
    }

    fragHandler(e) {

        var color = e.color.color;
        var context = e.context;

        // Move side's fragments over
        // NOTE: This code is same as in board.js, so think about extracting and
        // making modular
        // TODO: Don't hard-code #nav
        var frags = [];
        $("#side #nav").children().each(function () {
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
        $(window).resize(function () {
            // Center whole UI
            self.center(self.pageE);
        });

        // Subscribe to board's "frag" line
        this.board.subscribe("frag", this, this.fragHandler);

        // Side pane link events
        var pathLoadMap = {
            "home": self.loadHome,
            "blog": self.loadBlog,
            "about": self.loadAbout,
            "projects": self.loadProjects,
            "events": self.loadEvents,
            "research": self.loadResearch,
            "academics": self.loadAcademics,
            "resume": self.loadResume
        };

        // Handle custom and outsid links
        $("d-a").click(function (e) {
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
        $(".pop").click(function (e) {
            // TODO: React to cell press
            console.log("Cell clicked!");
        });
    }

    loadHome(self) {
        self.contentE.empty();
        self.board.show();
    }

    loadBlog(self) {
        self.board.hide();
        self.contentE.load("res/content/main/blog.html");
        self.contentE.show();
    }

    loadAbout(self) {
        self.board.hide();
        self.contentE.load("res/content/main/about.html");
        self.contentE.show();
    }

    loadProjects(self) {

        // Go away, Conway
        self.board.hide();

        // Load project content heading + description
        self.contentE.load("res/content/main/projects.html", function () {
            // Load in GitHub projects after content loads
            let projectList = createDOMObject("<div id='project-list'></div>");
            projectList.loadRepositories("lukedottec");
            self.contentE.append(projectList);
        });

        // Voila!
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
        /*
        el.css({
            position: "absolute",
            left: ($(window).width() - el.outerWidth()) / 2,
            //top: ($(window).height() - el.outerHeight()) / 2
        });
        */
    }

    loadBoard() {
        this.board = new Board(this.boardE, this.doodleE, this.morgueE, this.ranksE,
            this.cellSize, this.boardSize / 4, this.boardSize, this.palette);
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
        //var subtitleStr = "<div id='subtitle'><div id='handle'>@lukedottec</div> " + sep + " computer scientist</div>";
        // var subtitleStr = "<div id='subtitle'><div id='handle'>@lkgwbr</div>";
        var descStr = `
            <div>
                <div style='margin-top: 0rem; font-size: 1.5rem;'>
                    Chief Engineer / Research Scientist at <a href='https://omic.ai'>Omic</a>
                </div>
                <div style='margin-top: 1rem;'>
                    <div>
                        <a href='https://scholar.google.com/lkgwbr' style='pointer-events: none; color: #aaa;'>Google Scholar (not yet)</a> - 
                        <a href='https://github.com/lkgwbr'>GitHub</a> - 
                        <a href='https://gitlab.com/lkgwbr'>GitLab</a> - 
                        <a href='https://medium.com/@lkgwbr'>Medium</a> - 
                    </div>
                    <div>
                        <a href='https://soundcloud.com/lkgwbr'>SoundCloud</a> - 
                        <a href='https://www.duolingo.com/profile/lkgwbr'>DuoLingo</a> - 
                        <a href='https://lichess.org/@/lukedottec'>lichess</a> -
                        <a href='https://open.spotify.com/playlist/1jrQoiXQrO9Pj57idZrNz9'>Spotify</a> -
                    </div>
                    <div>
                        <a href='https://play.google.com/store/apps/developer?id=lukedottec&hl=sr__%23Latn'>Google Play</a> - 
                        <a href='https://www.npmjs.com/~lukedottec'>NPM</a> -
                        <a href='https://pypi.org/user/lukedottec/'>PyPI</a>
                    </div>
                </div>
            </div>
        `;
        var mugshotStr = "<div id='mugshot'></div>";

        var intro = createDOMObject(introStr);
        var name = createDOMObject(nameStr);
        // var subtitle = createDOMObject(subtitleStr);
        var desc = createDOMObject(descStr);
        this.mugshot = createDOMObject(mugshotStr);
        this.loadMugshot(this.mugshot);

        // Connection
        tableColLeft.append(intro);
        tableColLeft.append(name);
        // tableColLeft.append(subtitle);
        tableColLeft.append(desc);
        tableColRight.append(this.mugshot);
        tableRow.append(tableColLeft);
        tableRow.append(tableColRight);
        table.append(tableRow);

        // NOTE: Setting height here; not best decision
        this.titleE.height("13em");

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
        // NOTE: Shape will animate itself on landscape when
        // outside calls Shape.draw()

        // Origin for shape
        var row = Math.floor(this.landscape.numRows * 0.1);
        var col = Math.floor(this.landscape.numCols * 0.83);
        var origin = [row, col];

        // Load shape, giving it landscape and origin
        this.shape = new FollowerShape(this.landscape);
        this.shape.setOrigin(origin);

        // Setup mouse over event
        var self = this;
        this.titleE.mousemove(function (e) {
            //console.log("mouse over landscape");
            self.shape.draw();
        });
    }

    loadMugshot(mugshot) {}

    loadSide() {}

    loadFoot() {}
}
