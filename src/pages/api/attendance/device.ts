import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers['x-api-key']

  if (apiKey !== process.env.DEVICE_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      let { user_id, date, timestamp } = req.body

      const member = await client.member.findFirst({
        where: { cardNo: parseInt(user_id) },
      })

      if (!member) {
        return res.status(404).json({ message: `No member found for user_id ${user_id}` })
      }

      if (!date && timestamp) {
        date = new Date(timestamp).toISOString()
      } else if (!date) {
        date = new Date().toISOString()
      }

      const exists = await client.attendance.findFirst({
        where: {
          memberId: member.id,
          day: new Date(date).getDate(),
        },
      })

      if (exists) {
        return res.status(400).json({
          message: `Duplicate! Attendance already marked for ${new Date(date).toLocaleDateString()}`,
        })
      }

      const attendance = await client.attendance.create({
        data: {
          date,
          member: { connect: { id: member.id } },
          year: new Date(date).getFullYear(),
          month: new Date(date).getMonth() + 1,
          day: new Date(date).getDate(),
        },
      })

      return res.status(200).json({ message: 'Attendance recorded', attendance })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Error saving attendance', error })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
