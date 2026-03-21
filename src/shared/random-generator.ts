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
  runTest: number;
  pokerTest: number;
  seriesTest: number;

  runTestDetails: {
    b: number;
    mb: number;
    variance: number;
    z: number;
    rejectNullHypothesis: boolean;
  };

  pokerTestDetails: {
    handProbabilities: Record<string, number>;
    observedFrequencies: Record<string, number>;
    expectedFrequencies: Record<string, number>;
    groupedExpectedThreshold: number;
    groupedCategories: string[];
    effectiveObservedFrequencies: Record<string, number>;
    effectiveExpectedFrequencies: Record<string, number>;
    chiSquare: number;
    degreesOfFreedom: number;
  };

  seriesTestDetails: {
    k: number;
    totalIntervals: number;
    expectedFrequency: number;
    observedFrequencies: number[];
    chiSquare: number;
    degreesOfFreedom: number;
  };

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
    this.runTestDetails = {
      b: 0,
      mb: 0,
      variance: 0,
      z: 0,
      rejectNullHypothesis: false,
    };
    this.pokerTestDetails = {
      handProbabilities: {},
      observedFrequencies: {},
      expectedFrequencies: {},
      groupedExpectedThreshold: 5,
      groupedCategories: [],
      effectiveObservedFrequencies: {},
      effectiveExpectedFrequencies: {},
      chiSquare: 0,
      degreesOfFreedom: 0,
    };
    this.seriesTestDetails = {
      k: 0,
      totalIntervals: 0,
      expectedFrequency: 0,
      observedFrequencies: [],
      chiSquare: 0,
      degreesOfFreedom: 0,
    };
    this.runTest = this.calculateRunTest();
    this.pokerTest = this.calculatePokerTest();
    this.seriesTest = this.calculateSeriesTest();
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

  private calculateRunTest(): number {
    const n = this.values.length;
    if (n < 2) {
      this.runTestDetails = {
        b: 0,
        mb: 0,
        variance: 0,
        z: 0,
        rejectNullHypothesis: false,
      };
      return 0;
    }

    const signs: ("+" | "-")[] = [];
    for (let i = 0; i < n - 1; i++) {
      signs.push(this.values[i]! < this.values[i + 1]! ? "+" : "-");
    }

    let b = 1;
    for (let i = 1; i < signs.length; i++) {
      if (signs[i] !== signs[i - 1]) {
        b += 1;
      }
    }

    const mb = (2 * n - 1) / 3;
    const variance = (16 * n - 29) / 90;
    const z = variance > 0 ? (b - mb) / Math.sqrt(variance) : 0;
    const rejectNullHypothesis = z > 1.96;

    this.runTestDetails = {
      b,
      mb,
      variance,
      z,
      rejectNullHypothesis,
    };

    return z;
  }

  private classifyPokerHand(digits: string[]): string {
    const counts: Record<string, number> = {};

    digits.forEach((digit) => {
      counts[digit] = (counts[digit] || 0) + 1;
    });

    const pattern = Object.values(counts).sort((a, b) => b - a);

    if (pattern[0] === 5) return "fiveOfAKind";
    if (pattern[0] === 4) return "poker";
    if (pattern[0] === 3 && pattern[1] === 1) return "threeOfAKind";
    if (pattern[0] === 2 && pattern[1] === 2) return "twoPairs";
    if (pattern[0] === 2) return "onePair";
    return "allDifferent";
  }

  private calculatePokerTest(): number {
    const handProbabilities: Record<string, number> = {
      onePair: 0.504,
      twoPairs: 0.108,
      threeOfAKind: 0.072,
      poker: 0.009,
      fiveOfAKind: 0.0001,
      allDifferent: 0.3069,
    };

    const categories = Object.keys(handProbabilities);
    const observedFrequencies = categories.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      {},
    );

    const totalHands = this.normalizedValues.length;

    this.normalizedValues.forEach((value) => {
      const fiveDigits = Math.floor(value * 100000)
        .toString()
        .padStart(5, "0")
        .slice(-5)
        .split("");

      const handType = this.classifyPokerHand(fiveDigits);
      // @ts-expect-error
      observedFrequencies[handType] += 1;
    });

    const expectedFrequencies = categories.reduce<Record<string, number>>(
      (acc, category) => {
        acc[category] = handProbabilities[category]! * totalHands;
        return acc;
      },
      {},
    );

    const groupedExpectedThreshold = 5;
    const groupedCategories = categories.filter(
      (category) => expectedFrequencies[category]! < groupedExpectedThreshold,
    );

    const effectiveObservedFrequencies: Record<string, number> = {};
    const effectiveExpectedFrequencies: Record<string, number> = {};

    let groupedObserved = 0;
    let groupedExpected = 0;

    categories.forEach((category) => {
      if (groupedCategories.includes(category)) {
        groupedObserved += observedFrequencies[category]!;
        groupedExpected += expectedFrequencies[category]!;
        return;
      }

      effectiveObservedFrequencies[category] = observedFrequencies[category]!;
      effectiveExpectedFrequencies[category] = expectedFrequencies[category]!;
    });

    if (groupedCategories.length > 0) {
      effectiveObservedFrequencies.grouped = groupedObserved;
      effectiveExpectedFrequencies.grouped = groupedExpected;
    }

    const effectiveCategories = Object.keys(effectiveObservedFrequencies);
    const chiSquare = effectiveCategories.reduce((sum, category) => {
      const observed = effectiveObservedFrequencies[category]!;
      const expected = effectiveExpectedFrequencies[category]!;
      if (expected <= 0) return sum;
      return sum + Math.pow(observed - expected, 2) / expected;
    }, 0);

    const degreesOfFreedom = Math.max(effectiveCategories.length - 1, 0);

    this.pokerTestDetails = {
      handProbabilities,
      observedFrequencies,
      expectedFrequencies,
      groupedExpectedThreshold,
      groupedCategories,
      effectiveObservedFrequencies,
      effectiveExpectedFrequencies,
      chiSquare,
      degreesOfFreedom,
    };

    return chiSquare;
  }

  private calculateSeriesTest(): number {
    const n = this.normalizedValues.length;
    if (n < 2) {
      this.seriesTestDetails = {
        k: 0,
        totalIntervals: 0,
        expectedFrequency: 0,
        observedFrequencies: [],
        chiSquare: 0,
        degreesOfFreedom: 0,
      };
      return 0;
    }

    const k = Math.max(Math.floor(Math.sqrt(n)), 1);
    const totalIntervals = k * k;
    const observedFrequencies = new Array(totalIntervals).fill(0);

    for (let i = 0; i < n - 1; i++) {
      const x = this.normalizedValues[i]!;
      const y = this.normalizedValues[i + 1]!;
      const xIndex = Math.min(Math.floor(x * k), k - 1);
      const yIndex = Math.min(Math.floor(y * k), k - 1);
      const index = xIndex * k + yIndex;
      observedFrequencies[index] += 1;
    }

    const expectedFrequency = (n - 1) / totalIntervals;
    const chiSquare = observedFrequencies.reduce((sum, observed) => {
      if (expectedFrequency <= 0) return sum;
      return (
        sum + Math.pow(observed - expectedFrequency, 2) / expectedFrequency
      );
    }, 0);

    const degreesOfFreedom = Math.max(totalIntervals - 1, 0);

    this.seriesTestDetails = {
      k,
      totalIntervals,
      expectedFrequency,
      observedFrequencies,
      chiSquare,
      degreesOfFreedom,
    };

    return chiSquare;
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
        runTest: this.runTest,
        pokerTest: this.pokerTest,
        seriesTest: this.seriesTest,
      },
      statisticalTestsDetails: {
        runTest: this.runTestDetails,
        pokerTest: this.pokerTestDetails,
        seriesTest: this.seriesTestDetails,
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
