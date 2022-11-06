# Circular Slider

The title says everything.

## Usage
(Also see example.html)

    new CircularSlider({
        container: ".selector", // CSS selector (required, string)
        min: 0,                 // min value (optional, number, defaults to 0)
        max: 100,               // max value (required, number)
        step: 1,                // step (required, number)
        radius: 150,            // slider radius in PX (optional, number, defaults to 200)
        color: "#FF0033"        // slider color (optional, string, defaults to #ff51a7)
    });

## Build
(Node.js required)

    npm install
    npm run build

## Run example

You can run it with [serve](https://www.npmjs.com/package/serve).

Install it globally

    npm install -g serve`

then

    serve -S dist
