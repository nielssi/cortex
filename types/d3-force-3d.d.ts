declare module "d3-force-3d" {
  export function forceCollide(radius?: number): {
    radius(r: number | ((node: unknown) => number)): this;
    strength(s: number): this;
    iterations(i: number): this;
  };
}
