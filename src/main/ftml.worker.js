
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
let ftmlPath = '@wikijump/ftml-wasm';
let wasmPath = './node_modules/@wikijump/ftml-wasm/vendor/ftml_bg.wasm';
let MODE = process.env.MODE || (process.env).MODE;

// Patch for production
if (MODE != 'development') {
  ftmlPath = './resources/app.asar.unpacked/node_modules/' + ftmlPath;
  wasmPath = './resources/app.asar.unpacked/' + wasmPath;
}

const ftml = require(ftmlPath);

ftml.init(fs.readFileSync(wasmPath));

async function renderHTML() {
  if (!ftml.ready) await ftml.loading;

  const { ftmlSource } = workerData;

  const { html, styles } = ftml.renderHTML(ftmlSource);

  // sending message back to main thread
  parentPort.postMessage({ html, styles });
}

renderHTML();
