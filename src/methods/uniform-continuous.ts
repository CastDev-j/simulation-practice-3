import type { MethodInterface } from "./types";

export class ContinuousUniformDistribution implements MethodInterface {
  private MIN = 10;
  private MAX = 25;
  private TIME_UNIT = "segundos";
  name = "DISTRIBUCION UNIFORME CONTINUA";
  normalizedValues: number[];

  constructor(normalizedValues: number[]) {
    this.normalizedValues = normalizedValues;
  }

  getResults(): any[] {
    const results = this.normalizedValues.map(
      (value) => this.MIN + (this.MAX - this.MIN) * value,
    );

    return results.map(
      (value) => `${Number(value.toFixed(3))} ${this.TIME_UNIT}`,
    );
  }
}
