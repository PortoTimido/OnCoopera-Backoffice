import { assert } from '@japa/assert'
import { configure, processCLIArgs, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))

configure({
  suites: [
    {
      name: 'unit',
      files: ['tests/unit/**/*.spec.ts'],
    },
    {
      name: 'application',
      files: ['tests/application/**/*.spec.ts'],
    },
  ],
  plugins: [assert()],
  timeout: 2000,
})

run()
