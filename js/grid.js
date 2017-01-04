/* grid.js */

/* UI for DOM grid */

class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  // Construct grid in interface
  init() { }

  getCell(row, col) { }
  setCell(cell, row, col) { }
}



// Manipulated by controller, updates view
class Model {
  constructor(view) {
    this.view = view;
  } 
}

// Updated by model, displayed to page
class View {
  constructor(user) {
    this.user = user; 
  }
}

// Used by page, manipulates model
class Controller {
  constructor(model) {
    this.model = model;

    
  }
}

// Displayed to by view, uses controller
class User {
  constructor(controller) {
    this.controller = controller;
  }

  click() { 
       
  } 
}
