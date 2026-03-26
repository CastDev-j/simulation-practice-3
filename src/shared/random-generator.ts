import type { SeedData } from "..";

interface TraficPacket {
  id: number;
  value: number;
  isMalicious: boolean;
}

export class RandomGenerator {
  private static MALICIOUS_PROBABILITY = 0.15;
  seed: number;
  initialValue: number;
  NumberOfRandoms: number;
  Increment: number;
  Modulus: number;
  Multiplier: number;

  values: number[] = [];
  normalizedValues: number[] = [];
  trafficPackets: TraficPacket[] = [];
  maliciousCount: number = 0;
  legitimateCount: number = 0;
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

    this.trafficPackets = this.generateMonteCarlo();
  }

  private generateMonteCarlo() {
    const packets = this.normalizedValues.map((val, i) => ({
      id: i + 1,
      value: val,
      isMalicious: val <= RandomGenerator.MALICIOUS_PROBABILITY,
    }));

    this.maliciousCount = packets.filter((p) => p.isMalicious).length;
    this.legitimateCount = packets.filter((p) => !p.isMalicious).length;

    return packets;
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
      MonteCarloDetails: {
        totalPackets: {
          amount: this.trafficPackets.length,
          percentage: 100,
        },
        maliciousCount: {
          amount: this.maliciousCount,
          percentage: (this.maliciousCount / this.trafficPackets.length) * 100,
        },
        legitimateCount: {
          amount: this.legitimateCount,
          percentage: (this.legitimateCount / this.trafficPackets.length) * 100,
        },
      },
      MonteCarloResults: this.trafficPackets,
      values: this.values,
      normalizedValues: this.normalizedValues,
    };
  }
}
