import cookie from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('COC_AUTH_TOKEN', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  )
  res.status(200).json({ message: 'Logged out' })
}
