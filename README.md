# fourbyfive

Command line tool to format images for best possible results on Instagram.

## Installation

```shell
$ npm install -g fourbyfive
```

## Use

The simplest way to use fourbyfive is to cd to the directory where your images are and run it without options. This will find all valid images in the current directory, process them according to the defaults and output them to a subdirectory named `fourbyfive`.

```shell
$ fourbyfive
```

## Options and defaults

```shell
Options:
  -V, --version             output the version number
  -i, --input <string>      Source/input directory (default: ".")
  -m, --mode <string>       Scaling mode, "fit" or "fill" (default: "fit")
  -a, --aspect <string>     Output aspect ratio (default: "4:5")
  -p, --padding <integer>   Padding width in pixels as integer (default: 0)
  -c, --color <numbers...>  Color of background/border (default: ["255","255","255","1"])
  -o, --output <string>     Output directory, defaults to "fourbyfive" dir in input
  -w, --width <integer>     Width of resulting image, default: 2160. Height calculated from aspec ratio.
  -s, --sharpen <integer>   Amount of sharpening, 0 for none or 1 or 2, default 1
  -h, --help                display help for command
```

## Scaling mode

fourbyfive will always output a file that's 2160x2700 (or 2160x2160 for landscape orientation if specified). This option determines how your image will be scaled inside this canvas. Your options are

- `fit` The default, will make sure the whole image fits within the canvas
- `fill` Will fill the canvas, resulting in center-based cropping if your original image does not already match the output aspect ratio

```shell
$ fourbyfive -m fill
```

## Padding

To create a border around the image, specify the padding as an integer pixel value. The color of this border will be picked from the `color`option. This adds a 100px border in the form of padding around the edges limiting the maximum size of the image within it:

```shell
$ fourbyfive -padding 100
```

## Border and background color

These options are combined into a single color option. The default is white, but you can specify any RGBA value you want as space-separated numbers. This will add a 50% transparent blue background/border:

```shell
$ fourbyfive -color 0 0 255 0.5
```

## --sharpen option

Scaling images always results in loss of sharpness. By default fourbyfive will apply a very gentle sharpening to images after they are scaled. This can be disabled by passing a value of 0, or increased by passing a value of 2.

```shell
$ fourbyfive -s 2
```

## --aspect option

By default fourbyfive will output every image in the maximum size 4:5 aspect ratio. If you prefer your a different aspect ratio you can specify it here.

```shell
$ fourbyfive -a 9:16
```

## The theory

The absolute maximum number of pixels you cen get on the screen on Instagram is an aspect ratio of 4:5 with a maximum resolution of 1080x1350. Instagram will recompress your image after upload no matter what you do, so to get the best possible resolution you should upload an image that is twice that size and slightly sharpened to compensate for scaling blur.
