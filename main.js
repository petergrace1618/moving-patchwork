'use strict';

//////////////////////////
//// moving-patchwork ////
//////////////////////////

class Grid {
  #gridSize;
  #maxCellSize;
  #pattern;
  columns;
  rows;

  // gridSize: number of rows/columns
  constructor(gridSize, maxCellSize, initialSize) {
    this.#pattern = [
      Array(gridSize).fill(initialSize),  // column widths
      Array(gridSize).fill(initialSize)   // row heights
    ];
    this.columns = this.#pattern[0];
    this.rows = this.#pattern[1];
    this.#gridSize = gridSize;
    this.#maxCellSize = maxCellSize;
  }

  get width() {
    return sum(this.columns);
  }

  get height() {
    return sum(this.rows);
  }

  get size() {
    return this.#gridSize;
  }

  get maxCellSize() {
    return this.#maxCellSize;
  }

  // rowColumn: 0 - column widths, 1 - row heights
  // index: a particular cell
  getRowColumnSize(rowColumn, index) {
    return this.#pattern[rowColumn][index];
  }

  setRowColumnSize(rowColumn, index, size) {
    this.#pattern[rowColumn][index] = constrain(size, 1, this.#gridSize);
  }
}

Grid.prototype.display = function() {
  const width = this.width * PIXELS_PER_UNIT,
        height = this.height * PIXELS_PER_UNIT,
        top = (canvas.height - height) / 2,
        left = (canvas.width - width) / 2,
        right = left + width,
        bottom = top + height,
        x = this.columns, y = this.rows;

  // horizontal lines
  // ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let d = top;
  for (let i=0; i<y.length; i++) {
      ctx.moveTo(left, d);
      ctx.lineTo(right, d);
      d += y[i] * PIXELS_PER_UNIT;
  }
  ctx.moveTo(left, d);
  ctx.lineTo(right, d);
  ctx.stroke();

  // vertical lines
  ctx.beginPath();
  d = left;
  for (let i=0; i<x.length; i++) {
      ctx.moveTo(d, top);
      ctx.lineTo(d, bottom);
      d += x[i] * PIXELS_PER_UNIT;
  }
  ctx.moveTo(d, top);
  ctx.lineTo(d, bottom);
  ctx.stroke();
}

//// GLOBALS ////

const ctx = canvas.getContext('2d', {alpha: false}),
      PIXELS_PER_UNIT = 14,
      TIME_UNIT = 1400,
      TRANSITION_DURATION = 700;

let idleDuration;
let animationStart;
let stopRequested = false;

//// START/STOP ANIMATION ////

const grid = new Grid(6, 6, 2);
ctx.strokeStyle = '#222';
grid.display();

startButton.addEventListener('click', () => {
  let anim = startButton.getAnimations()[0];
  if (anim) anim.cancel();

  if (!animationStart) {
    console.log('starting');
    requestAnimationFrame(idle);
  }
});

stopButton.addEventListener('click', () => {
  console.log('stopping');
  stopRequested = true;
});

//// MAIN ANIMATION LOOP ////

function idle(timestamp) {
  if (!animationStart) {
    animationStart = timestamp;
    idleDuration = randomDuration();
    // console.log()
  }

  if (stopRequested) {
    animationStart = undefined;
    stopRequested = false;
    ctx.strokeStyle = '#222'
    grid.display();
    // drawDiagonals()
    return;
  }

  // milliseconds
  const ms = (timestamp % TIME_UNIT) / TIME_UNIT;
  const elapsed = timestamp - animationStart;
  let t = elapsed / idleDuration;
  if (t < 1.0) {
    clearCanvas();
    updateIdle(ms);
    grid.display();
    // drawDiagonals()
    requestAnimationFrame(idle);
  
  } else {
    animationStart = undefined;
    requestAnimationFrame(transition);
  }
}

function updateIdle(t) {
  t = easeSinSqr(t, 25, 45);
  ctx.strokeStyle = `hsl(0 ${t} ${t})`;
}

////////////////////////

let prevCellSize, newCellSize, rowColumn, index;

function transition(timestamp) {
  if (!animationStart) {
    animationStart = timestamp;

    // 1. choose random row/column and index
    rowColumn = +rndBool(); // 0: column, 1: row
    index = rndInt(grid.size);

    // 2. save previous cell size
    prevCellSize = grid.getRowColumnSize(rowColumn, index);
    
    // 3. choose random delta and check for collision
    do {
      const d = rndInt(1,3) * (rndBool() ? 1 : -1);
      newCellSize = constrain(prevCellSize + d, 1, grid.maxCellSize);
    } while (newCellSize == prevCellSize);
    // console.log('prev', prevCellSize, 'new', newCellSize,
    //             'rowColumn', rowColumn, 'index', index);
  }

  const ms = (timestamp % TIME_UNIT) / TIME_UNIT;
  const elapsed = timestamp - animationStart;
  let t = Math.min(elapsed / TRANSITION_DURATION, 1.0);
  if (t < 1.0) {
    clearCanvas();
    updateTransition(t, ms);
    grid.display();
    requestAnimationFrame(transition);
  
  } else {
    // end on integer boundary where t=1.0
    updateTransition(t);
    animationStart = undefined;
    if (stopRequested) {
      stopRequested = false;
      ctx.strokeStyle = '#222'
      grid.display();
    } else {
      requestAnimationFrame(idle);
    }
  }
}

function updateTransition(t, ms) {
  const v = easeSinSqr(ms, 33, 66);
  ctx.strokeStyle = `hsl(240 ${v} ${v})`;
  const cellSize = lerp(prevCellSize, newCellSize, easeInQuad(t));
  grid.setRowColumnSize(rowColumn, index, cellSize);
}    

// diagonals from corners of canvas to corners of grid
function drawDiagonals() {
  ctx.strokeStyle = 'hsl(271, 50%, 30%)';
  ctx.beginPath();
  ctx.setLineDash([2,2]);
  ctx.moveTo(0, 0);
  ctx.lineTo(left, top);
  ctx.moveTo(canvas.width, 0);
  ctx.lineTo(right, top);
  ctx.moveTo(canvas.width, canvas.height);
  ctx.lineTo(right, bottom);
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(left, bottom);
  ctx.stroke();
  ctx.setLineDash([]);  // solid line
}

/////////////////////////////

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function randomDuration() {
  let n;
  for (n = 1; rndBool() == false; n++);
  return n * TIME_UNIT;
}

// maps t (0..1) -> hsl() string
// lo, hi: range of saturation and luminosity
function mapToHSL(t, hue, lo, hi) {
  t = lo + (hi - lo) * Math.sin(t * PI) ** 2;
  return `hsl(${hue} ${t} ${t})`
}
