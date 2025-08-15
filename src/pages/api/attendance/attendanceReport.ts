import { NextApiRequest, NextApiResponse } from 'next'
import { validateRoute } from '../../../../lib/auth'
import { client } from '../../../../lib/prisma'


export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Fetch data from your database using Prisma
    const currentYear = new Date().getFullYear()
    const { page = 1, per_page=10, year = currentYear, month, searchParams } = req.query
    const searchStrings = searchParams ? (searchParams as string).toLowerCase() : ''
    const skip = parseInt(page as string) === 1 ? 0 : (parseInt(page as string) - 1) * parseInt(per_page as string)
    const offset = per_page ? parseInt(per_page as string) : 10
    const members = await client.member.findMany({
      take: offset,
      skip,
      select: {
        firstname: true,
        lastname: true,
        middlename: true,
        cardNo: true,
        attendance: {
          where: {
            year: parseInt(year as string),
            month: month ? parseInt(month as string) : undefined,
          },
        },
      },
      where: {
        OR: [
          { firstname: { contains: searchStrings, mode: 'insensitive' } },
          { middlename: { contains: searchStrings, mode: 'insensitive' } },
          { lastname: { contains: searchStrings, mode: 'insensitive' } },
        ],
      },
    })
    if (members.length == 0) {
      return res.status(200).json({
        data: [],
        metaData: {
          hasNextPage: false,
          total: 0,
        },
      })
    }

    const next = parseInt(page as string) + 1
    const total = await client.member.count({
      skip,
      where: {
        OR: [
          { firstname: { contains: searchStrings, mode: 'insensitive' } },
          { middlename: { contains: searchStrings, mode: 'insensitive' } },
          { lastname: { contains: searchStrings, mode: 'insensitive' } },
        ],
      },
    })
    const nextSkip = next === 1 ? 0 : (next - 1) * offset
    const nextPage = await client.member.findMany({
      take: offset,
      skip: nextSkip,
      where: {
        OR: [
          { firstname: { contains: searchStrings, mode: 'insensitive' } },
          { middlename: { contains: searchStrings, mode: 'insensitive' } },
          { lastname: { contains: searchStrings, mode: 'insensitive' } },
        ],
      },
    })

    // Process the data to calculate total attendance
    const result = members.map(member => {
      const totalSundayAttendance = member.attendance.filter(record => {
        return new Date(record.date).getDay() === 0
      }).length

      const totalMondayAttendance = member.attendance.filter(record => {
        return new Date(record.date).getDay() === 1
      }).length

      const totalWednesdayAttendance = member.attendance.filter(record => {
        return new Date(record.date).getDay() === 3
      }).length

      const totalFridayAttendance = member.attendance.filter(record => {
        return new Date(record.date).getDay() === 5
      }).length

      const totalAttendance = totalSundayAttendance + totalMondayAttendance + totalWednesdayAttendance + totalFridayAttendance

      return {
        name: `${member.firstname} ${member.middlename} ${member.lastname}`,
        cardNo: member.cardNo,
        totalSundayAttendance,
        totalMondayAttendance,
        totalWednesdayAttendance,
        totalFridayAttendance,
        totalAttendance
      }
    })

    // Respond with the formatted data
    const data = {
      data: result,
      metaData: {
        hasNextPage: nextPage.length > 0,
        total,
      },
    }
    return res.status(200).json(data)
  } catch (e) {
    res.json({ error: e.message })
  }
})
