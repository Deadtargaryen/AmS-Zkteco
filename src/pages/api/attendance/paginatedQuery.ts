import { NextApiRequest, NextApiResponse } from 'next'
import { validateRoute } from '../../../../lib/auth'
import { client } from '../../../../lib/prisma'


export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  const currentYear = new Date().getFullYear()
  try {
    // Get paginated Attendance
    const { page = 1, per_page, year = currentYear, month, day, zone, searchParams } = req.query
    const searchStrings = searchParams ? (searchParams as string).toLowerCase() : ''
    const skip = parseInt(page as string) === 1 ? 0 : (parseInt(page as string) - 1) * parseInt(per_page as string)
    const offset = per_page ? parseInt(per_page as string) : 10
    let result = await client.attendance.findMany({
      take: offset,
      skip,
      where: {
        year: parseInt(year as string),
        month: month ? parseInt(month as string) : undefined,
        day: day ? parseInt(day as string) : undefined,
        member: {
          zone: {
            name: zone ? (zone as string) : undefined,
          },
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

    if (result.length == 0) {
      return res.status(200).json({
        data: [],
        metaData: {
          hasNextPage: false,
          total: 0,
        },
      })
    }

    const next = parseInt(page as string) + 1
    const total = await client.attendance.count({
      where: {
        year: parseInt(year as string),
        month: month ? parseInt(month as string) : undefined,
        day: day ? parseInt(day as string) : undefined,
        member: {
          zone: {
            name: zone ? (zone as string) : undefined,
          },
          OR: [
            { firstname: { contains: searchStrings, mode: 'insensitive' } },
            { middlename: { contains: searchStrings, mode: 'insensitive' } },
            { lastname: { contains: searchStrings, mode: 'insensitive' } },
          ],
        },
      },
    })
    const nextSkip = next === 1 ? 0 : (next - 1) * offset

    const nextPage = await client.attendance.findMany({
      // Same as before, limit the number of events returned by this query.
      where: {
        year: parseInt(year as string),
        month: month ? parseInt(month as string) : undefined,
        day: day ? parseInt(day as string) : undefined,
        member: {
          zone: {
            name: zone ? (zone as string) : undefined,
          },
          OR: [
            { firstname: { contains: searchStrings, mode: 'insensitive' } },
            { middlename: { contains: searchStrings, mode: 'insensitive' } },
            { lastname: { contains: searchStrings, mode: 'insensitive' } },
          ],
        },
      },
      take: offset,
      skip: nextSkip, // Do not include the cursor itself in the query result.
    })

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
