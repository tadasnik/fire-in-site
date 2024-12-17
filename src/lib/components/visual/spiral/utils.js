/**
 * Converts polar coordinates to Cartesian coordinates.
 * @param {number} distance - Radial distance.
 * @param {number} angle - Angle in radians.
 * @returns {object} Cartesian coordinates { x, y }.
 */
export function cartesianFromPolarRad(distance, angle) {
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);
  return { x, y };
}

export function cartesianFromPolar(distance, angle) {
  const x = distance * Math.cos((angle * Math.PI) / 180);
  const y = distance * Math.sin((angle * Math.PI) / 180);
  return { x, y };
};

export function xFromPolar(distance, angle) {
  const x = distance * Math.cos((angle * Math.PI) / 180);
  return x;
};

export function yFromPolar(distance, angle) {
  const y = distance * Math.sin((angle * Math.PI) / 180);
  return y;
};

