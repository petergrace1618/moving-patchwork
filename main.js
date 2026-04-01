//////////////////////////
//// moving-patchwork ////
//////////////////////////

class Grid {
  pattern;
  columns;
  rows;
  #width;
  #height;

  // gridSize: number of rows/columns
  constructor(gridSize, maxCellUnits, initialSize) {
    this.pattern = [
      Array(gridSize).fill(initialSize),
      Array(gridSize).fill(initialSize)
    ];
    this.columns = this.pattern[0];
    this.rows = this.pattern[1];
    this.maxCellUnits = maxCellUnits;
  }

  get width() {
    return sum(this.columns);
  }

  get height() {
    return sum(this.rows);
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
  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.setLineDash([]);  // solid line
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
      PIXELS_PER_UNIT = 13,
      TIME_UNIT = 1200,
      TRANSITION_DURATION = 300;

let idleDuration;
let animationStart;
let stopRequested = false;

//// START/STOP ANIMATION ////

const grid = new Grid(7, 7, 1);
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
  }

  if (stopRequested) {
    animationStart = undefined;
    stopRequested = false;
    ctx.strokeStyle = '#222'
    grid.display();
    // drawDiagonals()
    return;
  }

  const elapsed = timestamp - animationStart;
  let t = elapsed / idleDuration;
  if (t < 1.0) {
    clearCanvas();
    updateIdle();
    grid.display();
    // drawDiagonals()
    requestAnimationFrame(idle);
  
  } else {
    animationStart = undefined;
    requestAnimationFrame(transition);
  }
}

function updateIdle(t) {
  ctx.strokeStyle = mapToHSL(idleDuration/TIME_UNIT*t, 0, 33, 66);
}

let prevBoxSize;
let newBoxSize;

function transition(timestamp) {
  if (!animationStart) {
    animationStart = timestamp;
    // save previous state
    prevBoxSize = grid.size;
    // get new state
    do {
      const d = rndInt(1,3) * (rndBool() ? 1 : -1);
      newBoxSize = constrain(prevBoxSize + d, 1, grid.maxSize);
    } while (newBoxSize == prevBoxSize);
    console.log('prev', prevBoxSize, 'new', newBoxSize);
  }

  const elapsed = timestamp - animationStart;
  let t = Math.min(elapsed / TRANSITION_DURATION, 1.0);
  if (t < 1.0) {
    clearCanvas();
    updateTransition(t);
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

function updateTransition(t) {
    ctx.strokeStyle = mapToHSL(t, 120, 25, 50);
    grid.size = lerp(prevBoxSize, newBoxSize, easeInQuad(t));
}

function alter() {
    const a = rndBool() ? this.columns : this.rows;
    const i = rndInt(a.length);
    const d = rndInt(1,3) * (rndBool() ? 1 : -1);
    a[i] = constrain(a[i] + d, 1, 7);
    // this.#calcSize();
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
