import type { NextApiResponse, NextApiRequest } from 'next'
import { validateRoute } from '../../../../lib/auth'
import { client } from '../../../../lib/prisma'


export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const attendance = await client.attendance.findMany({
      include: {
        member: {
          include: {
            zone: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    

    // Get attendance statistics for year
    const attendanceStat = await client.attendance.groupBy({
      by: ['memberId'],
      where: {
        year: new Date().getFullYear(),
      },
      _count: { memberId: true },
      orderBy: {
        _count: {
          memberId: 'desc',
        },
      },
      take: 5,
    })

    const getMember = async id => {
      const member = await client.member.findUnique({
        where: {
          id: id,
        },
      })
      return `${member.firstname} ${member.lastname}`
    }
    const stats = await Promise.all(
      attendanceStat.map(async item => {
        return { count: item._count.memberId, name: await getMember(item.memberId) }
      })
    )

    //GET TOTAL MEMBERS
    const totalMembers = await client.member.count()

    //GET TOTAL MALE MEMBERS
    const maleMembers = await client.member.count({
      where: {
        gender: 'MALE',
      },
    })

    //GET TOTAL FEMALE MEMBERS
    const femaleMembers = await client.member.count({
      where: {
        gender: 'FEMALE',
      },
    })

    //GET ACTIVE MEMBERS
    const activeMembers = await client.member.count({
      where: {
        status: 'ACTIVE',
      },
    })

    // GET TOTAL NUMBER OF DAYS ATTENDANCE TAKE IN MONTH
    const attendanceDatesInMonth = async month => {
      const result = await client.attendance.groupBy({
        by: ['date'],
        where: {
          month,
          year: new Date().getFullYear(),
        },
        _count: { date: true },
      })
      return result.length
    }

    //GET ATTENDANCE PERCENTAGE DATA FOR MONTHS OF THE YEAR IN FEMALE CATEGORY
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const perMonthAttendanceTotalFemale = await Promise.all(
      months.map(async month => {
        const result = await client.attendance.count({
          where: {
            year: new Date().getFullYear(),
            month,
            member: {
              gender: 'FEMALE',
            },
          },
        })
        const percentMonthAttendanceFemale = Math.floor((result / ((await attendanceDatesInMonth(month)) * femaleMembers)) * 100)
        return percentMonthAttendanceFemale
      })
    )

    //GET ATTENDANCE PERCENTAGE DATA FOR MONTHS OF THE YEAR IN MALE CATEGORY
    const perMonthAttendanceTotalMale = await Promise.all(
      months.map(async month => {
        const result = await client.attendance.count({
          where: {
            year: new Date().getFullYear(),
            month,
            member: {
              gender: 'MALE',
            },
          },
        })
        const percentMonthAttendanceMale = Math.floor((result / ((await attendanceDatesInMonth(month)) * maleMembers)) * 100)
        return percentMonthAttendanceMale
      })
    )

    res.status(200).json({ attendance, stats: { perMonthAttendanceTotalFemale, perMonthAttendanceTotalMale } })
  } else if (req.method === 'POST') {
    const { id, date } = req.body
    try {
      // CHECK IF ID AND DATE EXISTS
      if (!id || !date) {
        return res.status(400).json({ message: 'Invalid Member. Please Select a Member.' })
      }
      // CHECK IF ATTENDANCE ALREADY EXIST
      const check = await client.attendance.findFirst({
        where: {
          memberId: id,
          day: new Date(date).getDate(),
        },
        include: {
          member: {
            select: { firstname: true, lastname: true },
          },
        },
      })
      if (check) {
        return res.status(400).json({
          message: `Duplicate! ${check.member.firstname} ${check.member.lastname}'s Attendance Already Marked For ${new Date(
            check.date
          ).toLocaleDateString()}`,
        })
      }
      const attendance = await client.attendance.create({
        data: {
          date,
          member: {
            connect: {
              id,
            },
          },
          year: new Date(date).getFullYear(),
          month: new Date(date).getMonth() + 1,
          day: new Date(date).getDate(),
        },
      })
      if (attendance) {
        return res.status(200).json({ message: `New Attendance Added.` })
      }
    } catch (error) {
      console.log(error)
      return res.status(401).json({ message: 'An error occured' })
    }
  }
})
