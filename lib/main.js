"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const process_1 = require("./process");
async function run() {
    try {
        await process_1.execute();
    }
    catch (error) {
        core_1.setFailed(error.message);
    }
}
run();
