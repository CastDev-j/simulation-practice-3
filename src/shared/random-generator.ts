import type { SeedData } from "..";

export class RandomGenerator {
  seed: number;
  initialValue: number;
  NumberOfRandoms: number;
  Increment: number;
  Modulus: number;
  Multiplier: number;

  values: number[] = [];
  normalizedValues: number[] = [];
  normalizedValuesMinusAverage: number[] = [];
  normalizedValuesMinusAverageSquared: number[] = [];
  uniqueValuesCount: number = 0;

  constructor({
    seed,
    initialValue,
    NumberOfRandoms,
    Increment,
    Modulus,
    Multiplier,
  }: SeedData) {
    this.seed = seed;
    this.initialValue = initialValue;
    this.NumberOfRandoms = NumberOfRandoms;
    this.Increment = Increment;
    this.Modulus = Modulus;
    this.Multiplier = Multiplier;

    const a = BigInt(Multiplier);
    const c = BigInt(Increment);
    const m = BigInt(Modulus);
    const values: number[] = [];

    let current = (BigInt(seed) + BigInt(initialValue)) % m;

    for (let i = 0; i < NumberOfRandoms; i++) {
      current = (a * current + c) % m;
      values.push(Number(current));
    }

    this.values = values;
    this.normalizedValues = this.values.map((value) => value / Number(Modulus));

    const uniqueValues = new Set(this.values);
    this.uniqueValuesCount = uniqueValues.size;
  }

  getDetails() {
    return {
      seed: this.seed,
      initialValue: this.initialValue,
      Multiplier: this.Multiplier,
      Increment: this.Increment,
      uniqueValuesCount: this.uniqueValuesCount,
      NumberOfRandoms: this.NumberOfRandoms,
      Modulus: this.Modulus,
      values: this.values,
      normalizedValues: this.normalizedValues,
    };
  }
}
