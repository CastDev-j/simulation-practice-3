import { RandomGenerator } from "./shared/random-generator";

const INPUT = `${import.meta.dir}/files/input.json`;
const OUTPUT = `${import.meta.dir}/files/output.json`;

export interface SeedData {
  seed: number;
  initialValue: number;
  Multiplier: number;
  Increment: number;
  Modulus: number;
  NumberOfRandoms: number;
}

(async () => {
  try {
    const generator = new RandomGenerator(await Bun.file(INPUT).json());

    await Bun.file(OUTPUT).write(
      `${JSON.stringify(generator.getDetails(), null, 2)}\n`,
    );
    console.log(generator.getDetails());
  } catch (error) {
    console.error("Error reading or parsing file:", error);
  }
})();
