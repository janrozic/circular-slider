
export type Options = {
  container: string | HTMLElement,
  color: string,
  min?: number,
  max: number,
  step: number,
  radius: number,
};

export type NormalizedOptions = Options & {
  container: HTMLElement,
  min: NonNullable<Options["min"]>,
};