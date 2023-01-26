// -*- mode: javascript; js-indent-level: 2 -*-

import * as os from 'os'
import * as path from 'path'
import * as exec from '@actions/exec'
import * as initializer from '../src/init'
import * as tools from '../src/tools'

afterEach(() => {
  jest.restoreAllMocks()
})

test('RockcraftProjectInitializer expands tilde in project root', () => {
  let builder = new initializer.RockcraftProjectInitializer({
    projectRoot: '~',
    rockcraftChannel: 'edge'
  })
  expect(builder.projectRoot).toBe(os.homedir())

  builder = new initializer.RockcraftProjectInitializer({
    projectRoot: '~/foo/bar',
    rockcraftChannel: 'stable'
  })
  expect(builder.projectRoot).toBe(path.join(os.homedir(), 'foo/bar'))
})

test('RockcraftProjectInitializer.init creates a rockcraft.yaml', async () => {
  expect.assertions(4)

  const ensureSnapd = jest
    .spyOn(tools, 'ensureSnapd')
    .mockImplementation(async (): Promise<void> => {})
  const ensureLXD = jest
    .spyOn(tools, 'ensureLXD')
    .mockImplementation(async (): Promise<void> => {})
  const ensureRockcraft = jest
    .spyOn(tools, 'ensureRockcraft')
    .mockImplementation(async (channel): Promise<void> => {})
  const execMock = jest
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  const projectDir = 'project-root'
  const builder = new initializer.RockcraftProjectInitializer({
    projectRoot: projectDir,
    rockcraftChannel: 'stable'
  })
  await builder.init()

  expect(ensureSnapd).toHaveBeenCalled()
  expect(ensureLXD).toHaveBeenCalled()
  expect(ensureRockcraft).toHaveBeenCalled()
  expect(execMock).toHaveBeenCalledWith('sg', ['lxd', '-c', 'rockcraft init'], {
    cwd: projectDir
  })
})

test('RockcraftProjectInitializer.init can set the Rockcraft channel', async () => {
  expect.assertions(1)

  const ensureSnapd = jest
    .spyOn(tools, 'ensureSnapd')
    .mockImplementation(async (): Promise<void> => {})
  const ensureLXD = jest
    .spyOn(tools, 'ensureLXD')
    .mockImplementation(async (): Promise<void> => {})
  const ensureRockcraft = jest
    .spyOn(tools, 'ensureRockcraft')
    .mockImplementation(async (channel): Promise<void> => {})
  const execMock = jest
    .spyOn(exec, 'exec')
    .mockImplementation(
      async (program: string, args?: string[]): Promise<number> => {
        return 0
      }
    )

  const builder = new initializer.RockcraftProjectInitializer({
    projectRoot: '.',
    rockcraftChannel: 'test-channel'
  })
  await builder.init()

  expect(ensureRockcraft).toHaveBeenCalledWith('test-channel')
})

test('RockcraftProjectInitializer.outputRock fails if there is no rockcraft.yaml', async () => {
  expect.assertions(2)

  const projectDir = 'project-root'
  const builder = new initializer.RockcraftProjectInitializer({
    projectRoot: projectDir,
    rockcraftChannel: 'stable'
  })

  const readdir = jest
    .spyOn(builder, '_readdir')
    .mockImplementation(
      async (path: string): Promise<string[]> => ['not-a-yaml']
    )

  await expect(builder.outputYamlFile()).rejects.toThrow(
    'No rockcraft.yaml file was produced'
  )
  expect(readdir).toHaveBeenCalled()
})

test('RockcraftProjectInitializer.outputRock returns a rockcraft.yaml file', async () => {
  expect.assertions(2)

  const projectDir = 'project-root'
  const builder = new initializer.RockcraftProjectInitializer({
    projectRoot: projectDir,
    rockcraftChannel: 'stable'
  })

  const readdir = jest
    .spyOn(builder, '_readdir')
    .mockImplementation(
      async (path: string): Promise<string[]> => [
        'one.rock',
        'two.rock',
        'rockcraft.yaml'
      ]
    )

  await expect(builder.outputYamlFile()).resolves.toEqual(
    'project-root/rockcraft.yaml'
  )
  expect(readdir).toHaveBeenCalled()
})
