import { Role } from "@prisma/client";
import type { NextApiResponse, NextApiRequest } from "next";
import { client } from "../../../../../lib/prisma";
import prismaError from "../../../../../lib/prismaError";



export default async function handler(req: { query: { role: any; }; }, res: NextApiResponse) {
    const { role} = req.query;
    try {
        const user = await client.user.findMany({
            where: {
                role
            }
        });
        res.status(200).json(user);
    } catch(e) {
        return prismaError(e, res)
    }
}