import type { NextApiResponse, NextApiRequest } from "next";
import { validateRoute } from "../../../../lib/auth";
import { client } from "../../../../lib/prisma";
import prismaError from "../../../../lib/prismaError";

const validatePhoneNumber = (input) => {
  // Define a regular expression pattern for a valid phone number.
  // This pattern allows for 10 or more digits and may include spaces, hyphens, or parentheses.
  const phoneNumberPattern = /^\+?[0-9\s\-()]+$/;

  // Remove any spaces, hyphens, or parentheses from the input
  const cleanedInput = input.replace(/[\s\-()]/g, "");

  // Check if the cleaned input matches the phone number pattern
  return phoneNumberPattern.test(cleanedInput) && cleanedInput.length >= 10;
};

export default validateRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (req.method === "GET") {
      try {
        const member = await client.member.findUnique({
          where: {
            id: id as string,
          },
          include: {
            zone: true,
          },
        });
        return res.status(200).json(member);
      } catch (e) {
        return prismaError(e, res);
      }
    } else if (req.method === "DELETE") {
      const member = await client.member.findUnique({
        where: {
          id: id as string,
        },
      });

      if (!member) {
        return res.status(401).json({ error: "Member does not exist" });
      }

      const deleteMember = client.member.delete({
        where: { id: id as string },
      });
      const deleteAttendance = client.attendance.deleteMany({
        where: {
          memberId: id as string,
        },
      });
      try {
        const transaction = await client.$transaction([
          deleteAttendance,
          deleteMember,
        ]);
        res
          .status(200)
          .json({ message: "Member deleted successfully", transaction });
      } catch (e) {
        return prismaError(e, res);
      }
    } else if (req.method === "PUT" || req.method === "PATCH") {
      const {
        firstname,
        middlename,
        lastname,
        cardNo,
        address,
        contactNo,
        email,
        avatarUrl,
        dateOfBirth,
        dateOfMembership,
        dateOfBaptism,
        status,
        gender,
        placeOfBirth,
        occupation,
        maritalStatus,
        spouse,
        zone,
        alternateContact,
        businessAddress,
        nextOfKin,
        kinContact,
      } = req.body;
      try {
        if (!validatePhoneNumber(contactNo)) {
          return res
            .status(400)
            .json({ error: "Please enter a valid phone number" });
        }

        if (alternateContact && !validatePhoneNumber(alternateContact)) {
          return res
            .status(400)
            .json({ error: "Please enter a valid alternate number" });
        }

        if (kinContact && !validatePhoneNumber(kinContact)) {
          return res
            .status(400)
            .json({ error: "please enter a valid number for next of kin" });
        }

        const selectedZone = await client.zone.findUnique({
          where: { name: zone },
        });

        const currentMember = await client.member.findFirst({
          where: {
            cardNo: parseInt(cardNo),
            zoneId: selectedZone.id,
          },
        });

        if (currentMember && currentMember.id !== id) {
          return res
            .status(400)
            .json({
              error: `Card number ${cardNo} already assigned in Zone ${zone}.`,
            });
        }

        const member = await client.member.update({
          where: { id: id as string },
          data: {
            firstname: firstname || undefined,
            middlename: middlename || undefined,
            lastname: lastname || undefined,
            cardNo: Number(cardNo) || undefined,
            address: address || undefined,
            contactNo: contactNo || undefined,
            email: email || undefined,
            avatarUrl: avatarUrl || undefined,
            dateOfBaptism:
              dateOfBaptism !== null && dateOfBaptism !== ""
                ? new Date(dateOfBaptism)
                : null,
            dateOfMembership:
              dateOfMembership !== null && dateOfBaptism !== ""
                ? new Date(dateOfMembership)
                : null,
            status: status || undefined,
            gender: gender || undefined,
            placeOfBirth: placeOfBirth || undefined,
            occupation: occupation || undefined,
            maritalStatus: maritalStatus || undefined,
            spouse: maritalStatus !== "SINGLE" ? spouse || undefined : "",
            nextOfKin: nextOfKin || undefined,
            businessAddress: businessAddress || undefined,
            kinContact: kinContact || undefined,
            zone: {
              connect: {
                name: zone,
              },
            },
          },
        });
        return res.status(200).json(member);
      } catch (e) {
        console.log(e);
        return prismaError(e, res);
      }
    }
  }
);
