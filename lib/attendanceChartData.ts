import moment from 'moment'
import { useGetAttendanceQuery } from '../redux/store/api'
interface Member {
  id: string
  name: string
  zone: Record<string, unknown>
  cardNo: number
  attendance: Record<string, unknown>[]
  gender: string
  contactNo: string
  email: string
  address: string
  dateOfBirth?: Date
  dateOfBaptism?: Date
  placeOfBirth: string
  occupation: string
  maritalStatus: string
}
interface Attendance {
  attendance: []
  stats: {
    percentMonthAttendanceFemale: Number
    percentMonthAttendanceMale: Number
  }
}
export interface Stats {
  perMonthAttendanceTotalMale: number
  perMonthAttendanceTotalFemale: Number
  avgMonthAttendance: number | string
  avgYearAttendance : number | string
}
export default function data(sortby: string, stats: Stats) {
  if (sortby === 'Monthly') {
    return {
      options: {
        chart: {
          id: 'basic-bar',
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        fill: {
          colors: ['#4299E1', '#68D391', '#086F83'],
        },
      },
      series: [
        {
          name: 'Male percentage',
          data: stats?.perMonthAttendanceTotalMale,
        },
        {
          name: 'Female percentage',
          data: stats?.perMonthAttendanceTotalFemale,
        },
      ],
    }
  } else if (sortby === 'Quarterly') {
    const quarters = {
      Q1: [0, 1, 2],
      Q2: [3, 4, 5],
      Q3: [6, 7, 8],
      Q4: [9, 10, 11],
    }
    let maleAttendance = []
    let femaleAttendance = []
    Object.keys(quarters).forEach(quarter => {
      const menAttendanceFrequency = quarters[quarter].map(month => {
        return stats.perMonthAttendanceTotalMale[month]
      })
      const femaleAttendanceFrequency = quarters[quarter].map(month => {
        return stats.perMonthAttendanceTotalFemale[month]
      })

      maleAttendance.push(menAttendanceFrequency.reduce((a, b) => a + b, 0))
      femaleAttendance.push(femaleAttendanceFrequency.reduce((a, b) => a + b, 0))
    })

    return {
      options: {
        chart: {
          id: 'basic-bar',
        },
        xaxis: {
          categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        },
        fill: {
          colors: ['#2C5282', '#68D391', '#086F83'],
        },
      },
      series: [
        {
          name: 'Male',
          data: maleAttendance,
        },
        {
          name: 'Female',
          data: femaleAttendance,
        },
      ],
    }
  }
}
