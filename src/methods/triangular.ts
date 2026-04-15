import type { MethodInterface } from "./types";

export class TriangularDistribution implements MethodInterface {
  private MIN = 20;
  private MAX = 60;
  private MODE = 30;
  private TIME_UNIT = "minutos";
  private CUT_POINT = (this.MODE - this.MIN) / (this.MAX - this.MIN);
  name = "DISTRIBUCION TRIANGULAR";
  normalizedValues: number[];

  constructor(normalizedValues: number[]) {
    this.normalizedValues = normalizedValues;
  }

  getResults(): any[] {
    const range = this.MAX - this.MIN;

    const results = this.normalizedValues.map((value) => {
      if (value <= this.CUT_POINT) {
        return this.MIN + Math.sqrt(value * range * (this.MODE - this.MIN));
      }

      return this.MAX - Math.sqrt((1 - value) * range * (this.MAX - this.MODE));
    });

    return results.map(
      (value) => `${Number(value.toFixed(3))} ${this.TIME_UNIT}`,
    );
  }
}
