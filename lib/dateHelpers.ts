import moment from 'moment'

const getDayWeekNumber = day => {
  let x = 0
  switch (day) {
    case 'Sunday':
      x = 1
      break
    case 'Monday':
      x = 2
      break
    case 'Tuesday':
      x = 3
      break
    case 'Wednesday':
      x = 4
      break
    case 'Thursday':
      x = 5
      break
    case 'Friday':
      x = 6
      break
    case 'Saturday':
      x = 7
      break
    default:
      break
  }
  return x
}
const getFirstDay = (month, day) => {
  const firstDayInMonth = moment().month(month).startOf('month').format('dddd')
  const dayWeekNumber = getDayWeekNumber(day)
  const dayDate = moment().month(month).startOf('month').day() + 1
  let firstDay = ''
  if (firstDayInMonth === 'Sunday') {
    return dayWeekNumber
  } else if (firstDayInMonth === 'Monday') {
    if (day === 'Monday') {
      return 1
    } else if (dayDate < dayWeekNumber) {
      return dayWeekNumber - 1
    } else {
      return dayWeekNumber + 6
    }
  } else if (firstDayInMonth === 'Tuesday') {
    if (day === 'Tuesday') {
      return 1
    } else if (dayDate < dayWeekNumber) {
      return dayWeekNumber - 2
    } else {
      return dayWeekNumber + 5
    }
  } else if (firstDayInMonth === 'Wednesday') {
    if (day === 'Wednesday') {
      return 1
    } else if (dayDate < dayWeekNumber) {
      return dayWeekNumber - 3
    } else {
      return dayWeekNumber + 4
    }
  } else if (firstDayInMonth === 'Thursday') {
    if (day === 'Thursday') {
      return 1
    } else if (dayDate < dayWeekNumber) {
      return dayWeekNumber - 4
    } else {
      return dayWeekNumber + 3
    }
  } else if (firstDayInMonth === 'Friday') {
    if (day === 'Friday') {
      return 1
    } else if (dayDate < dayWeekNumber) {
      return dayWeekNumber - 5
    } else {
      return dayWeekNumber + 2
    }
  } else if (firstDayInMonth === 'Saturday') {
    if (day === 'Saturday') {
      return 1
    } else if (dayDate < dayWeekNumber) {
      return dayWeekNumber - 6
    } else {
      return dayWeekNumber + 1
    }
  }
}
const getSpecificDaysInMonth = (month, day) => {
  const firstDay =getFirstDay(month, day)
  const endOfMonth = moment().month(month).endOf('month').date()
  let dates = []
  for (let x = firstDay; x <= endOfMonth; x += 7) {
    dates.push(x)
  }
  return dates
}
export function getSpecificDaysInYear(day: string) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const year = []
  const formattedDates = []
  for (let x = 0; x < months.length; x++) {
    let thisMonth = getSpecificDaysInMonth(months[x], day)
    year.push(thisMonth)
  }
  year.forEach((element, index) => {
    element.forEach(x => {
      formattedDates.push(moment().month(index).date(x).format('LL'))
    })
  })
  return formattedDates
}
export function getDayTotalInYear(day) {
  return getSpecificDaysInYear(day).length
}

export function getLastSunday() {
  const lastSunday = moment().day(0)
  return lastSunday.format('LL')
}
