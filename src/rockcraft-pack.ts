// -*- mode: javascript; js-indent-level: 2 -*-

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
import * as tools from './tools'

interface RockcraftBuilderOptions {
  projectRoot: string
  rockcraftChannel: string
  rockcraftPackArgs: string
}

export class RockcraftBuilder {
  projectRoot: string
  rockcraftChannel: string
  rockcraftPackArgs: string

  constructor(options: RockcraftBuilderOptions) {
    this.projectRoot = tools.expandHome(options.projectRoot)
    this.rockcraftChannel = options.rockcraftChannel
    this.rockcraftPackArgs = options.rockcraftPackArgs
  }

  async pack(): Promise<void> {
    core.startGroup('Installing Rockcraft plus dependencies')
    await tools.ensureSnapd()
    await tools.ensureLXD()
    await tools.ensureRockcraft(this.rockcraftChannel)
    core.endGroup()

    let rockcraft = 'rockcraft pack'
    if (this.rockcraftPackArgs) {
      rockcraft = `${rockcraft} ${this.rockcraftPackArgs}`
    }

    await exec.exec('sg', ['lxd', '-c', rockcraft], {
      cwd: this.projectRoot
    })
  }

  // This wrapper is for the benefit of the tests, due to the crazy
  // typing of fs.promises.readdir()
  async _readdir(dir: string): Promise<string[]> {
    return await fs.promises.readdir(dir)
  }

  async outputRock(): Promise<string> {
    const files = await this._readdir(this.projectRoot)
    const rocks = files.filter(name => name.endsWith('.rock'))

    if (rocks.length === 0) {
      throw new Error('No .rock files produced by build')
    }
    if (rocks.length > 1) {
      core.warning(`Multiple ROCKs found in ${this.projectRoot}`)
    }
    return path.join(this.projectRoot, rocks[0])
  }
}
