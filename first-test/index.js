const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");
const cw = c.width
const ch = c.height

function cls() {
  ctx.clearRect(0, 0, cw, ch);
}

class Point {
  constructor(x,y) {
    this.x = x
    this.y = y
  }
}

class Line {
  constructor(from, to) {
    this.from = from
    this.to = to
  }

  interpolate(r) {
    const deltaX = this.to.x - this.from.x
    const deltaY = this.to.y - this.from.y
    const interpolatedX = this.from.x + (deltaX * r)
    const interpolatedY = this.from.y + (deltaY * r)
    return new Point(interpolatedX,interpolatedY)
  }

  draw() {
    ctx.moveTo(this.from.x,this.from.y)
    ctx.lineTo(this.to.x,this.to.y)
  }
}

class Rectangle {
  constructor(x,y,w,h) {
    this.leftTop = new Point(x,y)
    this.rightTop = new Point(x+w,y)
    this.leftBottom = new Point(x,y+h)
    this.rightBottom = new Point(x+w,y+h)
  }

  get lines() {
    return {
      top: new Line(this.leftTop,this.rightTop),
      bottom: new Line(this.leftBottom,this.rightBottom),
      right: new Line(this.rightTop,this.rightBottom),
      left: new Line(this.leftTop,this.leftBottom)
    }
  }

  draw() {
    Object.values(this.lines).forEach(l => l.draw())
  }
}

function crossLine(l1,r1,l2,r2) {
  const pointOnL1 = l1.interpolate(r1)
  const pointOnL2 = l2.interpolate(r2)
  return new Line(pointOnL1,pointOnL2)
}

function generateGrid(rect,xFreq,yFreq) {
  const lines = rect.lines

  let result = []
  for (let i = 1; i < xFreq; i++) {
    result.push(crossLine(lines.top, (i/xFreq), lines.bottom, (i/xFreq)));
  }

  for (let i = 1; i < yFreq; i++) {
    result.push(crossLine(lines.left,(i/yFreq), lines.right,(i/yFreq)));
  }

  return result
}

function drawGrid(x,y,w,h,xFreq,yFreq) {
  const xStep = w/xFreq
  for (let i = 0; i < xFreq; i++) {
    ctx.moveTo(x+(i*xStep),y)
    ctx.lineTo(x+(i*xStep),y+h)
  }

  const yStep = h/yFreq
  for (let i = 0; i < yFreq; i++) {
    ctx.moveTo(x,y+(i*yStep))
    ctx.lineTo(x+w,y+(i*yStep))
  }
}

const r = 0.5
const outerBox = new Rectangle(0, 0, cw, ch)
const innerBox = new Rectangle(cw*(1-r), ch*(1-r), cw*r, ch*r)

outerBox.draw()
innerBox.draw()

const freq = 10
for (let i = 0; i < freq; i++) {
  crossLine(outerBox.lines.top,(i/freq),innerBox.lines.top,(i/freq)).draw()
}
for (let i = 0; i < freq; i++) {
  crossLine(outerBox.lines.left,(i/freq),innerBox.lines.left,(i/freq)).draw()
}

// drawGrid(innerBox.x,innerBox.y,innerBox.w,innerBox.h,10,10)
generateGrid(innerBox,10, 10).forEach(l => l.draw())

ctx.stroke();


// ctx.moveTo(0, 0);
// ctx.lineTo(300, 300);
// ctx.stroke();

// for (let i = 0; i <100; i++) {
//   ctx.beginPath();
//   ctx.arc(i, i, i*1.5, 0, Math.PI * (i/100));
//   ctx.stroke();
// }

// let j = 0
// setInterval(()=> {
//   cls()
//   for (let i = 0; i <100; i++) {
//     ctx.beginPath();
//     ctx.arc(i, i, j, 0, Math.PI);
//     ctx.stroke();
//   }
//   j+=0.01
// },10)

