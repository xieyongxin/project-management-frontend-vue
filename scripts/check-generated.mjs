import { spawnSync } from 'node:child_process'
import process from 'node:process'

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!process.env.npm_execpath) {
  throw new Error('无法定位 pnpm CLI。请通过 pnpm api:check 执行此脚本。')
}

run(process.execPath, [process.env.npm_execpath, 'api:generate'])
run('git', ['diff', '--exit-code', '--', 'src/shared/api/generated'])
