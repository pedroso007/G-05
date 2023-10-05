
         function funcao1()
{
alert("Eu sou um alerta!");
}
       
   


 


var myMusic= document.getElementById("music");
function play() {
myMusic.play();

}
function pause() {
myMusic.pause();

}


console.clear();

const largePaths = document.querySelectorAll("path");
const smallPaths = [];
const svg_width = Math.ceil(
  parseFloat(document.querySelector("svg").viewBox.baseVal.width)
);
const svg_height = Math.ceil(
  parseFloat(document.querySelector("svg").viewBox.baseVal.height)
);
const scale = 0.7;
const detail = 8;
const offset = [0, 0];
let bigCoords = [];
let smallCoords = [];
let ratio = 1;
let context;

function setupHTMLOnce() {
  largePaths.forEach((path) => {
    let bbox = path.getBBox();
    let _path = path.cloneNode();
    path.viewportElement.appendChild(_path);
    path.bbox = path.getBBox();
    _path.bbox = _path.getBBox();
    path.length = path.getTotalLength();
    _path.length = _path.getTotalLength();
    smallPaths.push(_path);
  });
}

function updateHTML() {
  largePaths.forEach((path, i) => {
    let _path = smallPaths[i];
    const cx = path.bbox.x + path.bbox.width / 2;
    const cy = path.bbox.y + path.bbox.height / 2;
    path.cx = cx;
    path.cy = cy;
    let _scale = scale;
    _path.setAttribute(
      "transform",
      `matrix(${_scale}, 0, 0, ${_scale}, ${cx - _scale * cx}, ${
        cy - _scale * cy
      })`
    );

    let localMatrix = path.viewportElement.createSVGMatrix();
    let localTransformList = path.transform.baseVal;
    if (localTransformList.length) {
      localMatrix = localTransformList.consolidate().matrix;
    }
    path.matrix = localMatrix;

    localMatrix = _path.viewportElement.createSVGMatrix();
    localTransformList = _path.transform.baseVal;
    if (localTransformList.length) {
      localMatrix = localTransformList.consolidate().matrix;
    }
    _path.matrix = localMatrix;
  });
  bigCoords = [];
  
  largePaths.forEach((path) => {
    const coords = [];
    for (let i = 0; i < path.length + detail; i += detail) {
      let p = path.getPointAtLength((path.length - i) % path.length);
      let transformedPoint = p.matrixTransform(path.matrix);
      coords.push([transformedPoint.x, transformedPoint.y]);
    }
    bigCoords.push(coords);
  });
  
  smallPaths.forEach((path, i) => {
    const coords = [];
    for (let j = 0; j < path.length + detail; j += detail) {
      let p = path.getPointAtLength((path.length - j) % path.length);
      let transformedPoint = p.matrixTransform(path.matrix);
      coords.push([transformedPoint.x, transformedPoint.y]);
    }
    smallCoords[i] = coords;
  });
}

function setup() {
  const size = min(windowWidth, windowHeight);
  const _width = size;
  const _height = _width * (svg_height / svg_width);
  ratio = _width / svg_width;
  const canvas = createCanvas(ceil(_width), ceil(_height));
  context = canvas.drawingContext;
  noFill();
  setupHTMLOnce();
  updateHTML();
  context.lineWidth = 2;
  context.strokeStyle = "white";
  context.lineJoin = 'round';
  context.lineCap = 'round';
  mouseX = width / 2;
  mouseY = height;
}
function windowResized() {
  const size = min(windowWidth, windowHeight);
  const _width = size;
  const _height = _width * (svg_height / svg_width);
  ratio = _width / svg_width;
  resizeCanvas(ceil(_width), ceil(_height));
}
function draw() {
  clear();
  bigCoords.forEach((path, i) => {
    context.lineWidth = 2;
    context.strokeStyle = 'rgba(255, 255, 255, 1)';
    // Draw big path
    context.beginPath();
    path.forEach((coord, j) => {
      context.lineTo(coord[0] * ratio, coord[1] * ratio);
    });
    context.stroke();
    context.closePath();

    // Draw small path
    context.beginPath();
    path.forEach((coord, j) => {
      const dist = Math.hypot((largePaths[i].cx * ratio) - mouseX, (largePaths[i].cy * ratio) - mouseY);
      const offsetX = ((largePaths[i].cx * ratio) - mouseX) * (dist * 0.0001);
      const offsetY = ((largePaths[i].cy * ratio) - mouseY) * (dist * 0.0001);
      context.lineTo(
        smallCoords[i][j][0] * ratio + offsetX,
        smallCoords[i][j][1] * ratio + offsetY 
      );
    });
    context.stroke();
    context.closePath();

    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    // Connect paths
    path.forEach((coord, j) => {
      context.beginPath();
      context.moveTo(coord[0] * ratio, coord[1] * ratio);
      const dist = Math.hypot((largePaths[i].cx * ratio) - mouseX, (largePaths[i].cy * ratio) - mouseY);
      const offsetX = ((largePaths[i].cx * ratio) - mouseX) * (dist * 0.0001);
      const offsetY = ((largePaths[i].cy * ratio) - mouseY) * (dist * 0.0001);
      context.lineTo(
        smallCoords[i][j][0] * ratio + offsetX,
        smallCoords[i][j][1] * ratio + offsetY
      );
      context.stroke();
      context.closePath();
    });
  });
}
