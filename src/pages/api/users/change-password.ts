import { getSession } from 'next-auth/react'

import bcrypt from 'bcrypt'
import { client } from '../../../../lib/prisma'
import { verifyPassword } from '../../../../lib/auth'
import prismaError from '../../../../lib/prismaError'


async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  const { oldPassword, newPassword, confirmPassword } = req.body
  const { name } = session.user

  const user = await client.user.findUnique({
    where: { name },
  })

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const isValid = await verifyPassword(oldPassword, user.password)

  if (!isValid) {
    return res.status(403).json({ message: 'Invalid password' })
  }

  const isEqual = newPassword === confirmPassword

    if (!isEqual) {
        return res.status(403).json({ message: 'Passwords do not match' })
    }

  const salt = await bcrypt.genSaltSync(10)
  const hashedPassword = await bcrypt.hashSync(newPassword, salt)

  try {
    const updatedUser = await client.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
    res.status(200).json(updatedUser)
  } catch (error) {
    return prismaError(error, res)
  }
}

export default handler
