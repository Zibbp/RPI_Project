const express = require("express");

// Add color to console logs
const chalk = require("chalk");

// Import LED Strip functions
const ledStrip = require("./ledStrip");

// Import rgb to grb hex conversion
const grb = require("./utils/grb");

// Create express app
const app = express();

app.use(express.static("public"));

app.use(express.json());

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Set color and brightness from POST requst
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

const port = 3000;

app.listen(port, () => {
  console.log(chalk.yellow(`Server running on port ${port}`));
});
