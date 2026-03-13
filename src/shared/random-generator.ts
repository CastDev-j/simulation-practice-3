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

  mean: number;
  standardError: number;
  median: number;
  mode: number | number[];
  standardDeviation: number;
  sampleVariance: number;
  kurtosis: number;
  skewness: number;
  range: number;
  minimum: number;
  maximum: number;
  sum: number;
  count: number;
  largest: number;
  smallest: number;
  confidenceLevel: number;
  rootN: number;
  intervalSize: number;
  sumR: number;
  averageR: number;
  goodnessOfFitTest: number;
  tTest: number;
  varianceTest: number;

  frequencyTable: Array<{
    interval: string;
    lowerLimit: number;
    upperLimit: number;
    observedFrequency: number;
    relativeFrequency: number;
    cumulativeRelativeFrequency: number;
    expectedRelativeFrequency: number;
    absoluteDifference: number;
    expectedInterval: number;
    difference: number;
    squaredDifference: number;
    chiSquareContribution: number;
  }> = [];

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

    this.mean =
      this.values.reduce((sum, value) => sum + value, 0) / this.values.length;
    this.standardError = Math.sqrt(
      this.values.reduce(
        (sum, value) => sum + Math.pow(value - this.mean, 2),
        0,
      ) / this.values.length,
    );
    this.median = this.calculateMedian(this.values);
    this.mode = this.calculateMode(this.values);
    this.standardDeviation = Math.sqrt(
      this.values.reduce(
        (sum, value) => sum + Math.pow(value - this.mean, 2),
        0,
      ) /
        (this.values.length - 1),
    );
    this.sampleVariance = Math.pow(this.standardDeviation, 2);
    this.kurtosis = this.calculateKurtosis(
      this.values,
      this.mean,
      this.standardDeviation,
    );
    this.skewness = this.calculateSkewness(
      this.values,
      this.mean,
      this.standardDeviation,
    );
    this.range = Math.max(...this.values) - Math.min(...this.values);
    this.minimum = Math.min(...this.values);
    this.maximum = Math.max(...this.values);
    this.sum = this.values.reduce((sum, value) => sum + value, 0);
    this.count = this.values.length;
    this.largest = Math.max(...this.values);
    this.smallest = Math.min(...this.values);
    this.confidenceLevel = 0.95;
    this.rootN = Math.sqrt(this.values.length);
    this.intervalSize = (1.96 * this.standardDeviation) / this.rootN;
    this.sumR = this.normalizedValues.reduce((sum, value) => sum + value, 0);
    this.averageR = this.sumR / this.values.length;

    this.normalizedValuesMinusAverage = this.normalizedValues.map(
      (value) => value - this.averageR,
    );
    this.normalizedValuesMinusAverageSquared =
      this.normalizedValuesMinusAverage.map((value) => Math.pow(value, 2));

    this.frequencyTable = this.calculateFrequencyTable();
    this.goodnessOfFitTest = this.calculateGoodnessOfFitTest();
    this.tTest = this.calculateTTest();
    this.varianceTest = this.calculateVarianceTest();
  }

  private calculateVarianceTest(): number {
    const n = this.values.length;
    const sampleVariance =
      this.normalizedValuesMinusAverageSquared.reduce(
        (sum, value) => sum + value,
        0,
      ) /
      (n - 1);

    return ((n - 1) * sampleVariance) / Math.sqrt(1 / 12);
  }

  private calculateTTest(): number {
    const n = this.values.length;
    return Math.abs(((this.averageR - 0.5) * Math.sqrt(n)) / Math.sqrt(1 / 12));
  }

  private calculateGoodnessOfFitTest(): number {
    return this.frequencyTable.reduce(
      (sum, row) => sum + row.chiSquareContribution,
      0,
    );
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1]! + sorted[mid]!) / 2
      : sorted[mid]!;
  }

  private calculateMode(values: number[]): number | number[] {
    const frequency: Record<number, number> = {};
    values.forEach((value) => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const maxFrequency = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency)
      .filter((key) => frequency[Number(key)] === maxFrequency)
      .map(Number);

    return modes.length === 1 ? modes[0]! : modes;
  }

  private calculateKurtosis(
    values: number[],
    mean: number,
    standardDeviation: number,
  ): number {
    const n = values.length;
    const numerator = values.reduce(
      (sum, value) => sum + Math.pow(value - mean, 4),
      0,
    );
    const denominator = Math.pow(standardDeviation, 4) * (n - 1);
    return numerator / denominator - 3;
  }

  private calculateSkewness(
    values: number[],
    mean: number,
    standardDeviation: number,
  ): number {
    const n = values.length;
    const numerator = values.reduce(
      (sum, value) => sum + Math.pow(value - mean, 3),
      0,
    );
    const denominator = Math.pow(standardDeviation, 3) * (n - 1);
    return numerator / denominator;
  }
  private calculateFrequencyTable() {
    const intervals = Math.ceil(Math.sqrt(this.values.length));
    const intervalSize = (this.maximum - this.minimum) / intervals;
    const table = [];

    for (let i = 0; i < intervals; i++) {
      const lowerLimit = this.minimum + i * intervalSize;
      const upperLimit = lowerLimit + intervalSize;
      const observedFrequency = this.values.filter(
        (value) => value >= lowerLimit && value < upperLimit,
      ).length;

      const relativeFrequency = observedFrequency / this.values.length;
      const expectedRelativeFrequency = 1 / intervals;
      const expectedInterval = expectedRelativeFrequency * this.values.length;
      const absoluteDifference = Math.abs(observedFrequency - expectedInterval);
      const difference = observedFrequency - expectedInterval;
      const squaredDifference = Math.pow(difference, 2);
      const chiSquareContribution = squaredDifference / expectedInterval;

      table.push({
        interval: `${lowerLimit.toFixed(2)} - ${upperLimit.toFixed(2)}`,
        lowerLimit,
        upperLimit,
        observedFrequency,
        relativeFrequency,
        cumulativeRelativeFrequency: 0,
        expectedRelativeFrequency,
        absoluteDifference,
        expectedInterval,
        difference,
        squaredDifference,
        chiSquareContribution,
      });
    }

    let cumulativeRelativeFrequency = 0;
    table.forEach((row) => {
      cumulativeRelativeFrequency += row.relativeFrequency;
      row.cumulativeRelativeFrequency = cumulativeRelativeFrequency;
    });

    return table;
  }

  getDetails() {
    return {
      tests: {
        goodnessOfFitTest: this.goodnessOfFitTest,
        tTest: this.tTest,
        varianceTest: this.varianceTest,
      },
      seed: this.seed,
      initialValue: this.initialValue,
      Multiplier: this.Multiplier,
      Increment: this.Increment,
      uniqueValuesCount: this.uniqueValuesCount,
      NumberOfRandoms: this.NumberOfRandoms,
      Modulus: this.Modulus,
      frequencyTable: this.frequencyTable,
      extraDetails: {
        mean: this.mean,
        standardError: this.standardError,
        median: this.median,
        mode: this.mode,
        standardDeviation: this.standardDeviation,
        sampleVariance: this.sampleVariance,
        kurtosis: this.kurtosis,
        skewness: this.skewness,
        range: this.range,
        minimum: this.minimum,
        maximum: this.maximum,
        sum: this.sum,
        count: this.count,
        largest: this.largest,
        smallest: this.smallest,
        confidenceLevel: this.confidenceLevel,
        rootN: this.rootN,
        intervalSize: this.intervalSize,
        sumR: this.sumR,
        averageR: this.averageR,
      },
      values: this.values,
      normalizedValues: this.normalizedValues,
    };
  }
}
