# Supporting Emerging Technologies - Fall 2020

```js
// Project: Raspberry Pi Project - RGB LED Strip
// Author: Isaac Brummel
```

## RGB LED Light Strip

### Parts List:

- Raspberry PI
- WS2812b LED Strip
  - ![WS2812b LED Strip](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/led_strip.png)
- 5v Power Supply
  - ![5v Power Supply](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/power_supply.png)
- 3x Breadboard jumper wires
- 12 AWG Wire

# Setting up the Raspberry PI

For the operating system I chose the lite version of Raspberry Pi OS. The lite version doesn't include a GUI meaning it uses less resources. I used the Raspberry Pi Imager to flash the OS.

![Images](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/setup_image1.png)

Since the lite version does not include a GUI, I need to setup SSH. To accomplish this without having to use a monitor, place a file named `ssh` into the root directory of the ssd card.

![ssh](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/setup_image2.png)

After inserting the SD card and supplying power and ethernet I looked in my router and found the IP given by my DHCP server to the Raspberry PI and logged in with `pi:raspberry`.

Once logged in, I wanted to give the Raspberry Pi a static IP address, to do so edit `/etc/dhcpcd.conf` and add the following.

![static ip](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/setup_image3.png)

After a reboot I'm able to ssh into the Raspberry Pi using the static IP.

# Wiring the LED Strip

The final plan for this project is to have the LED strip attatched to the back side of my desk. For learning and development I cut off a portion of the 16 foot LED strip to make it easier.

The LED strip did not come with any wires to hook it up to the GPIO pins on the Raspberry Pi. Luckily I had some breadboard jumper wires which I soldered on the cut LED strip.

The ws2812b LED driver has three wire connections: 5v power, ground, and a data connection.

![Soldered Wires](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/1-min.jpg)

Once soldered to the strip, I plugged the other ends into the Pi's GPIO pins following a pinout guide attatching the 5v to the GPIO 5v, ground to the GPIO ground, and the data to GPIO #1 (pin 12).

![pinout](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/pinout.png)

![drawup](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/internal_power.jpg)

![rpi_connection](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/2-min.jpg)

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

![Red LED](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/3-min.jpg)

Cool, let's light another LED and make it green.

```python
...
pixels[0] = (255, 0, 0)
pixels[1] = (0, 255, 0)
```

![red and green](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/4-min.jpg)

To control the entire LED strip I used a library method of `fill` rather than selecting individual pixels like above.

```python
pixels.fill((0, 255, 0))
```

![full green](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/5-min.jpg)

The brightness can be controlled by editing the number when creating the `pixels` variable at the top. It accepts a float from 0 to 1.

```python
pixels = neopixel.NeoPixel(board.D18, 14, brightness=0.25)
```

![0.25](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/6-min.jpg)

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

![nodejs_green](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/7-min.jpg)

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

![fixed hex](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/8-min.jpg)

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

![website image](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/example_website.png)

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

To test this, I will be using [Insomnia](https://insomnia.rest/), an opensource API client for REST and GraphQL requests. Within Insomnia I make a new POST request and enter the Pi's IP, webserver port, and route which is `/set`. I also include a JSON body with two variables, color and brightness.

![insomnia](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/insomnia_post.png)

Here is a video of it in action
[https://www.youtube.com/watch?v=rEyYfssE4uw](https://www.youtube.com/watch?v=rEyYfssE4uw)

### Creating the Web UI

Sending POST requests is better than changing the code but it's not as good as having a web ui to control the LED strip.

#### Starting Simple

I like starting simple, making sure everything works before going further so I made a simple HTML page with some javscript that has a form for a hexcode and brightness.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Web LED</title>
  </head>

  <body>
    <h1>Web LED</h1>
    <form id="set">
      <label for="color">Color</label>
      <input type="text" id="color" name="color" maxlength="6" />
      <label for="brightness">Brightness</label>
      <input type="text" id="brightness" name="brightness" maxlength="3" />
      <input type="submit" value="Set" />
    </form>
    <script src="/js/app.js"></script>
  </body>
</html>
```

```js
document.addEventListener("submit", function (event) {
  // Prevent form from submitting to the server
  event.preventDefault();

  // Create data object from submitted form entries
  const data = Object.fromEntries(new FormData(event.target));

  // Create JSON body for the POST request
  const postBody = { color: data.color, brightness: data.brightness };

  // Execute POST request
  fetch("/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postBody),
  }).then((response) => console.log(response));
});
```

Now when navigating to the webserver the page is updated with the form.
![form image](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/9.png?token=AFBZQGLGEYDRAU4NLL3QHVS7VQQ6Q)

It also works! Here is a video showing it in action [https://www.youtube.com/watch?v=SmhN_e1XRfk](https://www.youtube.com/watch?v=SmhN_e1XRfk)

#### Making the website user friendly

To make controlled the LED strip easier I made 10 buttons, each being a different color. Pressing each buttong would change the LED strip to it's corresponding color. An example of a button looks like

```html
<div class="column"><button class="ui red button" id="red">Red</button></div>
```

To make the LED strip change color to red, I wrote some javascript to accomplish it.

```js
// If red button is clicked execute function "post" with hexcode of red
$("#red").click(function (e) {
  post("FF0000");
});
```

The post function is at the end of the file and takes two arguments, `color`, and `brightness`. When the function is called it sends the POST request to the `/set` endpoint.

```js
function post(color, brightness) {
  const postBody = { color, brightness };

  fetch("/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postBody),
  });
}
```

I also wanted a brightness slider so I wouldn't have to type in a number to change it. For this I used the html input range type to create a slider and styled it with CSS.

```html
<input
  type="range"
  min="0"
  max="255"
  value="127"
  step="5"
  class="slider"
  id="brightnessSlider"
/>
```

The javscript to control the brightness is simple. It takes the value of the slider when moved and called the `post` function from above.

```js
$(document).on("input", "#brightnessSlider", function () {
  post(null, $(this).val());
});
```

After some styling, I have a somewhat nice looking website to control the LED strip.

It works on both desktop and mobile.

![desktop site](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/desktop_site.png)

![mobile site](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/mobile_site.png)

Here is a video of it in action [https://www.youtube.com/watch?v=StSN_iU6zMM](https://www.youtube.com/watch?v=StSN_iU6zMM)

# Final Assembly

The Raspberry Pi does not output enough power to power the entire LED strip so an external power supply is needed. The specific LEDs I'm using (ws2812b) require 0.06 amps per individual LED at full load. Full load meaning white so all three diodes (red, green, and blue) are powered to create the white color at 100% brightness. The number of LEDs I'm using is 161 so `0.06 x 161` equals `9.66` amps. While this may seem like a lot of power it is only when the LED strip is at 100% brightness and white, which will rarely happen. A more realistic power consumption number would be around `5` amps as most of the time all three diodes will not be activated unless the strip is displaying white.

The power supply I purchased, linked in the parts list, is capable of 20 amps which is more than enough for this project.

## Wiring the Power Supply

![power supply](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/powersupply_wiring_1.png)

The power supply doesn't come with a cable to plug it in so I had to make my own. I grabbed a normal PC power plug and snipped off the end. I then stripped the three wires (positive, negative, ground) and screwed them into the AC input of the power supply.

## Wiring the LED Strip and Raspberry Pi

![external power wiring diagram](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/external_power.jpg)

Instead of the LED Strip drawing power from the Raspberry Pi, the positive wire will now be plugged into the power supply. The middle data wire will go the Raspberry Pi just like before. The negative wire will go to both the power supply and Raspberry Pi. This is because the Pi needs a common ground to control the LED strip.

You may be wondering why there is four wires coming from the DC side of the power supply. This is because ws2812b LED strips use 5 volt power causing voltage drop off to occur. Voltage drop off results in the end of the LED strip furthest from the power source to become discolored as it is receiving less than 5 volts of power.

![voltage drop off](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/voltage-dropoff.jpg)

To counter this, I wired up the positive and negative terminals of the other end of the LED strip. Now both ends are being supplied with 5v of power eliminating the voltage drop.

![DC power connections](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/powersupply_wiring_2.png)

# Finished Product

I installed the LED strip behind my desk.

![Finished Image 1](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/final_1.jpg)

![Finished Image 2](https://raw.githubusercontent.com/Zibbp/RPI_Project/master/documentation/images/final_2.jpg)

# Future Improvements

- Adding animation
  - ws2812b LEDs are individually adressable meaning each LED can be a different color. This allows for some cool animation effects.
