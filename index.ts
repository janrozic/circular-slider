import { createSVGNode, normalizeOptions } from "./helpers";
import { NormalizedOptions, Options } from "./helpers/types";

export default class CircularSlider {
  private _options: NormalizedOptions;
  private _value: number;

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
  private get thickness(): number {
    return 10; // TMP
  }
  private get bounds(): [start: number, end: number] {
    return [this._options.min, this._options.max];
  }
  private renderDefault() {
    const svg = createSVGNode("svg", {width: this.size, height: this.size});
    svg.appendChild(this.arc);
    this._options.container.appendChild(svg);
  }
  get arcPath(): Array<string | number> {
    const center = this.size * 0.5;
    // percent
    const valueRatio = Math.min(1, Math.max(0, (this.value - this.bounds[0]) / (this.bounds[1] - this.bounds[0])));
    // const value
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    // a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
    return [
      "M", center, 0, // start on top
      "A",
      this.size - this.thickness / 2,
      this.size - this.thickness / 2,
      0,
      // TODO
    ];
  }
  private updateArc() {
    this.arc.setAttributeNS(null, "path", this.arcPath.join(" "));
  }
  
}