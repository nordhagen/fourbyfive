const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const IMAGE_FILE_EXP = /\.jpg|jpeg|tif|tiff|png$/i
const BORDER = 10
const WIDTH = 2160
const MODE_ARG_MAP = {
  fill: 'cover',
  fit: 'contain',
}

exports.processDir = async (options) => {
  options.input = path.join(process.cwd(), options.input)

  if (options.output) {
    options.output = path.join(process.cwd(), options.output)
  } else {
    options.output = path.join(options.input, 'fourbyfive')
  }

  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output)
  }

  const aspectParts = options.aspect.split(':')

  const size = {
    width: WIDTH,
    height: (WIDTH / aspectParts[0]) * aspectParts[1],
  }

  fs.readdir(options.input, function (err, files) {
    if (err) throw err

    files.forEach(function (file, index) {
      const filePath = path.join(options.input, file)

      fs.stat(filePath, function (err, stat) {
        if (err) throw err

        if (stat.isFile() && IMAGE_FILE_EXP.test(file)) {
          const outputFile = path.join(
            options.output,
            file.replace(
              IMAGE_FILE_EXP,
              `_${options.aspect.replace(':', 'x')}_fourbyfive.jpg`,
            ),
          )

          const padding = parseInt(options.padding) * 2

          const bgColor = {
            r: parseInt(options.color[0]),
            g: parseInt(options.color[1]),
            b: parseInt(options.color[2]),
            alpha: parseFloat(options.color[3]),
          }

          sharp(filePath)
            .resize(
              size.width - padding * 2,
              size.height - padding * 2,
              {
                kernel: sharp.kernel.cubic,
                fit: MODE_ARG_MAP[options.mode],
                fastShrinkOnLoad: false,
                background: bgColor,
              },
            )
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
}
