#!/usr/bin/env node

const { program } = require('commander')

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const sizeOf = require('image-size')

const IMAGE_FILE_EXP = /\.jpg|jpeg|tif|tiff|png$/i
const BORDER = 10
const SHORT_EDGE = 2160
const LONG_EDGE = 2700
const MODE_ARG_MAP = {
  fill: 'cover',
  fit: 'contain',
}

program.version('1.0.0')

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
  .option('--no-sharpen', "Don't sharpen after resizing")
  .option(
    '--no-talllandscape',
    'Use 1:1 format for landscape-oriented photos instead if 4:5',
  )

program.parse()
const options = program.opts()

options.input = path.join(process.cwd(), options.input)

if (options.output) {
  options.output = path.join(process.cwd(), options.output)
} else {
  options.output = path.join(options.input, 'fourbyfive')
}

if (!fs.existsSync(options.output)) {
  fs.mkdirSync(options.output)
}

fs.readdir(options.input, function (err, files) {
  if (err) {
    console.error('Could not list the directory.', err)
    process.exit(1)
  }

  files.forEach(function (file, index) {
    const filePath = path.join(options.input, file)

    fs.stat(filePath, function (error, stat) {
      if (error) {
        console.error('Error stating file.', error)
        return
      }

      if (stat.isFile() && IMAGE_FILE_EXP.test(file)) {
        const outputFile = path.join(
          options.output,
          file.replace(IMAGE_FILE_EXP, '_fourbyfive.jpg'),
        )

        const size = {
          width: SHORT_EDGE,
          height: LONG_EDGE,
        }

        const dimensions = sizeOf(filePath)
        if (
          !options.talllandscape &&
          dimensions.width >= dimensions.height
        ) {
          size.width = SHORT_EDGE
          size.height = SHORT_EDGE
        }

        const padding = parseInt(options.padding) * 2
        size.width -= padding * 2
        size.height -= padding * 2

        const bgColor = {
          r: parseInt(options.color[0]),
          g: parseInt(options.color[1]),
          b: parseInt(options.color[2]),
          alpha: parseFloat(options.color[3]),
        }

        sharp(filePath)
          .resize(size.width, size.height, {
            kernel: sharp.kernel.cubic,
            fit: MODE_ARG_MAP[options.mode],
            fastShrinkOnLoad: false,
            background: bgColor,
          })
          .sharpen(options.sharpen)
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: bgColor,
          })
          .toFile(outputFile)
          .then(() => {
            console.log('Saved ' + outputFile)
          })
      }
    })
  })
})
