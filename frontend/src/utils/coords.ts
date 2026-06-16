/**
 * Converts Latitude and Longitude to 3D Cartesian coordinates on a sphere.
 * 
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Sphere radius (default is 2)
 * @returns 3D vector coordinates [x, y, z]
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = 2
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return [x, y, z];
}
