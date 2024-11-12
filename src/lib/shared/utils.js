export function fuelCodeFormat(textToBold) {
  const chars = textToBold.split("");
  if (textToBold.length === 2) {
    if (chars[0] !== "g") {
      return `<b>${chars[0].toUpperCase()}${chars[1].toUpperCase()}</b>`;
    } else {
      return `<b>${chars[0].toUpperCase()}</b>${chars[1]}`;
    }
  } else {
    return `<b>${chars[0].toUpperCase()}${chars[1].toUpperCase()}</b>${chars[2]}`;
  }
}
export function fuelRootCode(fuelCode) {
  const chars = fuelCode.split("");
  if (fuelCode.length === 2) {
    if (chars[0] !== "g") {
      return fuelCode.toLowerCase();
    } else {
      return chars[0].toLowerCase()
    }
  } else {
    return chars[0].toLowerCase() + chars[1].toLowerCase();
  }
}
