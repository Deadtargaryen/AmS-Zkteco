import type { NextApiResponse, NextApiRequest } from 'next'
import { client } from '../../../../lib/prisma'
import prismaError from '../../../../lib/prismaError'
import { getSession } from 'next-auth/react'
import getServerSession from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { Session, unstable_getServerSession } from 'next-auth'

type User = Session & { user?: { id?: string } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'GET') {
    try {
      const user = await client.user.findUnique({
        where: {
          id: id as string,
        },
      })
      res.status(200).json(user)
    } catch (e) {
      return prismaError(e, res)
    }
  } else if (req.method === 'DELETE') {
    try {
      const usersCount = await client.user.count()

      if (usersCount < 1) {
        return res.status(200).json({ error: 'Cannot delete last User' })
      }

      const session: User = await unstable_getServerSession(req, res, authOptions)

      const currentUser = await client.user.findFirst({
        where: {
          id: session.user.id,
        },
      })

      if (currentUser) {
        return res.status(400).json({ error: 'Cannot delete an active user.' })
      }

      const user = await client.user.delete({
        where: { id: id as string },
      })

      res.status(200).json(user)
    } catch (e) {
      return prismaError(e, res)
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    const { name, password, role, avatarUrl } = req.body
    
    

    try {
      let user = await client.user.findUnique({
        where: {
          id: id as string,
        },
      })
      if(!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      const result = await client.user.update({
        where: { id: id as string },
        data: {
          name: name || user.name,
          password: password || user.password,
          role: role || user.role,
          avatarUrl: avatarUrl || user.avatarUrl,
        },
      })
      res.status(200).json(result)
    } catch (e) {
      return prismaError(e, res)
    }
  }
}
