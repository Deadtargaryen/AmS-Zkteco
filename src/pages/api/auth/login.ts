import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { client as prisma } from '../../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library'

export default  async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { name, password } = req.body
  if(!name || !password) {
    return res.status(422).json({ message: 'Missing name and/or password' })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { name },
    })
  
    if (user && user.password === password) {
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          time: Date.now(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      )
  
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('COC_AUTH_TOKEN', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60,
          path: '/',
        })
      )
  
  
      res.status(200).json({ data: user })
    } else {
      res.status(400).json({ error: 'Invalid username or password' })
      console.log("username", name)
      console.log("password", password)
    }
  } catch (error) {
    if(error instanceof PrismaClientInitializationError) {
      res.status(500).json({ error: 'Error connecting to database! Ensure you are connected to a network' })
    } else {
      console.log(error)
      res.status(500).json({ error: 'An error occured' })
    }
  }
}
