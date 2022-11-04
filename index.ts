import { createSVGNode, normalizeOptions } from "./helpers";
import { NormalizedOptions, Options } from "./helpers/types";

export default class CircularSlider {
  private _options: NormalizedOptions;
  private _value: number;
  private thickness = 10; // TMP

  constructor(opts: Options) {
    this._options = normalizeOptions(opts);
    this.renderDefault();
    this.value = this._options.min;
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
      this._arc = createSVGNode("path", {d: this.arcPath.join(" ")});
    }
    return this._arc;
  }
  private get size(): number {
    return this._options.radius;
  }
  private renderDefault() {
    const svg = createSVGNode("svg", {width: this.size, height: this.size});
    svg.appendChild(this.arc);
    this._options.container.appendChild(svg);
  }

  private arcPathBase = [
    "M", this.size * 0.5, 0, // start on top
    "A",
    this.size - (this.thickness * 0.5), // rx
    this.size - (this.thickness * 0.5), // ry
    0,  // x-axis-rotation (doesn't matter for a circle)
  ];
  get arcPath(): Array<string | number> {
    const start = this._options.min;
    const end = this._options.max;
    // percent
    const valueRatio = Math.min(1, Math.max(0, (this.value - start) / (end - start)));
    const valueRadians = 2 * Math.PI * (1 - valueRatio); // slider increases clockwise
    const dx = Math.cos(valueRadians);
    const dy = Math.sin(valueRadians);
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    return [
      ...this.arcPathBase,
      valueRatio > 0.5 ? 1 : 0, // large-arc-flag
      0,  // TODO
      ((this.size - this.thickness) / 2) * dx,
      ((this.size - this.thickness) / 2) * dy,
    ];
  }
  private updateArc() {
    this.arc.setAttributeNS(null, "d", this.arcPath.join(" "));
  }
  
}