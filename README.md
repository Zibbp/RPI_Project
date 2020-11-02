# Supporting Emerging Technologies

## Fall 2020 - Raspberry PI Project

### Isaac Brummel

## RGB LED Light Strip

### Parts List:

- Raspberry PI
- WS2812b LED Strip
  - ![WS2812b LED Strip](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/led_strip.png?token=AFBZQGNDZG52YGC3BYKHFBK7VGTXW)
- 5v Power Supply
  - ![5v Power Supply](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/power_supply.png?token=AFBZQGOVWLWS3B6ST6BMIU27VGTT2)

# Setting up the Raspberry PI

For the operating system I chose the lite version of Raspberry Pi OS. The lite version doesn't include a GUI meaning it uses less resources. I used the Raspberry Pi Imager to flash the OS.

![Images](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/setup_image1.png?token=AFBZQGISLVAO5QLVV6ONMIK7VGT5S)

Since the lite version does not include a GUI, I need to setup SSH. To accomplish this without having to use a monitor, place a file named `ssh` into the root directory of the ssd card.

![ssh](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/setup_image2.png?token=AFBZQGJXXAGQSTCUGOMAMFC7VGUEU)

After inserting the SD card and supplying power and ethernet I looked in my router and found the IP given by my DHCP server to the Raspberry PI and logged in with `pi:raspberry`.

Once logged in, I wanted to give the Raspberry Pi a static IP address, to do so edit `/etc/dhcpcd.conf` and add the following.

![static ip](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/setup_image3.png?token=AFBZQGMEI4EM3OHQPZZZVJC7VGUQW)

After a reboot I'm able to ssh into the Raspberry Pi using the static IP.

# Wiring the LED Strip

The final plan for this project is to have the LED strip attatched to the back side of my desk. For learning and development I cut off a portion of the 16 foot LED strip to make it easier.

The LED strip did not come with any wires to hook it up to the GPIO pins on the Raspberry Pi. Luckily I had some breadboard jumper wires which I soldered on the cut LED strip.

The ws2812b LED driver has three wire connections: 5v power, ground, and a data connection.

![Soldered Wires](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/1-min.jpg?token=AFBZQGPT7ZZ5SXTSOT2GOJK7VGXDQ)

Once soldered to the strip, I plugged the other ends into the Pi's GPIO pins following a pinout guide attatching the 5v to the GPIO 5v, ground to the GPIO ground, and the data to GPIO #1 (pin 12).

![pinout](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/pinout.png?token=AFBZQGM3YFL52KRVK63WFNK7VGYMK)

![rpi_connection](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/2-min.jpg?token=AFBZQGONSDFVOMMPW54TS527VGYMI)

Now that the LED strip is connected, I can start coding.

# Controlling the LEDs

The most popular coding language used on the Raspberry Pi is Python, although any language can be used. With that in mind I initially decided to use Python to drive the LED strip due to it's popularity but after some research I found a NodeJS module that allowed me to use Javascript to drive the LED strip. Before finding the module I used Python and below is how I got it running.

## Python

First I installed the necessary libraries, in this case I'm installed Adafruit's Neopixel library.

```
sudo pip3 install rpi_ws281x adafruit-circuitpython-neopixel
```

Once installed, I connected to the Raspberry Pi in Visual Studio Code using SSH which allows me to write and run code using my computer but is really stored and executed on the Raspberry Pi.

After setting everything up in VS Code, I created a python file and added the following code.

```python
# Import GPIO pins
import board
# Import installed Neopixel library
import neopixel
# Initialize Neopixel library with data bin, number of leds, and brighness
pixels = neopixel.NeoPixel(board.D18, 14, brightness=1)

# Set the first pin to red
pixels[0] = (255, 0, 0)
```

Running the code lights the first LED red.

![Red LED](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/3-min.jpg?token=AFBZQGO3GSBS6W5XHUNKRC27VGXEO)

Cool, let's light another LED and make it green.

```python
...
pixels[0] = (255, 0, 0)
pixels[1] = (0, 255, 0)
```

![red and green](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/4-min.jpg?token=AFBZQGJY2LNS55VAJKAE5XK7VGYZY)

To control the entire LED strip I used a library method of `fill` rather than selecting individual pixels like above.

```python
pixels.fill((0, 255, 0))
```

![full green](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/5-min.jpg?token=AFBZQGKDEXXHJFVFB4UILNS7VGY3Y)

The brightness can be controlled by editing the number when creating the `pixels` variable at the top. It accepts a float from 0 to 1.

```python
pixels = neopixel.NeoPixel(board.D18, 14, brightness=0.25)
```

![0.25](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/6-min.jpg?token=AFBZQGKI3FAFXAGOBSGJOVS7VGZCU)

At this point I found the NodeJS module which allowed me to do the same thing but in Javascript.

## NodeJS

After finding the NodeJS module that allowed me to accomplish what I just did in Python I was excited because I know Javscript much better than I do Python.

Just like Python, a module (library in javascript terms) is needed to control the LED strip. I will be using the [RPI-ws281x-native](https://www.npmjs.com/package/rpi-ws281x-native) module. Looking the documentation the module exports five functions.

## Basic usage

First I installed the module.

```
npm install rpi-ws281x-native
```

Then created a javscript file and import the module.

```javascript
const ws281x = require("rpi-ws281x-native");
```

Then initialized the module with the number of LEDs based on the [documentation](https://github.com/beyondscreen/node-rpi-ws281x-native#basic-usage).

```javascript
// Number of LEDs
const NUM_LEDS = 14;
// Creates an array based on the number of LEDs
pixelData = new Uint32Array(NUM_LEDS);
// Initialize the module for use
ws281x.init(NUM_LEDS);
```

Now that the module is setup, I am ready to use it. In this example I loop through each LED and assign it a color then called the `render` methed exposed by the module to update the LEDs.

This module uses hex codes for color assignment versus the Python library which uses RGB numbers.

```js
for (var i = 0; i < NUM_LEDS; i++) {
  pixelData[i] = 0xff0000;
}
ws281x.render(pixelData);
```

![nodejs_green](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/7-min.jpg?token=AFBZQGL4TNPUUPOG6C4XJI27VGZUO)

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

Then when using it in my code I import it and call the function like so.

```js
import grb = require('./utils/grb.js')
...
pixelData[i] = grb('ff0000')
```

![fixed hex](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/8-min.jpg?token=AFBZQGPEBH5PHVDFDBOBWN27VG2F2)

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

![website image](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/example_website.png?token=AFBZQGPLS2RYWYYHWIJ6OO27VG2MY)

### Setting up the LED Strip

To make everything cleaner, I will be placing the setup of the LED module in a seperate file named `ledStrip.js`.

```js
var NUM_LEDS = 14;
var ws281x = require("rpi-ws281x-native");
var pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

function ledStrip() {
  this.NUM_LEDS = NUM_LEDS;
  this.mode = "";
  this.pixelData = [];
  this.clear = () => {
    ws281x.reset();
  };

  this.stop = () => {
    strip.Clear();
    currentMode = MODES.CLEAR;
  };

  this.setBrightness = (brightness) => {
    ws281x.setBrightness(brightness);
  };

  this.setLedStripColor = (color) => {
    for (var i = 0; i < NUM_LEDS; i++) {
      this.pixelData[i] = color;
    }
    this.render();
  };

  this.render = () => {
    var tmp = [];
    for (var i = 0; i < NUM_LEDS; i++) {
      if (i > NUM_LEDS) break;
      tmp[i] = this.pixelData[i];
    }

    ws281x.render(tmp);
  };
}

module.exports = new ledStrip();
```

To use the ledStrip module, it needs to be imported in the `server.js` file.

```js
const ledStrip = require("./ledStrip");
```

Now that it's imported, it can be tested by doing something simple such as setting the LED strip color to white when the server is started. Within `app.listen` I call a method of `setLedStripColor` which was made in the `ledStrip.js` file.

```js
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  ledStrip.setLedStripColor(grb("ffffff"));
});
```

### Remote Usage

To allow the LED strip to be changed remotely I'm going to use HTTP Post requests. I created a route that accepts a POST request with a JSON body of color and brightness. When a Post request is sent it will try to change the color and brightness if those variables are included in the body of the request.

```js
app.post("/set", (req, res) => {
  const { color, brightness } = req.body;
  try {
    if (color) {
      console.log(
        chalk.blue(`Setting color to`, chalk.hex(`#${color}`).bold(color))
      );
      ledStrip.setLedStripColor(grb(color));
    }
    if (brightness) {
      console.log(chalk.blue(`Setting brightness to ${brightness}`));
      ledStrip.setBrightness(parseInt(brightness));
    }
    res.status(200).json({ success: true, color, brightness });
  } catch (error) {
    console.log(chalk.red(error));
    res.status(500).json({ success: false, error });
  }
});
```

To test this, I will be using [Insomnia](https://insomnia.rest/), an opensource API client for REST and GraphQL requests. Within Insomnia I make a new POST request and enter the Pi's IP, webserver port, and route which is `/set`. I also include a JSON body with two variable of color and brightness.

![insomnia](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/insomnia_post.png?token=AFBZQGNN2EDSFLZSKL2YU627VHDAG)

Here is a gif of it in action

![insomnia_gif](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/post_insomnia.gif?token=AFBZQGMKEDRTSNSC74SUI4S7VHDBA)
