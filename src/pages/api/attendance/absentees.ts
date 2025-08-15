import { NextApiRequest, NextApiResponse } from 'next'
import { validateRoute } from '../../../../lib/auth'
import { client } from '../../../../lib/prisma'


export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  const currentYear = new Date().getFullYear()
  const today = new Date().getDate()
  const currentMonth = new Date().getMonth() + 1
  try {
    // Get paginated Attendance
    const { page = 1, per_page, year = currentYear, month = currentMonth, day = today, zone, searchParams } = req.query
    const searchStrings = searchParams ? (searchParams as string).toLowerCase() : ''
    const skip = parseInt(page as string) === 1 ? 0 : (parseInt(page as string) - 1) * parseInt(per_page as string)
    const offset = per_page ? parseInt(per_page as string) : 10
    let result = await client.attendance.findMany({
      where: {
        year: parseInt(year as string),
        month: month ? parseInt(month as string) : undefined,
        day: day ? parseInt(day as string) : undefined,
        member: {
          OR: [
            { firstname: { contains: searchStrings, mode: 'insensitive' } },
            { middlename: { contains: searchStrings, mode: 'insensitive' } },
            { lastname: { contains: searchStrings, mode: 'insensitive' } },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        member: {
          select: {
            zone: true,
            firstname: true,
            lastname: true,
            middlename: true,
            cardNo: true,
          },
        },
      },
    })

    const presentId = result.map(item => {
      return item.memberId
    })

    const absentMembers = await client.member.findMany({
      take: offset,
      skip,
      where: {
        id: {
          notIn: presentId,
        },
        zone: {
          name: zone ? (zone as string) : undefined,
        },
        OR: [
          { firstname: { contains: searchStrings, mode: 'insensitive' } },
          { middlename: { contains: searchStrings, mode: 'insensitive' } },
          { lastname: { contains: searchStrings, mode: 'insensitive' } },
        ],
      },
      select: {
        zone: true,
        firstname: true,
        lastname: true,
        middlename: true,
        cardNo: true,
        status: true,
        contactNo: true,
        address: true,
      },
    })

    if (absentMembers.length == 0 || result.length == 0) {
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
      where: {
        id: {
          notIn: presentId,
        },
        zone: {
          name: zone ? (zone as string) : undefined,
        },
        OR: [
          { firstname: { contains: searchStrings, mode: 'insensitive' } },
          { middlename: { contains: searchStrings, mode: 'insensitive' } },
          { lastname: { contains: searchStrings, mode: 'insensitive' } },
        ],
      },
    })
    const nextSkip = next === 1 ? 0 : (next - 1) * offset

    const nextPageAbsentMembers = await client.member.findMany({
      take: offset,
      skip: nextSkip,
      where: {
        id: {
          notIn: presentId,
        },
        zone: {
          name: zone ? (zone as string) : undefined,
        },
        OR: [
          { firstname: { contains: searchStrings, mode: 'insensitive' } },
          { middlename: { contains: searchStrings, mode: 'insensitive' } },
          { lastname: { contains: searchStrings, mode: 'insensitive' } },
        ],
      },
      select: {
        zone: true,
        firstname: true,
        lastname: true,
        middlename: true,
        cardNo: true,
      },
    })

    const data = {
      data: absentMembers,
      metaData: {
        hasNextPage: nextPageAbsentMembers.length > 0,
        total,
      },
    }
    return res.status(200).json(data)
  } catch (e) {
    res.json({ error: e.message })
  }
})
