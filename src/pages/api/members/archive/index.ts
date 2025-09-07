import { validateRoute } from '../../../../../lib/auth'
import { client } from '../../../../../lib/prisma'
import prismaError from '../../../../../lib/prismaError'

export default validateRoute(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const disfellowshipList = await client.member.findMany({
        where: { status: 'DISFELLOWSHIPPED' }, // adjust if your enum/string differs
        orderBy: { updatedAt: 'desc' }, // show latest first
        include: {
          zone: true, // fetch related zone so UI displays zone.name
        },
      })

      return res
        .status(200)
        .json(JSON.parse(JSON.stringify(disfellowshipList)))
    } catch (e) {
      console.error(e)
      return prismaError(e, res)
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
