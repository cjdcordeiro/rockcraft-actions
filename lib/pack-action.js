// -*- mode: javascript; js-indent-level: 2 -*-
import * as core from '@actions/core';
import { RockcraftBuilder } from './pack';
async function run() {
    try {
        const projectRoot = core.getInput('path');
        core.info(`Building ROCK in "${projectRoot}"...`);
        const rockcraftChannel = core.getInput('rockcraft-channel') || 'edge';
        const rockcraftPackArgs = core.getInput('rockcraft-args');
        const builder = new RockcraftBuilder({
            projectRoot,
            rockcraftChannel,
            rockcraftPackArgs
        });
        await builder.pack();
        const rock = await builder.outputRock();
        core.setOutput('rock', rock);
    }
    catch (error) {
        core.setFailed(error?.message);
    }
}
void run();
