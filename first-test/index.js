const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");
const cw = c.width
const ch = c.height

function cls() {
  ctx.clearRect(0, 0, cw, ch);
}

const r = 1/2
const outerBox = {
  x:0,
  y:0,
  w:cw,
  h:ch
}
const innerBox = {
  x:cw*(1-r),
  y:ch*(1-r),
  w:cw*r,
  h:ch*r
}
ctx.strokeRect(outerBox.x, outerBox.y, outerBox.w, outerBox.h)
ctx.strokeRect(innerBox.x, innerBox.y, innerBox.w, innerBox.h)

// ctx.moveTo(outerBox.x, outerBox.y);
// ctx.lineTo(innerBox.x, innerBox.y);

const freq = 10
for (let i = 0; i < freq; i++) {
  ctx.moveTo(outerBox.x + outerBox.w* (i/freq), outerBox.y);
  ctx.lineTo(innerBox.x + innerBox.w* (i/freq), innerBox.y);
}
for (let i = 0; i < freq; i++) {
  ctx.moveTo(outerBox.x,outerBox.y + outerBox.h* (i/freq));
  ctx.lineTo(innerBox.x,innerBox.y + innerBox.h* (i/freq));
}

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

