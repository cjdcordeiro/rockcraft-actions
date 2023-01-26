// -*- mode: javascript; js-indent-level: 2 -*-

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
import * as tools from './tools'

interface RockcraftProjectInitializerOptions {
  projectRoot: string
  rockcraftChannel: string
}

export class RockcraftProjectInitializer {
  projectRoot: string
  rockcraftChannel: string

  constructor(options: RockcraftProjectInitializerOptions) {
    this.projectRoot = tools.expandHome(options.projectRoot)
    this.rockcraftChannel = options.rockcraftChannel
  }

  async init(): Promise<void> {
    core.startGroup('Installing Rockcraft plus dependencies')
    await tools.ensureSnapd()
    await tools.ensureLXD()
    await tools.ensureRockcraft(this.rockcraftChannel)
    core.endGroup()

    const rockcraft = 'rockcraft init'

    await exec.exec('sg', ['lxd', '-c', rockcraft], {
      cwd: this.projectRoot
    })
  }

  // This wrapper is for the benefit of the tests, due to the crazy
  // typing of fs.promises.readdir()
  async _readdir(dir: string): Promise<string[]> {
    return await fs.promises.readdir(dir)
  }

  async outputYamlFile(): Promise<string> {
    const files = await this._readdir(this.projectRoot)
    const rockcraftYaml = files.filter(name => name === 'rockcraft.yaml')

    if (rockcraftYaml.length === 0) {
      throw new Error('No rockcraft.yaml file was produced')
    }
    return path.join(this.projectRoot, rockcraftYaml[0])
  }
}
