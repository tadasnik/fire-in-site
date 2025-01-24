export function addMonth(dateToIncrement) {
  let incrementedDate = new Date(dateToIncrement);
  return incrementedDate.setMonth(incrementedDate.getMonth() + 1);
}

export function addYear(dateToIncrement) {
  let incrementedDate = new Date(dateToIncrement);
  return incrementedDate.setFullYear(incrementedDate.getFullYear() + 1);
}
export function subtractYear(dateToIncrement) {
  let incrementedDate = new Date(dateToIncrement);
  return incrementedDate.setFullYear(incrementedDate.getFullYear() - 1);
}

