// https://eli.thegreenplace.net/2013/10/22/classical-inheritance-in-javascript-es5

// Shape - superclass
// x,y: location of shape's bounding rectangle
function Shape(x, y) {
  this.x = x
  this.y = y
}

// Superclass method
Shape.prototype.move = function (x, y) {
  this.x += x
  this.y += y
}

// Circle - subclass
function Circle(x, y, r) {
  // Call constructor of superclass to initialize superclass-derived members.
  Shape.call(this, x, y)

  // Initialize subclass's own members
  this.r = r
}

// Circle derives from Shape
Circle.prototype = Object.create(Shape.prototype)
Circle.prototype.constructor = Circle  // Set constructor back to Circle

// Subclass methods. Add them after Circle.prototype is created with
// Object.create
Circle.prototype.area = function () {
  return this.r * 2 * Math.PI
}

//////
// Tried this in the console, but the last one didn't work, so...
let shp = new Shape(1, 2)
console.log([shp.x, shp.y])
shp.move(1, 1)
console.log([shp.x, shp.y])
console.log()

let cir = new Circle(5, 6, 2)
console.log([cir.x, cir.y, cir.r])
cir.move(1, 1)
console.log([cir.x, cir.y, cir.r])
console.log(cir.area())
console.log()

let shape_proto = Object.getPrototypeOf(shp)
let circle_proto = Object.getPrototypeOf(cir)
console.log(Object.getPrototypeOf(circle_proto) === shape_proto)
console.log()

console.log(cir instanceof Shape)
console.log(cir instanceof Circle)
console.log(shp instanceof Shape)
console.log(shp instanceof Circle)
console.log()

console.log(cir.constructor === Circle)
// Create a new Circle object based on an existing Circle instance
let new_cir = new cir.constructor(3, 4, 1.5)
console.log(new_cir) // <-- *
