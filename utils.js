const PI = Math.PI;
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;

function $(selector) {
  return document.querySelector(selector);
}


function $$(selector) {
  return document.querySelectorAll(selector);
}


function swap(a, b) {
  return [b, a];
}


function rnd(a, b) {
  // 0 arguments: [0.0, 1.0)
  if (arguments.length === 0) {
    return Math.random();
  
  // 1 argument: [0.0, a)
  } else if (arguments.length === 1) {
    return Math.random() * a;
  
  // 2 arguments: [a, b)
  } else if (arguments.length === 2) {
    return a + Math.random() * (b - a);
  
  } else {
    throw SyntaxError('rnd() requires 0, 1, or 2 arguments');
  }
}

function rndInt(a, b) {
  if (arguments.length === 0) {
    throw SyntaxError('rndInt() requires 1 or 2 arguments');
  
  // 1 argument: [0, a)
  } else if (arguments.length === 1) {
    return Math.floor(Math.random() * a);
  
  // 2 arguments: [a, b]
  } else {
    return a + Math.floor(Math.random() * (b - a + 1));
  }
}

function rndBernoulli() {
  return rnd() >= 0.5 ? true : false;
}

function sum(arr) {
  return arr.reduce((sum, val) => sum + val); 
}

function constrain(n, lowerBound, upperBound) {
  if (n < lowerBound) return lowerBound;
  if (n > upperBound) return upperBound;
  return n;
}

// linear interpolation
function lerp(a, b, x) {
  return a + (b - a) * x;
}

function mapToRangeClamped(x, inStart, inEnd, outStart, outEnd) {
  x = (x < inStart) ? inStart : x; 
  x = (x > inEnd) ? inEnd : x; 
  const normal = (x - inStart) / (inEnd - inStart);
  return outStart + (outEnd - outStart) * normal;
}

function linear(t) {
  return t;
}

function easeInQuad(x) {
  return x * x;
}

function easeInExpo(x) {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

// Given an object with properties x and y,
// calculate the angle from the positive 
// x-axis to the point (x,y)
function calculateTheta(p) {
  let theta = Math.atan2(p.y, p.x);
  return theta < 0 ? theta + TWO_PI : theta;
}


function midPoint(p, q) {
  return {
    x: (p.x + q.x) / 2,
    y: (p.y + q.y) / 2
  }
}


function iter(n, f, n0 = 0, inclusive = false) {
  n += inclusive ? 1 : 0;
  for (let i = n0; i < n; i++) {
    f(i);
  }
}
