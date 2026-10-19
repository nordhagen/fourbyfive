const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const { bugs } = require('../package.json')

const SHARPENING_MAP = [
  {
    /* Should never happen */
  },
  {
    sigma: 1,
    m1: 0,
    m2: 1,
    x1: 3,
    y2: 10,
    y3: 10,
  },
  {
    sigma: 1,
    m1: 0.5,
    m2: 2,
    x1: 4,
    y2: 10,
    y3: 10,
  },
  {
    sigma: 2,
    m1: 0.5,
    m2: 3,
    x1: 4,
    y2: 15,
    y3: 15,
  },
]

const IMAGE_FILE_EXP = /\.(jpe?g|tif|tiff|png)$/i
const BORDER = 10
const MODE_ARG_MAP = {
  fill: 'cover',
  fit: 'contain',
}

const parseAspectRatio = (aspect) => {
  if (typeof aspect !== 'string') {
    throw new Error(
      `Invalid aspect ratio: "${aspect}". Format: "4:5" or "4x5".`,
    )
  }

  if (aspect.includes(':')) {
    return aspect.split(':').map((n) => parseInt(n, 10))
  }

  if (aspect.includes('x')) {
    return aspect.split('x').map((n) => parseInt(n, 10))
  }

  throw new Error(
    `Invalid aspect ratio: "${aspect}". Format: "4:5" or "4x5".`,
  )
}

const processDir = async (options = {}) => {
  const config = {
    input: '.',
    output: undefined,
    mode: 'fit',
    padding: 0,
    color: ['255', '255', '255', '1'],
    aspect: '4:5',
    width: 2160,
    sharpen: 1,
    ...options,
  }

  config.input = path.resolve(process.cwd(), config.input)
  config.output = config.output
    ? path.resolve(process.cwd(), config.output)
    : path.join(config.input, 'fourbyfive')

  if (!fs.existsSync(config.input)) {
    throw new Error(`Input directory not found: ${config.input}`)
  }

  if (!fs.existsSync(config.output)) {
    try {
      fs.mkdirSync(config.output, { recursive: true })
    } catch (err) {
      throw new Error(
        `Could not create output directory: ${config.output}`,
      )
    }
  }

  const aspect = parseAspectRatio(config.aspect)
  const size = {
    width: Number(config.width),
    height: (Number(config.width) / aspect[0]) * aspect[1],
  }

  const files = await fs.promises.readdir(config.input)
  const processed = []

  for (const file of files) {
    const filePath = path.join(config.input, file)
    const stat = await fs.promises.stat(filePath)

    if (!stat.isFile() || !IMAGE_FILE_EXP.test(file)) {
      continue
    }

    try {
      const outputFile = path.join(
        config.output,
        file.replace(IMAGE_FILE_EXP, `_${aspect.join('x')}_fbf.jpg`),
      )

      const padding = parseInt(config.padding, 10) * 2
      const bgColor = {
        r: parseInt(config.color[0], 10),
        g: parseInt(config.color[1], 10),
        b: parseInt(config.color[2], 10),
        alpha: parseFloat(config.color[3]),
      }

      await sharp(filePath)
        .resize(size.width - padding * 2, size.height - padding * 2, {
          kernel: sharp.kernel.cubic,
          fit: MODE_ARG_MAP[config.mode],
          fastShrinkOnLoad: false,
          background: bgColor,
        })
        .sharpen(
          !!config.sharpen ? SHARPENING_MAP[config.sharpen] : false,
        )
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: bgColor,
        })
        .toFile(outputFile)

      console.log('Saved ' + outputFile)
      processed.push(outputFile)
    } catch (err) {
      throw new Error(
        `\nProcessing failed internally. Please report this issue at ${bugs.url}. Include the stack trace below and the options you used.\n\n${err.stack}`,
      )
    }
  }

  return {
    input: config.input,
    output: config.output,
    files: processed,
  }
}

module.exports = { processDir }
