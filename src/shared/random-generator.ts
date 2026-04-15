import type { SeedData } from "..";
import type { MethodConstructor, MethodInterface } from "../methods/types";

export class RandomGenerator {
  seed: number;
  initialValue: number;
  NumberOfRandoms: number;
  Increment: number;
  Modulus: number;
  Multiplier: number;

  values: number[] = [];
  normalizedValues: number[] = [];
  uniqueValuesCount: number = 0;

  methods: MethodInterface[] = [];

  constructor(
    {
      seed,
      initialValue,
      NumberOfRandoms,
      Increment,
      Modulus,
      Multiplier,
    }: SeedData,
    ...methods: MethodConstructor[]
  ) {
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
    this.methods = methods.map((Method) => new Method(this.normalizedValues));

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
      average:
        this.values.reduce((sum, value) => sum + value, 0) / this.values.length,
      methods: this.methods.map((method) => ({
        name: method.name,
        results: method.getResults(),
      })),
      values: this.values,
      normalizedValues: this.normalizedValues,
    };
  }
}
