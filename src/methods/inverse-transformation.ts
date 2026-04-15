import type { MethodInterface } from "./types";

export class InverseTransformation implements MethodInterface {
  private TIME_PER_CLIENT = 5;
  private LAMBDA = 1 / this.TIME_PER_CLIENT;
  private TIME_UNIT = "minutos";
  name = "TRANSFORMACIÓN INVERSA";
  normalizedValues: number[];

  constructor(normalizedValues: number[]) {
    this.normalizedValues = normalizedValues;
  }

  getResults(): any[] {
    const results = this.normalizedValues.map((value) =>
      value > 0 ? -(1 / this.LAMBDA) * Math.log(value) : 0,
    );

    return results.map(
      (value) => `${Number(value.toFixed(2))} ${this.TIME_UNIT}`,
    );
  }
}
