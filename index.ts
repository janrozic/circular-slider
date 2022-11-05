import { createSVGNode, getEventClientOffset, isTouchEvent, normalizeOptions } from "./helpers";
import { NormalizedOptions, Options } from "./helpers/types";

export default class CircularSlider {
  private options: NormalizedOptions;
  private _value: number;
  private thickness = 20; // TMP

  constructor(opts: Options) {
    this.options = normalizeOptions(opts);
    // this._value = this.options.min; // TMP
    this._value = this.options.min + (this.options.max - this.options.min) * 0.3; // TMP
    this.renderDefault();
    this.attachListeners();
  }

  private get value() {
    return this._value;
  }
  private set value(v: number) {
    const start = this.options.min;
    const end = this.options.max;
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    // snap to step (why "v - start" => start can be 3 and step 5 => we have to snap diff)
    const diff = Math.round((v - start) / this.options.step) * this.options.step;
    this._value = Math.min(max, Math.max(min, diff + start));
    requestAnimationFrame(() => this.updateDynamic());
  }

  private get root(): ShadowRoot {
    return this.options.container.shadowRoot || this.options.container.attachShadow({mode: "open"});
  }

  private _arc: SVGElement;
  /**
   * dynamic circle arc path
   */
  private get arc(): SVGElement {
    if (!this._arc) {
      this._arc = createSVGNode("path", {
        "d": this.arcPath.join(" "),
        "fill": "none",
        "stroke": this.options.color,
        "stroke-opacity": "80%",
        "stroke-linecap": "butt",
        "stroke-width": this.thickness,
      });
    }
    return this._arc;
  }
  private _handle: SVGElement;
  /**
   * small indicator circle
   */
  private get handle(): SVGElement {
    if (!this._handle) {
      const [cx, cy] = this.endPoint;
      this._handle = createSVGNode("circle", {
        cx,
        cy,
        r: this.thickness * 0.5 + 1,
        fill: "#efefef",
        stroke: "#bfbfbf",
        "stroke-width": 2,
        style: "cursor: pointer",
      });
    }
    return this._handle;
  }
  private get size(): number {
    return this.options.radius;
  }
  
  private attachListeners() {
    this.root.addEventListener("mousedown", this.startDrag);
    this.root.addEventListener("touchstart", this.startDrag);
    document.documentElement.addEventListener("mouseleave", this.stopDrag);
    document.documentElement.addEventListener("touchleave", this.stopDrag);
  }
  
  private svg: SVGElement;
  private legend: HTMLSpanElement;
  /**
   * Creates slider structure. Should be called only once.
   */
  private renderDefault() {
    const [center, circleRadius] = this.circleAttributes;
    // base svg
    this.svg = createSVGNode("svg", {
      width: this.size,
      height: this.size,
      style: "position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)",
    });
    // leading circle
    const circleBelow = createSVGNode("circle", {
      cx: center,
      cy: center,
      r: circleRadius,
      fill: "none",
      stroke: "#c0c1c2",
      "stroke-width": this.thickness,
      "stroke-dasharray": "7 2",  // approx
    });
    this.svg.appendChild(circleBelow);
    // arc & handle (progress)
    this.svg.appendChild(this.arc);
    this.svg.appendChild(this.handle);
    this.holders.svg.appendChild(this.svg);
    const legendHolder = document.createElement("div");
    const legendIndicator = document.createElement("span");
    this.legend = document.createElement("span");
    this.legend.innerText = this.valueText;
    legendIndicator.setAttribute("style", `background: ${this.options.color}`);
    legendHolder.appendChild(this.legend);
    legendHolder.appendChild(legendIndicator);
    this.holders.legend.appendChild(legendHolder);
  }

  private _holders: {
    svg: HTMLElement,
    legend: HTMLElement,
  }
  private get holders(): typeof CircularSlider.prototype._holders {
    if (!this._holders) {
      this._holders = {
        svg: undefined,
        legend: undefined,
      };
      const keys = ["svg", "legend"] as const;
      for (const key of keys) {
        const dataSetProp = "circularSliderHolder" + key;
        for (let i = 0; i < this.root.children.length; i++) {
          const child = this.root.children[i];
          if ((child instanceof HTMLElement) && child.dataset[dataSetProp]) {
            this._holders[key] = child;
          }
        }
        if (!this._holders[key]) {
          this._holders[key] = document.createElement("div");
          this._holders[key].dataset[dataSetProp] = "1";
          this.root.appendChild(this._holders[key]);
        }
      }
      let max = this.size;
      for (let i = 0; i < this._holders.svg.children.length; i++) {
        const svg = this._holders.svg.children[i];
        if (svg.tagName.toLowerCase() === "svg") {
          const size = svg.getBoundingClientRect().height;
          max = Math.max(max, size);
        }
      }
      this._holders.svg.style.position = "relative";
      this._holders.svg.style.height = max + "px";
      this._holders.svg.style.width = max + "px";
    }
    return this._holders;
  }

  /**
   * Calculates meaningful event position
   * 
   * @param clientXY Event coordinates.
   * @returns [number: angle/progress (0 - 1) of circle, boolean: if event was on the circular track]
   */
   private getEventPosition = (clientXY: {x: number, y: number}): [progress: number, isOnTarget: boolean] => {
    const [center, circleRadius] = this.circleAttributes;
    const svgPosition = this.svg.getBoundingClientRect();
    const centerOffsetX = clientXY.x - svgPosition.x - center;
    const centerOffsetY = clientXY.y - svgPosition.y - center;

    // TODO: The following process could probably be done more cleverly
    const angleRad = Math.atan(centerOffsetY / centerOffsetX); // counterclockwise and starts on right
    let quadrant: 1 | 2 | 3 | 4;  // 1st quadrant is top right (0-25%), 2nd is bottom right (25-50%), etc.
    let angleProgress = angleRad / (2 * Math.PI); // normalized to 0 - 1 (instead of radians)
    if (centerOffsetX < 0) {
      quadrant = centerOffsetY < 0 ? 4 : 3;
    } else {
      quadrant = centerOffsetY < 0 ? 1 : 2;
    }
    switch (quadrant) {
      case 1:
      case 2:
        angleProgress = 0.25 + angleProgress;
        break;
      case 3:
      case 4:
        angleProgress = 0.75 + angleProgress;
        break;
    }
    const distanceFromCenter = Math.sqrt(centerOffsetX * centerOffsetX + centerOffsetY * centerOffsetY);
    const isInCircle =
      distanceFromCenter >= circleRadius - this.thickness * 0.5 &&
      distanceFromCenter <= circleRadius + this.thickness * 0.5
    ;
    return [angleProgress, isInCircle];
  }

  private onDrag = (e: MouseEvent | TouchEvent) => {
    const clientXY = getEventClientOffset(e);
    if (!clientXY) {
      return;
    }
    const [progress] = this.getEventPosition(clientXY);
    const start = this.options.min;
    const end = this.options.max;
    this.value = start + (progress * (end - start));
  }

  private startDrag = (e: MouseEvent | TouchEvent) => {
    const clientXY = getEventClientOffset(e);
    if (!clientXY) {
      return;
    }
    const [progress, isOnTarget] = this.getEventPosition(clientXY);
    const start = this.options.min;
    const end = this.options.max;
    if (isOnTarget) {
      e.preventDefault();
      this.value = start + (progress * (end - start));
      document.documentElement.addEventListener("mousemove", this.onDrag);
      document.documentElement.addEventListener("touchmove", this.onDrag);
      document.documentElement.addEventListener("mouseup", this.stopDrag);
      document.documentElement.addEventListener("touchend", this.stopDrag);
    }
  }
  public stopDrag = () => {
    document.documentElement.removeEventListener("mousemove", this.onDrag);
    document.documentElement.removeEventListener("touchmove", this.onDrag);
    document.documentElement.removeEventListener("mouseup", this.stopDrag);
    document.documentElement.removeEventListener("touchend", this.stopDrag);
  }

  get circleAttributes(): [center: number, radius: number] {
    return [
      this.size * 0.5,
      (this.size - this.thickness) * 0.5,
    ];
  }

  get endPoint(): [x: number, y: number, progress: number] {
    const [center, circleRadius] = this.circleAttributes;
    const start = this.options.min;
    const end = this.options.max;
    const valueRatio = Math.min(1, Math.max(0, (this.value - start) / (end - start)));
    const valueRadians = 2 * Math.PI * (1 - valueRatio) + 0.5 * Math.PI; // slider increases clockwise, starts at top
    const dx = Math.cos(valueRadians);
    const dy = Math.sin(valueRadians);
    return [
      center + circleRadius * dx,
      center - circleRadius * dy, // y axis is reversed (down = more)
      valueRatio,
    ];
  }
  get valueText(): string {
    return String(this.value);
  }
  get arcPath(): Array<string | number> {
    const [center, circleRadius] = this.circleAttributes;
    const [endx, endy, progress] = this.endPoint;
    return [
      "M", center, this.thickness * 0.5, // start on top
      "A",
      circleRadius, // rx
      circleRadius, // ry
      0,  // x-axis-rotation (doesn't matter for a circle)
      progress > 0.5 ? 1 : 0, // large-arc-flag
      1,  // sweep-flag
      endx,
      endy,
    ];
  }
  private updateDynamic = () => {
    const [x, y] = this.endPoint;
    // draw arc
    this.arc.setAttributeNS(null, "d", this.arcPath.join(" "));
    // move handle
    this.handle.setAttributeNS(null, "cx", String(x));
    this.handle.setAttributeNS(null, "cy", String(y));
    this.legend.textContent = this.valueText;
  }
  
}
