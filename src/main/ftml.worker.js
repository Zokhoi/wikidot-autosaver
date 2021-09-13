const ftml = require('@wikijump/ftml-wasm');

const { parentPort, workerData } = require('worker_threads');

const fs = require('fs');

ftml.init(fs.readFileSync('./node_modules/@wikijump/ftml-wasm/vendor/ftml_bg.wasm'));

async function renderHTML() {
  if (!ftml.ready) await ftml.loading;

  const { ftmlSource } = workerData;

  const { html, styles } = ftml.renderHTML(ftmlSource);

  // sending message back to main thread
  parentPort.postMessage({ html, styles });
}

renderHTML();
