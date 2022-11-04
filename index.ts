import { createSVGNode, normalizeOptions } from "./helpers";
import { NormalizedOptions, Options } from "./helpers/types";

export default class CircularSlider {
  private options: NormalizedOptions;
  private _value: number;
  private thickness = 10; // TMP

  constructor(opts: Options) {
    this.options = normalizeOptions(opts);
    this._value = this.options.min; // TMP
    // this._value = this._options.min + (this._options.max - this._options.min) * 0.5;
    this.renderDefault();
  }

  private get value() {
    return this._value;
  }
  private set value(v: number) {
    this._value = v;
    requestAnimationFrame(this.updateArc);
  }

  private _arc: SVGElement;
  /**
   * dynamic circle arc path
   */
  private get arc(): SVGElement {
    if (!this._arc) {
      this._arc = createSVGNode("path", {
        "d": this.arcPath.join(" "),
        "stroke": this.options.color,
        "fill": "none",
        "stroke-linecap": "butt",
        "stroke-width": this.thickness,
      });
    }
    return this._arc;
  }
  private get size(): number {
    return this.options.radius;
  }
  private renderDefault() {
    const svg = createSVGNode("svg", {width: this.size, height: this.size});
    svg.appendChild(this.arc);
    this.options.container.appendChild(svg);
  }

  get arcPath(): Array<string | number> {
    const start = this.options.min;
    const circleRadius = (this.size - this.thickness) * 0.5;
    const end = this.options.max;
    const center = this.size * 0.5;
    // percent
    const valueRatio = Math.min(1, Math.max(0, (this.value - start) / (end - start)));
    const valueRadians = 2 * Math.PI * (1 - valueRatio) + 0.5 * Math.PI; // slider increases clockwise, starts at top
    const dx = Math.cos(valueRadians);
    const dy = Math.sin(valueRadians);
    console.log({dx, dy});
    console.log(valueRadians, valueRatio);
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    return [
      "M", center, this.thickness * 0.5, // start on top
      "A",
      circleRadius, // rx
      circleRadius, // ry
      0,  // x-axis-rotation (doesn't matter for a circle)
      valueRatio > 0.5 ? 1 : 0, // large-arc-flag
      1,  // TODO
      center + circleRadius * dx,
      center - circleRadius * dy, // y axis is reversed (down = more)
    ];
  }
  private updateArc() {
    this.arc.setAttributeNS(null, "d", this.arcPath.join(" "));
  }
  
}
