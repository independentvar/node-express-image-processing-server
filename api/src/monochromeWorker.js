const gm = require("gm");
const workerData = require("worker_threads").workerData;
const parentPort = require("worker_threads").parentPort;

gm(workerData.source).monochrome().write(workerData.destination, (err) => {
    if (err) {
        throw err;
    }

    parentPort.postMessage({ "monochrome": true });
});
