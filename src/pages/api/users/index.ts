import type { NextApiResponse, NextApiRequest } from 'next'
import bcrypt from 'bcrypt'
import { client } from '../../../../lib/prisma'
import { validateRoute } from '../../../../lib/auth'
import prismaError from '../../../../lib/prismaError'

export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const users = await client.user.findMany()
    res.json(users)
  } else if (req.method === 'POST') {
    let password = '123456'
    const { name, role, avatarUrl } = req.body
    if (!name || !role) {
      return res.status(422).json({ error: 'Missing name and/or role' })
    }

    const checkUser = await client.user.findFirst({
      where: {
        name,
      },
    })

    if (checkUser) {
      return res.status(401).json(`User ${checkUser.name} already exist` )
    }

    const salt = await bcrypt.genSalt()
    try {
      const user = await client.user.create({
        data: {
          name,
          password: bcrypt.hashSync(password, salt),
          role: role,
          avatarUrl,
        },
      })
      res.status(200).json(user)
    } catch (error) {
      return prismaError(error, res)
    }
  }
})
