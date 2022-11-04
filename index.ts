type Options = {
  container: string | HTMLElement,
  color: string,
  min?: number,
  max: number,
  step: number,
  radius: number,
};

type NormalizedOptions = NonNullable<Options> & {
  container: HTMLElement,
};

const defaultOptions: Partial<NormalizedOptions> = {
  color: "#ff51a7",
  min: 0,
  radius: 200,
};

export default class CircularSlider {
  private _options: NormalizedOptions;
  constructor(opts: Options) {
    this._options = this.normalizeOptions(opts);
  }

  /**
   * Checks options validity and normalizes options, finds container
   * @param opts Options
   * @returns NormalizedOptions
   */
  private normalizeOptions(opts: Options): NormalizedOptions {
    const normalized = {
      ...defaultOptions,
      ...opts,
    };
    const container = typeof opts.container === "string" ? document.querySelector(opts.container) : opts.container;
    if (!container || !(container instanceof HTMLElement)) {
      // TODO: Should we watch for DOM changes?
      throw new Error("Cannot find container");
    }
    normalized.container = container;
    if (opts.step === 0) {
      throw new Error("Step cannot be zero");
    }
    const boundsDiff = normalized.max - normalized.min;
    if (boundsDiff === 0) {
      throw new Error("Slider's min and max options should differ.");
    }
    if (Math.abs(normalized.step) > Math.abs(boundsDiff)) {
      throw new Error("Step cannot be larger than bounds difference");
    }
    // Support negative direction
    if (Math.sign(boundsDiff) !== Math.sign(normalized.step)) {
      normalized.step *= -1;
    }
    const mustBeNumbers = ["max", "min", "radius", "step"] as const;
    for (const key of mustBeNumbers) {
      normalized[key] = Number(opts[key]);
      if (isNaN(normalized[key])) {
        throw new Error(`${key} should be a number`);
      }
    }
    return {
      ...normalized,
      container,
    };
  }
  
}