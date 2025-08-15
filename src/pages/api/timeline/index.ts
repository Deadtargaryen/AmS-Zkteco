import type { NextApiResponse, NextApiRequest } from 'next'
import { client } from '../../../../lib/prisma'
import prismaError from '../../../../lib/prismaError'

export default async function handler(req, res) {
    if(req.method === 'GET') {
        const timeline = await client.timeline.findMany({
            orderBy: {
                date: 'desc',
            },
        })
        res.json(timeline)
    } else if(req.method === 'POST') {
        const {
            member,
            title,
            description,
            date,
        } = req.body
        try {
            const timeline = await client.timeline.create({
                data: {
                    member: {
                        connect: {
                            id: member,
                        },
                    },
                    title,
                    description,
                    date,
                },
            })
            res.json(timeline)
        } catch (error) {
            res.json(prismaError(error, res))
        }
    } else if(req.method === 'DELETE') {
        const { id } = req.body
        try {
            const timeline = await client.timeline.delete({
                where: {
                    id,
                },
            })
            res.json(timeline)
        } catch (error) {
            res.json(prismaError(error, res))
        }
    }
}
