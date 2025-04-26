import { Request, Response } from "hyper-express";
import APIError from "../../error/APIError";
import { StatusCodes } from "http-status-codes";
import prisma from "../../prisma";
import GenericResponse from "../../types/GenericResponse";

export default async function Delete(req: Request, res: Response) {
	const imageId = req.params.id;

	if (!imageId)
		throw new APIError(
			StatusCodes.BAD_GATEWAY,
			":id path parameter is required."
		);

	await prisma.image.delete({
		where: {
			id: imageId,
		},
	});

	return res.json({
		_ref: "string",
		data: "Image deleted.",
	} as GenericResponse);
}
