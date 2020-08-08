const path = require("path");
const Worker = require("worker_threads").Worker;
const isMainThread = require("worker_threads").isMainThread;

const pathToResizeWorker = path.resolve(__dirname, "resizeWorker.js");
const pathToMonochromeWorker = path.resolve(__dirname, "monochromeWorker.js");

function uploadPathResolver(filename) {
    return path.resolve(__dirname, "../uploads", filename);
}

function imageProcessor(filename){
    const sourcePath = uploadPathResolver(filename);
    const resizedDestination = uploadPathResolver(`resized-${filename}`);
    const monochromeDestination = uploadPathResolver(`monochrome-${filename}`);
    let resizeWorkerFinished = false;
    let monochromedWorkerFinished = false;

    return new Promise((resolve, reject) => {
        if(isMainThread) {
            try {
                const resizeWorker = new Worker(pathToResizeWorker, { workerData: { source: sourcePath, destination: resizedDestination }});
                const monochromeWorker = new Worker(pathToMonochromeWorker, { workerData: { source: sourcePath, destination: monochromeDestination }});
                
                resizeWorker.on("message", (message) => {
                    resizeWorkerFinished = true;

                    if(monochromedWorkerFinished){
                        resolve("resizeWorker finished processing")
                    }                    
                });

                monochromeWorker.on("message", (message) => {
                    monochromedWorkerFinished = true;

                    if(resizeWorkerFinished){
                        resolve("monochromeWorker finished processing")
                    }                    
                });

                resizeWorker.on("error", (err) => {
                    reject(new Error(err.message));
                });

                monochromeWorker.on("error", (err) => {
                    reject(new Error(err.message));
                });

                resizeWorker.on("exit", (code) => {
                    if(code !== 0) {
                        reject(new Error("Exited with status code: " + code));
                    }
                });

                monochromeWorker.on("exit", (code) => {
                    if(code !== 0) {
                        reject(new Error("Exited with status code: " + code));
                    }
                });

            } catch (error) {
                reject(error);
            }
        } 
        else {
            reject(new Error("not on main thread"))
        }        
    });
}

module.exports = imageProcessor;