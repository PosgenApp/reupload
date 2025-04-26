import { Request, Response } from "hyper-express";
import APIError from "../../error/APIError";
import { StatusCodes } from "http-status-codes";
import prisma from "../../prisma";

export default async function Read(req: Request, res: Response) {
	const imageId = req.params.id;

	if (!imageId)
		throw new APIError(
			StatusCodes.BAD_GATEWAY,
			":id path parameter is required."
		);

	const result = await prisma.image.findFirst({
		where: {
			id: imageId,
		},
		include: {
			base: true,
			high: true,
			low: true,
			mid: true,
		},
	});

	if (!result)
		throw new APIError(StatusCodes.NOT_FOUND, "Requested image is not found.");

	return res.json(result);
}
