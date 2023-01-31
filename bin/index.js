#!/usr/bin/env node

const { program } = require('commander')

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const sizeOf = require('image-size')

const IMAGE_FILE_EXP = /\.jpg|jpeg|tif|tiff|png$/i
const BORDER = 10
const WIDTH = 2160
const MODE_ARG_MAP = {
  fill: 'cover',
  fit: 'contain',
}

program.version('1.1.1')

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
  .option('--no-sharpen', "Don't sharpen after resizing")

program.parse()
const options = program.opts()

options.input = path.join(process.cwd(), options.input)

if (options.output) {
  options.output = path.join(process.cwd(), options.output)
} else {
  options.output = path.join(options.input, 'fourbyfive')
}

const aspectParts = options.aspect.split(':')

const size = {
  width: WIDTH,
  height: (WIDTH / aspectParts[0]) * aspectParts[1],
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
          file.replace(
            IMAGE_FILE_EXP,
            `_${options.aspect.replace(':', 'x')}_fourbyfive.jpg`,
          ),
        )

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
