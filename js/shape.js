/* shape.js */

"use strict";

class Shape {
  constructor(landscape) {
    this.landscape = landscape;
    this.origin = null;
  }

  // Expecting [row, col]
  setOrigin(origin) {
    this.origin = origin;
  }

  draw() { }
}
