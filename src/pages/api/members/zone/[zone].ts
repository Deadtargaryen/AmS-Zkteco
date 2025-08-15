import type { NextApiResponse, NextApiRequest } from 'next'
import prismaError from '../../../../../lib/prismaError'
import { client } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { zone } = req.query
  try {
    const members = await client.zone.findMany({
      where: {
        name: zone as string,
      },
      include: {
        members: {
          select: {
            firstname: true,
            middlename: true,
            lastname: true,
            cardNo: true,
            address: true,
            gender: true,
            status: true,
            id: true,
            avatarUrl: false,
          },
        },
      },
    })
    res.status(200).json(members)
  } catch (e) {
    return prismaError(e, res)
  }
}
