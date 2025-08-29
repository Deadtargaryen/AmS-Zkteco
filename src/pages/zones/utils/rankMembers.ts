// src/pages/zones/utils/rankMembers.ts
import { differenceInDays } from 'date-fns'

// Define the Member interface based on your data structure
export interface Member {
  id: string
  firstname: string
  middlename: string
  lastname: string
  cardNo: string
  address: string
  gender: string
  status: string
  zone: {
    id: string
    name: string
  }
}

// Extended interface for ranked members
export interface RankedMember extends Member {
  rankCount: number
  rankNo: number
  lastRankedAt: Date
}

/**
 * Function to rank members by their active count
 * Only recalculates ranks if at least 365 days have passed since the last ranking
 */
export const rankMembers = (
  members: Member[],
  lastRankedAt?: Date
): RankedMember[] => {
  const now = new Date()

  // If ranks exist and less than 365 days have passed, keep the previous ranks
  if (lastRankedAt && differenceInDays(now, lastRankedAt) < 365) {
    console.log('Ranking skipped: Less than 365 days since last ranking.')
    return members.map((m, index) => ({
      ...m,
      rankCount: 0, // Keep as is until new calculation
      rankNo: index + 1,
      lastRankedAt: lastRankedAt,
    }))
  }

  // Calculate fresh ranking
  const memberMap: Record<string, Member & { rankCount: number }> = {}

  members.forEach((m) => {
    const name = `${m.firstname} ${m.middlename} ${m.lastname}`
    if (!memberMap[name]) {
      // Create a copy of the member with rankCount initialized to 0
      memberMap[name] = { ...m, rankCount: 0 }
    }
    // Increment rankCount if status is ACTIVE
    memberMap[name].rankCount += m.status === 'ACTIVE' ? 1 : 0
  })

  // Sort and assign ranks with the current timestamp
  const ranked = Object.values(memberMap)
    .sort((a, b) => b.rankCount - a.rankCount)
    .map((m, index) => ({
      ...m,
      rankNo: index + 1,
      lastRankedAt: now,
    }))

  return ranked
}
    