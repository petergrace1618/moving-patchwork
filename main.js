// moving-patchwork

class Patchwork {
  #warp = [1,1,1,1,1,1,1]; // column widths
  #weft = [1,1,1,1,1,1,1]; // row heights
  width;
  height;

  constructor() {
    this.#calcSize();
  }

  #calcSize() {
    this.width = sum(this.#warp);
    this.height = sum(this.#weft);
  }

  alter() {
    const a = rndBernoulli() ? this.#warp : this.#weft;
    const i = rndInt(a.length);
    const d = rndInt(1,3) * (rndBernoulli() ? 1 : -1);
    a[i] = constrain(a[i] + d, 1, 7);
    this.#calcSize();
  }

  pattern() {
    return {
      warp: [...this.#warp], 
      weft: [...this.#weft]
    };
  }
}

const grid = new Patchwork();

grid.display = (function() {
  const ctx = canvas.getContext('2d', {alpha: false});
  const pixelsPerUnit = 13;
  
  return function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = this.width * pixelsPerUnit,
          height = this.height * pixelsPerUnit,
          top = (canvas.height - height) / 2,
          left = (canvas.width - width) / 2,
          right = left + width,
          bottom = top + height,
          p = this.pattern();
    const x = p.warp, y = p.weft;

    // horizontal lines
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.setLineDash([]);  // solid line
    let d = top;
    for (let i=0; i<y.length; i++) {
        ctx.moveTo(left, d);
        ctx.lineTo(right, d);
        d += y[i] * pixelsPerUnit;
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
        d += x[i] * pixelsPerUnit;
    }
    ctx.moveTo(d, top);
    ctx.lineTo(d, bottom);
    ctx.stroke();

    // diagonal from corners
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
})();


//// MAIN LOOP ////

grid.display();
let intervalID = 0;
const INTERVAL = 250;
let intervals = 1;

startButton.addEventListener('click', () => {
  intervalID = setInterval(() => {
    if (rndBernoulli()) {
      // get alteration of pattern
      // animate change (in less than INTERVAL length)
      grid.alter();
      grid.display();

    } else {
      // animate no change
      intervals++;
    }
  }, INTERVAL);
  console.log('started');
});

stopButton.addEventListener('click', () => {
  clearInterval(intervalID);
  console.log('stopped');
});

/////////////////


function printPattern() {
  if (!this.iterations) 
    this.iterations = 0;  
  let p = this.pattern();
  console.log(`${this.iterations}: ${p.warp.toString()} / ${p.weft.toString()}`);  
  this.iterations++;
}


// (function(){
//   let N = 0, runningAverage = 0, rolls = 1, maxRolls = [1];
//   while (N < 1000000) {
//     if (rndBernoulli()) {
//       N++;
//       runningAverage = (runningAverage * (N-1) + rolls) / N;
//       if (rolls > maxRolls[maxRolls.length-1]) {
//         maxRolls.push(rolls);
//       }
//       rolls = 1;
//     } else {
//       rolls++;
//     }
//   }
//   console.log(N, maxRolls.toString(), runningAverage);
// })()

// (function(){
//   let trials = 0, rolls = 1, rollCounts = [];
//   while (trials < 100) {
//     if (rndBernoulli()) {
//       if (rollCounts[rolls] === undefined) {
//         rollCounts[rolls] = 1;
//       } else {
//         rollCounts[rolls]++;
//       }
//       rolls = 1;
//       trials++;
//     } else {
//       rolls++;
//     }
//   }
//   console.log(trials, rollCounts);
// })()

