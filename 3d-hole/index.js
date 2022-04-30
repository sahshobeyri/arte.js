import { getScale } from 'https://cdn.skypack.dev/color2k?min';
const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");
const cw = c.width
const ch = c.height

function cls() {
  c.width = cw
  // ctx.clearRect(0, 0, cw, ch);
}

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

class Drawable {
  constructor(drawOrder = 0) {
    this.drawOrder = drawOrder
  }

  static drawInOrder(drawablesArr) {
    const compFunc = (a,b) => a.drawOrder - b.drawOrder
    drawablesArr.sort(compFunc).forEach(d => d.draw())
  }
}

class Point extends Drawable{
  constructor(x,y,drawOrder = 0) {
    super(drawOrder)
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

class Line extends Drawable{
  constructor(from, to,drawOrder = 0) {
    super(drawOrder)
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

class Rect extends Drawable {
  constructor(x,y,w,h,drawOrder = 0) {
    super(drawOrder)
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

class Quad extends Drawable {
  constructor(l1,l3,fillColor = null,drawOrder = 0) {
    super(drawOrder)
    this.l1 = l1
    this.l2 = crossLine(l1,0,l3,0)
    this.l3 = l3
    this.l4 = crossLine(l1,1,l3,1)
    this.fillColor = fillColor
  }

  get points() {
    return {
      p1: this.l1.from,
      p2: this.l1.to,
      p3: this.l3.to,
      p4: this.l3.from
    }
  }
  draw() {
    if (this.fillColor) {
      ctx.beginPath();
      ctx.moveTo(this.points.p1.x,this.points.p1.y)
      ctx.lineTo(this.points.p2.x,this.points.p2.y)
      ctx.lineTo(this.points.p3.x,this.points.p3.y)
      ctx.lineTo(this.points.p4.x,this.points.p4.y)
      ctx.closePath()
      ctx.fillStyle = this.fillColor;
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

function generateRectGrid(rect,xFreq,yFreq,shading = false) {
  const quadedRect = new Quad(
    rect.lines.left,
    rect.lines.right,
  );
  return generateQuadGrid(quadedRect,xFreq,yFreq,shading)
}

function generateQuadGrid(quad,l1l3Freq,l2l4Freq,shading = false) {
  let lines = []
  let colorQuads = []

  const grayScale = getScale('white','#151515')

  let prevLine = null
  for (let i = 0; i <= l1l3Freq; i++) {
    const frac = i/l1l3Freq
    const newLine = crossLine(quad.l1, frac, quad.l3, frac)
    lines.push(newLine);
    if (prevLine) colorQuads.push(new Quad(prevLine,newLine))
    prevLine = newLine
  }

  prevLine = null
  for (let i = 0; i <= l2l4Freq; i++) {
    const frac = i/l1l3Freq
    const newLine = crossLine(quad.l2, frac, quad.l4, frac)
    lines.push(newLine);
    if (prevLine) {
      if (shading) {
        colorQuads.push(new Quad(prevLine,newLine,grayScale(frac)))
      }else {
        colorQuads.push(new Quad(prevLine,newLine,grayScale(1)))
      }
    }
    prevLine = newLine
  }

  colorQuads.forEach(q => q.drawOrder = -1)
  return [...colorQuads,...lines]
}

let xOffset = 0
let yOffset = 0

document.addEventListener('mousemove', evt => {
  xOffset = cw - getMousePos(c,evt).x
  yOffset = ch - getMousePos(c,evt).y
})

function mainDrawFunction() {
  cls()

  const r = 0.5
  const outerBox = new Rect(0, 0, cw, ch)
  const innerBox = new Rect(cw*(1-r)-xOffset, ch*(1-r)-yOffset, cw*r, ch*r)

  const freq = 20
  const dirs = ['top', 'right', 'bottom', 'left']
  const walls = dirs.map(dir => {
    const higherLine = outerBox.lines[dir]
    const lowerLine = innerBox.lines[dir]
    return new Quad(higherLine,lowerLine)
  })
  const wallsGrid = walls.map(wall => generateQuadGrid(wall,freq,freq,true)).flat(1)
  const floorGrid = generateRectGrid(innerBox,freq, freq)
  const allDrawables = [...wallsGrid,...floorGrid]
  Drawable.drawInOrder(allDrawables)

  requestAnimationFrame(mainDrawFunction)
}

requestAnimationFrame(mainDrawFunction)
