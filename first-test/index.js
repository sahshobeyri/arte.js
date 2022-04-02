const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");
const cw = c.width
const ch = c.height

function cls() {
  ctx.clearRect(0, 0, cw, ch);
}

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

class Point {
  constructor(x,y) {
    this.x = x
    this.y = y
  }

  draw(color = '#000000') {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 10, 0, 2* Math.PI);
    ctx.strokeStyle = color
    ctx.stroke()
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
    ctx.beginPath()
    ctx.moveTo(this.from.x,this.from.y)
    ctx.lineTo(this.to.x,this.to.y)
    ctx.stroke()
  }
}

class Rect {
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

class Quad {
  constructor(l1,l3) {
    this.l1 = l1
    this.l2 = crossLine(l1,0,l3,0)
    this.l3 = l3
    this.l4 = crossLine(l1,1,l3,1)
  }

  get points() {
    return {
      p1: this.l1.from,
      p2: this.l1.to,
      p3: this.l3.to,
      p4: this.l3.from
    }
  }
  draw(fillColor = null) {
    if (fillColor) {
      ctx.beginPath();
      ctx.moveTo(this.points.p1.x,this.points.p1.y)
      ctx.lineTo(this.points.p2.x,this.points.p2.y)
      ctx.lineTo(this.points.p3.x,this.points.p3.y)
      ctx.lineTo(this.points.p4.x,this.points.p4.y)
      ctx.closePath()
      ctx.fillStyle = fillColor;
      ctx.fill();
    }else {
      this.l1.draw()
      this.l2.draw()
      this.l3.draw()
      this.l4.draw()
    }
  }
}

function crossLine(l1,r1,l2,r2) {
  const pointOnL1 = l1.interpolate(r1)
  const pointOnL2 = l2.interpolate(r2)
  return new Line(pointOnL1,pointOnL2)
}

function generateRectGrid(rect,xFreq,yFreq) {
  const quadedRect = new Quad(
    rect.lines.left,
    rect.lines.right,
  );
  return generateQuadGrid(quadedRect,xFreq,yFreq)
}

function generateQuadGrid(quad,l1l3Freq,l2l4Freq) {
  let result = []
  for (let i = 1; i < l1l3Freq; i++) {
    result.push(crossLine(quad.l1, (i/l1l3Freq), quad.l3, (i/l2l4Freq)));
  }
  for (let i = 1; i < l2l4Freq; i++) {
    result.push(crossLine(quad.l2,(i/l2l4Freq),quad.l4,(i/l2l4Freq)));
  }
  return result
}

let xOffset = 0
let yOffset = 0

document.addEventListener('mousemove', evt => {
  xOffset = cw - getMousePos(c,evt).x
  yOffset = ch - getMousePos(c,evt).y
})

setInterval(() => {
  c.width = c.width

  const r = 0.5
  const outerBox = new Rect(0, 0, cw, ch)
  const innerBox = new Rect(cw*(1-r)-xOffset, ch*(1-r)-yOffset, cw*r, ch*r)

  outerBox.draw()
  innerBox.draw()

  const freq = 10
  const dirs = ['top', 'right', 'bottom', 'left']
  const walls = dirs.map(dir => {
    const higherLine = outerBox.lines[dir]
    const lowerLine = innerBox.lines[dir]
    return new Quad(higherLine,lowerLine)
  })
  walls.forEach(wall => {
    wall.draw()
    generateQuadGrid(wall,freq,freq).forEach(i => i.draw())
  })

  generateRectGrid(innerBox,10, 10).forEach(l => l.draw())
},10)


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

