// -*- mode: javascript; js-indent-level: 2 -*-
import * as core from '@actions/core';
import { RockcraftProjectInitializer } from './init';
async function run() {
    try {
        const projectRoot = core.getInput('path');
        core.info(`Initializing Rockcraft project in "${projectRoot}"...`);
        const rockcraftChannel = core.getInput('rockcraft-channel') || 'edge';
        const initializer = new RockcraftProjectInitializer({
            projectRoot,
            rockcraftChannel
        });
        await initializer.init();
        const yamlFile = await initializer.outputYamlFile();
        core.setOutput('rockcraft.yaml', yamlFile);
    }
    catch (error) {
        core.setFailed(error?.message);
    }
}
void run();
