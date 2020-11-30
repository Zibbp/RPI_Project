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