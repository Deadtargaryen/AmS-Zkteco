import type { NextApiResponse, NextApiRequest } from 'next'
import { client } from '../../../../lib/prisma'
import prismaError from '../../../../lib/prismaError'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query
    try {
      const timeline = await client.timeline.delete({
        where: {
          id,
        },
      })
      res.json(timeline)
    } catch (error) {
      res.json(prismaError(error, res))
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query
    const {
      member,
      title,
      description,
      date,
    } = req.body
    try {
      const timeline = await client.timeline.update({
        where: {
          id,
        },
        data: {
          member: {
            connect: {
              id: member,
            },
          },
          title,
          description,
          date,
        },
      })
      res.json(timeline)
    } catch (error) {
      res.json(prismaError(error, res))
    }
  }
}
