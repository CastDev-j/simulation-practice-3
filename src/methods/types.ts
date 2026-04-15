export interface MethodInterface {
  name: string;
  getResults(): any[];
}

export type MethodConstructor = new (
  normalizedValues: number[],
) => MethodInterface;
