# igformat
Command line tool to format images for best possible results on Instagram.

## Installation
```shell
$ npm install -g igformat
```

## Use

The simplest way to use igformat is to cd to the directory where your images are and run it without options. This will find all valid images in the current directory, process them according to the defaults and output them to a subdirectory named `igformat`.

```shell
$ igformat
```

## Options and defaults

```shell
Options:
  -V, --version             output the version number
  -i, --input <string>      Source/input directory (default: ".")
  -m, --mode <string>       Scaling mode, "fit" or "fill" (default: "fit")
  -p, --padding <integer>   Padding width in pixels as integer (default: 0)
  -c, --color <numbers...>  Color of background/border (default: ["255","255","255","1"])
  -o, --output <string>     Output directory, defaults to "igformat" dir in input
  --no-sharpen              Don't sharpen after resizing
  --no-talllandscape        Use 1:1 format for landscape-oriented photos instead if 4:5
  -h, --help                display help for command
```

## Scaling mode
igformat will always output a file that's 2160x2700 (or 2160x2160 for landscape orientation if specified). This option determines how your image will be scaled inside this canvas. Your options are
- `fit` The default, will make sure the whole image fits within the canvas
- `fill` Will fill the canvas, resulting in center-based cropping if your original image does not already match the output aspect ratio

```shell
$ igformat -m fill
```

## Padding
To create a border around the image, specify the padding as an integer pixel value. The color of this border will be picked from the `color`option. This adds a 100px border in the form of padding around the edges limiting the maximum size of the image within it:

```shell
$ igformat -padding 100
```

## Border and background color
These options are combined into a single color option. The default is white, but you can specify any RGBA value you want as space-separated numbers. This will add a 50% transparent blue background/border:

```shell
$ igformat -color 0 0 255 0.5
```

## --no-sharpen option
Scaling images always results in loss of sharpness. By default igformat will apply a very gentle sharpening to images after they are scaled. This can be disabled with the `--no-sharpen` option

```shell
$ igformat --no-sharpen
```

## --no-talllandscape option
By default igformat will output every image in the maximum size 4:5 aspect ratio. If you insteas prefer your landscape-oriented images to not take up as much space you can add the `--no-talllandscape` flag and igformat will instead output square images of maximum size for images where the width is larger than the height.

```shell
$ igformat --no-talllandscape
```

## The theory
The absolute maximum number of pixels you cen get on the screen on Instagram is an aspect ratio of 4:5 with a maximum resolution of 1080x1350. Instagram will recompress your image after upload no matter what you do, so to get the best possible resolution you should upload an image that is twice that size and slightly sharpened to compensate for scaling blur.
