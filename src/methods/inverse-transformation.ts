import type { MethodInterface } from "./types";

export class InverseTransformation implements MethodInterface {
  private TIME_PER_INSPECTION = 2;
  private LAMBDA = 1 / this.TIME_PER_INSPECTION;
  private TIME_UNIT = "minutos";
  private SANDING_MIN = 10;
  private SANDING_MAX = 16;
  name = "TRANSFORMACIÓN INVERSA";
  normalizedValues: number[];

  constructor(normalizedValues: number[]) {
    this.normalizedValues = normalizedValues;
  }

  getResults(): any {
    const inspectionResults = this.normalizedValues.map((value) =>
      value > 0 ? -(1 / this.LAMBDA) * Math.log(value) : 0,
    );

    const sandingResults = this.normalizedValues.map(
      (value) =>
        this.SANDING_MIN + value * (this.SANDING_MAX - this.SANDING_MIN),
    );

    return {
      values: inspectionResults.map(
        (inspection, index) =>
          `Inspección: ${Number(inspection.toFixed(2))} ${this.TIME_UNIT}, Lijado: ${Number(sandingResults[index]?.toFixed(2) ?? 0)} ${this.TIME_UNIT}`,
      ),
    };
  }
}
