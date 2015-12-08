var foo = require('./foo.js');
var blah = require('./websocketexample.js').foo;

console.log("Hello! " + foo);

function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    ctx.fillRect(25,25,100,100);
    ctx.clearRect(45,45,60,60);
    ctx.strokeRect(50,50,50,50);
  }
}

window.draw = draw;

blah();

