import { InverseTransformation } from "./methods/inverse-transformation";
import { TriangularDistribution } from "./methods/triangular";
import { ContinuousUniformDistribution } from "./methods/uniform-continuous";
import { RandomGenerator } from "./shared/random-generator";

const INPUT = `src/files/input.json`;
const OUTPUT = `src/files/output.json`;

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
    const generator = new RandomGenerator(
      await Bun.file(INPUT).json(),
      InverseTransformation,
    );

    await Bun.file(OUTPUT).write(
      `${JSON.stringify(generator.getDetails(), null, 2)}\n`,
    );

    console.log(JSON.stringify(generator.getDetails(), null, 2));
  } catch (error) {
    console.error("Error reading or parsing file:", error);
  }
})();
