import type { NextApiRequest, NextApiResponse } from "next"
import { client as prisma } from "../../../../lib/prisma"

type ZoneRanking = {
  id: string
  name: string
  rankNo: number | null
  count: number
}

type SuccessResponse = {
  message: string
  ranking: ZoneRanking[]
}

type ErrorResponse = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const year = parseInt(req.query.year as string)
    const month = req.query.month ? parseInt(req.query.month as string) : null

    if (isNaN(year)) {
      return res
        .status(400)
        .json({ error: "Year is required and must be a number" })
    }

    // Get all attendance records for that year/month
    const attendances = await prisma.attendance.findMany({
      where: {
        year,
        ...(month ? { month } : {})
      },
      include: {
        member: {
          select: { zoneId: true }
        }
      }
    })

    if (attendances.length === 0) {
      return res
        .status(200)
        .json({ message: "No attendance records found", ranking: [] })
    }

    // Count attendance per zone
    const zoneCounts: Record<string, number> = {}
    for (const att of attendances) {
      const zid = att.member.zoneId
      if (!zid) continue
      zoneCounts[zid] = (zoneCounts[zid] || 0) + 1
    }

    if (Object.keys(zoneCounts).length === 0) {
      return res
        .status(200)
        .json({ message: "No zones found for attendance", ranking: [] })
    }

    // Sort zones by attendance count
    const sorted = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])

    // Build update payload (rank numbers)
    const updates = sorted.map(([zoneId], index) => ({
      where: { id: zoneId },
      data: { rankNo: index + 1 }
    }))

    // Bulk update zone.rankNo (parallel)
    await prisma.$transaction(
      updates.map((u) => prisma.zone.update({ where: u.where, data: u.data }))
    )

    // Fetch updated zones
    const zones = await prisma.zone.findMany({
      where: { id: { in: Object.keys(zoneCounts) } }
    })

    // Attach counts and sort by rankNo
    const ranking: ZoneRanking[] = zones
      .map((z) => ({
        id: z.id,
        name: z.name,
        rankNo: z.rankNo ?? null,
        count: zoneCounts[z.id] || 0
      }))
      .sort((a, b) => (a.rankNo ?? Infinity) - (b.rankNo ?? Infinity))

    return res.status(200).json({
      message: `Zone ranking updated for ${year}${month ? `-${month}` : ""}`,
      ranking
    })
  } catch (err) {
    console.error("Zone ranking error:", err)
    return res.status(500).json({ error: "Failed to compute zone ranking" })
  }
}
