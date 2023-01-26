// -*- mode: javascript; js-indent-level: 2 -*-
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as path from 'path';
import * as tools from './tools';
export class RockcraftProjectInitializer {
    constructor(options) {
        this.projectRoot = tools.expandHome(options.projectRoot);
        this.rockcraftChannel = options.rockcraftChannel;
    }
    async init() {
        core.startGroup('Installing Rockcraft plus dependencies');
        await tools.ensureSnapd();
        await tools.ensureLXD();
        await tools.ensureRockcraft(this.rockcraftChannel);
        core.endGroup();
        const rockcraft = 'rockcraft init';
        await exec.exec('sg', ['lxd', '-c', rockcraft], {
            cwd: this.projectRoot
        });
    }
    // This wrapper is for the benefit of the tests, due to the crazy
    // typing of fs.promises.readdir()
    async _readdir(dir) {
        return await fs.promises.readdir(dir);
    }
    async outputYamlFile() {
        const files = await this._readdir(this.projectRoot);
        const rockcraftYaml = files.filter(name => name === 'rockcraft.yaml');
        if (rockcraftYaml.length === 0) {
            throw new Error('No rockcraft.yaml file was produced');
        }
        return path.join(this.projectRoot, rockcraftYaml[0]);
    }
}
