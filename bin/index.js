#!/usr/bin/env node

const { program } = require('commander')
const { processDir } = require('../lib')

program.version('1.3.0')

program
  .option('-i, --input <string>', 'Source/input directory', '.')
  .option(
    '-m, --mode <string>',
    'Scaling mode, "fit" or "fill"',
    'fit',
  )
  .option(
    '-p, --padding <integer>',
    'Padding width in pixels as integer',
    0,
  )
  .option('-c, --color <numbers...>', 'Color of background/border', [
    '255',
    '255',
    '255',
    '1',
  ])
  .option(
    '-o, --output <string>',
    'Output directory, defaults to "fourbyfive" dir in input',
  )
  .option(
    '-a, --aspect <string>',
    'Output aspect ratio, default: "4:5"',
    '4:5',
  )
  .option(
    '-w, --width <integer>',
    'Width of resulting image, default: 2160. Height calculated from aspec ratio',
    2160,
  )
  .option('-s, --sharpen <integer>', 'Sharpening value', 1)

program.parse()
processDir(program.opts())
