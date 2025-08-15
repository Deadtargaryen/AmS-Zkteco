import { compare } from 'bcrypt'
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../src/pages/api/auth/[...nextauth]"

export const validateRoute = handler => {
  return async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    return handler(req, res, session)
  }
}

export async function verifyPassword(password, hashedPassword) {
  const isValid = await compare(password, hashedPassword)
  return isValid
}
