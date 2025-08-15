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

    const totalMembers = await client.member.count()
    const maleMembers = await client.member.count({ where: { gender: 'MALE' } })
    const femaleMembers = await client.member.count({ where: { gender: 'FEMALE' } })
    const activeMembers = await client.member.count({ where: { status: 'ACTIVE' } })

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

    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const perMonthAttendanceTotalFemale = await Promise.all(
      months.map(async month => {
        const result = await client.attendance.count({
          where: {
            year: new Date().getFullYear(),
            month,
            member: { gender: 'FEMALE' },
          },
        })
        return Math.floor((result / ((await attendanceDatesInMonth(month)) * femaleMembers)) * 100)
      })
    )

    const perMonthAttendanceTotalMale = await Promise.all(
      months.map(async month => {
        const result = await client.attendance.count({
          where: {
            year: new Date().getFullYear(),
            month,
            member: { gender: 'MALE' },
          },
        })
        return Math.floor((result / ((await attendanceDatesInMonth(month)) * maleMembers)) * 100)
      })
    )

    res.status(200).json({ attendance, stats: { perMonthAttendanceTotalFemale, perMonthAttendanceTotalMale } })
  } 
  else if (req.method === 'POST') {
    try {
      let { id, user_id, date, timestamp } = req.body

      // If coming from MB460 polling script, user_id will be present
      if (user_id && !id) {
        const member = await client.member.findFirst({
          where: { cardNo: parseInt(user_id) }, // Using cardNo to match MB460 user ID
        })

        if (!member) {
          return res.status(404).json({ message: `No member found for device user_id ${user_id}` })
        }

        id = member.id
      }

      if (!date && timestamp) {
        date = new Date(timestamp).toISOString()
      } else if (!date) {
        date = new Date().toISOString()
      }

      if (!id || !date) {
        return res.status(400).json({ message: 'Invalid Member or date' })
      }

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
          message: `Duplicate! ${check.member.firstname} ${check.member.lastname}'s Attendance Already Marked For ${new Date(check.date).toLocaleDateString()}`,
        })
      }

      const attendance = await client.attendance.create({
        data: {
          date,
          member: { connect: { id } },
          year: new Date(date).getFullYear(),
          month: new Date(date).getMonth() + 1,
          day: new Date(date).getDate(),
        },
      })

      return res.status(200).json({ message: `New Attendance Added.`, attendance })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'An error occurred', error })
    }
  }
})
