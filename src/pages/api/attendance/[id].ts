import type { NextApiResponse, NextApiRequest } from 'next'
import { validateRoute } from '../../../../lib/auth'
import { client } from '../../../../lib/prisma'
import prismaError from '../../../../lib/prismaError'


export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') {
    const { id } = req.query
    try {
      const attendance = await client.attendance.delete({
        where: {
          id: id as string,
        },
      })
      res.status(200).json(attendance)
    } catch (error) {
      return prismaError(error, res)
    }
  }
})
