import NextAuth from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'
import { verifyPassword } from '../../../../lib/auth'
import { client } from '../../../../lib/prisma'
import { PrismaClientInitializationError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/library'

type User = {
  id: string
  name: string
  role: string
  avatarUrl?: string
}

export const authOptions ={
  session: {
    jwt: true,
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
    CredentialProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials, req) {
        let user
        const { name, password } = credentials as { name: string; password: string }
        try {
          user = await client.user.findUnique({
            where: { name },
          })
        } catch (error) {
          if (error instanceof PrismaClientInitializationError || error instanceof PrismaClientUnknownRequestError) {
            throw new Error('An error occured, pls check your network')
          } else {
            console.log(error)
            throw new Error('An error occured')
          }
        }
        if (!user) {
          throw new Error('Invalid username or password!')
        }

        const isValid = await verifyPassword(password, user.password)

        if (!isValid) {
          throw new Error('Invalid username or password!')
        }

        await client.user.update({
          where: { id: user.id },
          data: {
            lastActiveAt: new Date(),
          },
        })
        return { id: user.id, name: user.name, role: user.role }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      const user: User = await client.user.findUnique({
        where: { id: token.id as string },
      })
      if (user) {
        session = { ...session, user: { id: user.id, name: user.name, role: user.role, image: user.avatarUrl } as User }
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
