Install packages needed

```
sudo apt-get install gcc make build-essential python-dev git scons swig
```

# Javascript

I'm much more familiar with Javascript so I will be using it rather than Python to control the LED strip.

Just like Python, a library (module in javascript terms) is needed to control the LED strip. I will be using the [RPI-ws281x-native](https://www.npmjs.com/package/rpi-ws281x-native) module. Looking the documentation the module exports five functions.

```js
exports = {
  /**
   * configures PWM and DMA for sending data to the LEDs.
   *
   * @param {Number} numLeds  number of LEDs to be controlled
   * @param {?Object} options  (acutally only tested with default-values)
   *                           intialization-options for the library
   *                           (PWM frequency, DMA channel, GPIO, Brightness)
   */
  init: function (numLeds, options) {},

  /**
   * register a mapping to manipulate array-indices within the
   * data-array before rendering.
   *
   * @param {Array.<Number>} map  the mapping, indexed by destination.
   */
  setIndexMapping: function (map) {},

  /**
   * set the overall-brightness for the entire strip.
   * This is a fixed scaling applied by the driver when
   * data is sent to the strip
   *
   * @param {Number} brightness the brightness, value from 0 to 255.
   */
  setBrightness: function (brightness) {},

  /**
   * send data to the LED-strip.
   *
   * @param {Uint32Array} data  the pixel-data, 24bit per pixel in
   *                            RGB-format (0xff0000 is red).
   */
  render: function (data) {},

  /**
   * clears all LEDs, resets the PWM and DMA-parts and deallocates
   * all internal structures.
   */
  reset: function () {},
};
```

## Basic usage

First install the module

```
npm install rpi-ws281x-native
```

To get started, create a javscript file and import the module.

```javascript
const ws281x = require("rpi-ws281x-native");
```

Then initialize the module with the number of LEDs based on the [documentation](https://github.com/beyondscreen/node-rpi-ws281x-native#basic-usage).

```javascript
// Number of LEDs
const NUM_LEDS = 14;
// Creates an array based on the number of LEDs
pixelData = new Uint32Array(NUM_LEDS);
// Initialize the module for use
ws281x.init(NUM_LEDS);
```

Now that the module is setup, we are ready to use it. In this example I loop through each LED and assign it a color then called the `render` update the LEDs.

This module uses hex codes for color assignment versus the Python library which uses RGB numbers.

```js
for (var i = 0; i < NUM_LEDS; i++) {
  pixelData[i] = 0xff0000;
}
ws281x.render(pixelData);
```

But wait, the above hex code is red but the LED strip is showing green. Why is that? The LED strip that I have is GRB (green-red-blue) and the module _only_ supports RGB (red-green-blue). This means that I have to convert the hexcode which is `rrggbb` to `ggrrbb`. This can be easily accomplished by creating a function which takes a normal hex code and replaces the first two characters wit the middle two.

```js
function grb(hex) {
  const r = hex.slice(0, 2);
  const g = hex.slice(2, 4);
  const b = hex.slice(4, 6);
  const grb = `0x${g}${r}${b}`;
  return grb;
}
module.exports = grb;
```

Then when using it in my code I import it and call the function like so

```js
import grb = require('./utils/grb.js')
...
pixelData[i] = grb('ff0000')
```

### INSERT PICTURE

The brightness can be controlled by calling the `setBrightness` function providing it with a number between 1 and 255.

```js
ws281x.setBrightness(255);
```

_Code from this basic example can be found in /examples/basic.js_

# Practical Usage

Writing code and watching the LEDs change is great but I don't want to be doing that everyime I want to change the color, brightness, or effects of the LED strip. To make the user experience easier I'm going to be creating a web interface which will allow me to control the LED strip anywhere without having to deal with code.

### Webserver Setup

I will be using [Express](https://expressjs.com/), a popular web framework for NodeJS. To get started I created an extremely simple server.

```js
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Supporting Emerging Technolgies - Raspberry PI Project");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

Browsing to the website using the Raspberry PI's ip with port 3000 will greet me with the text from the code.

### Setting up the LED Strip

To make everything cleaner, I will be placing the setup of the LED module in a seperate file named `ledStrip.js`.

```js
var NUM_LEDS = 14;
var ws281x = require("rpi-ws281x-native");
var pixelData = new Uint32Array(NUM_LEDS);
var Lights = [];

ws281x.init(NUM_LEDS);

const ledStrip = () => {
	this.NUM_LEDS = NUM_LEDS;
	this.mode = "";
	this.lights = [];
	this.clear = () => {
		ws281x.reset();
	};

	this.stop = = () => {
		strip.Clear();
		currentMode = MODES.CLEAR;
	};

	this.setBrightness = (brightness) => {
		ws281x.setBrightness(brightness);
	};

	this.setLedStripColor = (color) => {
		for (var i = 0; i < NUM_LEDS; i++) {
			this.Lights[i] = color;
		}
		this.render();
	};

	this.render = () => {
		var tmp = [];
		for (var i = 0; i < NUM_LEDS; i++) {
			if (i > NUM_LEDS) break;
			tmp[i] = this.Lights[i];
		}

		ws281x.render(tmp);
	};
}

module.exports = new ledStrip();
```
