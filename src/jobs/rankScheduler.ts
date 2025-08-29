// src/jobs/rankScheduler.ts
import cron from 'node-cron'
import { rankMembers } from '../pages/zones/utils/rankMembers'
import { client as prisma } from '../../lib/prisma'

const scheduleAnnualRanking = () => {
  // Run at midnight on Jan 1st every year
  cron.schedule('0 0 1 1 *', async () => {
    console.log('Starting annual ranking job...')

    try {
      const members = await prisma.member.findMany({
        include: { zone: true },
      })

      const normalizedMembers = members.map(member =>({
        ...member,
        cardNo: String(member.cardNo),
      }))

      const ranked = rankMembers(normalizedMembers)

      const currentYear = new Date().getFullYear()

      for (const r of ranked) {
        await prisma.zoneRankingHistory.create({
          data: {
            zoneId: r.zone.id,
            rankNo: r.rankNo,
            year: currentYear,
          },
        })
      }

      console.log('Annual ranking saved successfully.')
    } catch (error) {
      console.error('Error during annual ranking:', error)
    }
  })
}

export default scheduleAnnualRanking
