let destructoTest = function (canvas) {
  // :)
  let dot;
  let total = 10000;
  let t1;
  let t2;
  let getRandomInt = fabric.util.getRandomInt;

  let maxx = canvas.width;
  let maxy = canvas.height;

  let startTimer = function () {
    t1 = new Date().getTime();
    return t1;
  };

  let stopTimer = function () {
    t2 = new Date().getTime();
    return t2 - t1;
  };

  startTimer();
  for (let i = total; i >= 0; i--) {
    dot = new fabric.Circle({
      left: getRandomInt(0, maxx),
      top: getRandomInt(0, maxy),
      radius: 3,
      fill: "black",
      objectCaching: false
    });
    canvas.add(dot);
  }
  canvas.renderAll();
  console.log(`Regular ( objectCaching = false ) rendering of ${total} elements in ${stopTimer()} ms`);
}
