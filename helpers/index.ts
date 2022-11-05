import { NormalizedOptions, Options } from "./types";

/**
 * Creates SVG Element
 * @param tagName Tag name ("svg", "g", "path", etc.)
 * @param attributes Map of all attributes. Keys must be in kebab-case
 * @returns SVGElement
 */
export function createSVGNode(tagName: string, attributes: {[key: string]: any} = {}): SVGElement {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tagName.toLowerCase());
  for (const p in attributes)
    n.setAttributeNS(null, p, attributes[p]);
  return n;
}

const defaultOptions: Pick<NormalizedOptions, "color" | "min" | "radius"> = {
  color: "#ff51a7",
  min: 0,
  radius: 200,
};

/**
 * Checks options validity and normalizes options, finds container
 * @param opts Options
 * @returns NormalizedOptions
 */
export function normalizeOptions(opts: Options): NormalizedOptions {
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

export const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => e.type.substring(0, 5) === "touch";

export function getEventClientOffset(e: MouseEvent | TouchEvent): {x: number, y: number} | undefined {
  if (isTouchEvent(e)) {
    if (e.touches.length !== 1) {
      return;
    }
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  } else {
    return {
      x: e.clientX,
      y: e.clientY,
    }
  }
}