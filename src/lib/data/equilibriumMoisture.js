const fuelSurfacTemp = [
  [32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
  [37, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64],
  [41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 60, 62, 64, 66, 68],
  [45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73],
  [49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77],
  [54, 56, 58, 60, 62, 64, 66, 68, 69, 71, 73, 75, 77, 79, 81],
  [58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86],
  [62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90],
  [67, 69, 71, 73, 75, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94],
  [71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99],
  [75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103],
  [80, 82, 84, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107],
  [84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 109, 111],
  [88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116],
  [93, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120],
  [97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 116, 118, 120, 122, 124],
  [101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129],
  [105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133],
  [110, 112, 114, 116, 118, 120, 122, 124, 125, 127, 129, 131, 133, 135, 137],
  [114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142],
  [118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146],
  [123, 125, 127, 129, 131, 133, 134, 136, 138, 140, 142, 144, 146, 148, 150],
  [127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153, 155],
  [131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153, 155, 157, 159]
];

const tempThresholds = [0, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 200]
const solarTherholds = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 2000]
const ceilToNearest = (value, increment) => Math.ceil(value / increment) * increment

const ceilToNearest = (value, increment) =>
  Math.ceil(value / increment) * increment;

const tempInd = (tempF) => tempF < 15 ? 0 : tempF > 120 ? 24 : tempThresholds.indexOf(ceilToNearest(tempf, 5))
const humInd = (solRad) => solRad < 100 ? 0 : solRad > 130 ? 14 : solarTherholds.indexOf(ceilToNearest(solRad, 100))

export function getFuelSurfTemp(temp, solRad) {
  const tempF = temp * 1.8 + 32
  return fuelSurfacTemp[tempInd(tempF)][humInd(solRad)]
}

const equilibriumMoistureContent = [
  [3, 5, 7, 8, 10, 11, 12, 13, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 28, 34],
  [3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25, 28, 34],
  [3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 19, 20, 21, 23, 25, 28, 34],
  [3, 4, 6, 7, 8, 10, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 33],
  [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 27, 33],
  [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 15, 16, 17, 19, 20, 22, 24, 27, 33],
  [2, 4, 5, 6, 8, 9, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 23, 26, 32],
  [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 26, 32],
  [2, 3, 5, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 15, 16, 17, 19, 20, 22, 26, 32],
  [2, 3, 5, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 25, 31],
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 14, 15, 17, 18, 19, 22, 25, 31],
  [2, 3, 4, 5, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 31],
  [2, 3, 4, 5, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 30],
  [1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 17, 18, 20, 23, 30],
  [1, 2, 4, 4, 5, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 23, 29],
  [1, 2, 3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 11, 12, 13, 14, 16, 17, 19, 22, 29],
  [1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 15, 17, 19, 22, 28],
  [1, 2, 3, 4, 5, 5, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 21, 28],
  [1, 2, 3, 4, 4, 5, 6, 7, 7, 8, 9, 9, 10, 11, 12, 13, 14, 16, 18, 21, 27],
  [1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 17, 20, 26],
  [1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 11, 12, 13, 15, 17, 20, 26],
  [1, 1, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 16, 19, 25],
  [1, 1, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 9, 10, 10, 11, 13, 14, 16, 19, 25],
  [1, 1, 2, 3, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 13, 15, 18, 24]
];


export function getFuelSurfTemp(temp, relHum) {
  const tempInd = Math

}
const dbIdx = Math.min(Math.max(0, Math.floor((db - 10) / 20)), 5);

