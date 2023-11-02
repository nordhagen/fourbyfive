const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const IMAGE_FILE_EXP = /\.jpg|jpeg|tif|tiff|png$/i
const BORDER = 10
const MODE_ARG_MAP = {
  fill: 'cover',
  fit: 'contain',
}

const exit = (errorMessage) => {
  console.error(errorMessage)
  process.exit(1)
}

const parseAspectRatio = (aspect) => {
  if (aspect.match(':')) {
    return aspect.split(':').map((n) => parseInt(n))
  } else if (aspect.match('x')) {
    return aspect.split('x').map((n) => parseInt(n))
  } else {
    exit(`Invalid aspect ratio: "${aspect}". Format: "4:5" or "4x5".`)
  }
}

exports.processDir = async (options) => {
  options.input = path.join(process.cwd(), options.input)

  if (options.output) {
    options.output = path.join(process.cwd(), options.output)
  } else {
    options.output = path.join(options.input, 'fourbyfive')
  }

  if (!fs.existsSync(options.input)) {
    exit(`Input directory not found: ${options.input}`)
  }

  if (!fs.existsSync(options.output)) {
    try {
      fs.mkdirSync(options.output)
    } catch (err) {
      exit(`Could not create output directory: ${options.output}`)
    }
  }

  options.aspect = parseAspectRatio(options.aspect)

  const size = {
    width: options.width,
    height: (options.width / options.aspect[0]) * options.aspect[1],
  }

  fs.readdir(options.input, function (err, files) {
    if (err) exit(err.message)

    files.forEach(function (file, index) {
      const filePath = path.join(options.input, file)

      fs.stat(filePath, function (err, stat) {
        if (err) exit(err.message)

        if (stat.isFile() && IMAGE_FILE_EXP.test(file)) {
          try {
            const outputFile = path.join(
              options.output,
              file.replace(
                IMAGE_FILE_EXP,
                `_${options.aspect.join('x')}_fourbyfive.jpg`,
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
          } catch (err) {
            exit(err.message)
          }
        }
      })
    })
  })
}
