import { readable, writable, derived, get } from 'svelte/store'
import { timeFormat } from 'd3-time-format'

Date.prototype.subtractDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() - days);
  return date;
}
export const currentDate = readable(new Date().subtractDays(6))

export const currentYear = derived([currentDate], ([$currentDate]) => {
  return $currentDate.getFullYear()
})


export const historicalYear = writable()
export const historicalMonth = writable()
export const historicalDay = writable()


export function getDateString(date) {
  return timeFormat('%Y-%m-%d')(date)
}
export function differenceHours(date1, date2) {
  return (date1 - date2) / 3600000
};

export function getRoundedDate() {
  return new Date(3600000 * (Math.round(Date.now() / 3600000)))
};

export function getMonth(date) {
  return date.getMonth() + 1
}

export function getHour(date) {
  return date.getHours() + 1
}
export const currentDateTime = writable(
  new Date()
)

export const dateString = derived(currentDateTime, ($currentDateTime) => {
  return timeFormat('%Y-%m-%d')($currentDateTime)
})

export const timeMode = writable('user')

export const dateTime = derived(
  currentDateTime, ($currentDateTime) => {
    return 3600000 * (Math.round($currentDateTime / 3600000))
  }
)

export const focusDay = derived([currentDateTime], ([$currentDateTime]) => {
  const focusDate = new Date(
    $currentDateTime.getFullYear(),
    $currentDateTime.getMonth(),
    $currentDateTime.getDate(),
  ).setHours(0, 0, 0)

  return focusDate
  // return 3600000 * (Math.round(focusDate / 3600000))
})

export const month = derived(
  [currentDateTime],
  ([$currentDateTime]) => {
    return $currentDateTime.getMonth() + 1;
  })

export const hour = derived(
  [currentDateTime],
  ([$currentDateTime]) => {
    return $currentDateTime.getHours() + 1;

  })



export const yearsOptions = derived([currentYear], ([$currentYear]) => {
  let years = [];
  for (let year = 1970; year < $currentYear + 1; year++) {
    years.push({ value: year, name: String(year) });
  }
  return years;
})

export const monthOptions = derived([historicalYear], ([$historicalYear]) => {
  if (!$historicalYear) {
    return false
  } else {
    let months = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthNames.forEach((month, i) => {
      months.push({ value: i + 1, name: month });
    })
    if ($historicalYear === get(currentYear)) {
      return months.slice(0, get(currentDate).getMonth() + 1)
    } else {
      return months
    }
  }
})

export const dayOptions = derived([historicalYear, historicalMonth], ([$historicalYear, $historicalMonth]) => {
  const daysInHistoryMonth = new Date(
    $historicalYear,
    $historicalMonth - 1,
    0,
  ).getDate();

  const days = Array.from({ length: daysInHistoryMonth }, (_, i) => i + 1);
  const daysOb = days.map((day) => {
    return { value: day, name: day };
  });

  if ($historicalYear === get(currentYear) && $historicalMonth === get(currentDate).getMonth() + 1) {
    return daysOb.slice(0, get(currentDate).getDate())
  } else {
    return daysOb
  }
})


export const historicalDate = derived([historicalYear, historicalMonth, historicalDay], ([$historicalYear, $historicalMonth, $historicalDay]) => {
  if (isNaN($historicalYear) || isNaN($historicalMonth) || isNaN($historicalDay)) {
    console.log('invalid date')
    return false
  } else {
    const histDate = new Date($historicalYear, $historicalMonth - 1, $historicalDay, 12, 0)
    if (histDate < new Date(1970, 0, 1, 12, 0)) {
      return false
    } else if (histDate > new Date()) {
      console.log(histDate, new Date())
      console.log('future date')
      return false
    } else {
      return histDate
    }
  }
})
