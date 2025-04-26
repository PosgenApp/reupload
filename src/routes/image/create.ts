import { Request, Response } from "hyper-express";
import prisma from "../../prisma/index.js";
import { createId } from "@paralleldrive/cuid2";
import { join } from "path";
import { contentType, extension as mimeExtension } from "mime-types";
import APIError from "../../error/APIError.js";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { unlink } from "fs/promises";
import { ImageObject } from "@prisma/client";

type Resolution = "low" | "mid" | "high" | "base";

const resolutionMappings: Record<Resolution, number> = {
	low: 65,
	mid: 75,
	high: 90,
	base: 100,
};

async function createOptimizedCopy(file: string, resolutionFactor: number) {
	// create sharpinstance and disable animations
	const sharpInstance = sharp(file, { animated: false });

	// retreive metadata
	const sharpMetadata = await sharpInstance.metadata();
	if (!sharpMetadata.height || !sharpMetadata.width)
		throw new APIError(
			StatusCodes.INTERNAL_SERVER_ERROR,
			"Sharp instance metadata retreiver didn't return correctly."
		);

	// remove exif and set format to webp with optimized settings
	const updated = sharpInstance
		.resize(
			Math.floor(sharpMetadata.width * (resolutionFactor / 100)),
			Math.floor(sharpMetadata.height * (resolutionFactor / 100))
		)
		.withExif({})
		.webp({
			lossless: false,
			quality: resolutionFactor,
			loop: 1,
			effort: 3,
		});
	return updated;
}

async function createOptimizedVersion(file: string, resolution: Resolution) {
	// create optimized copy
	const sharpInstance = await createOptimizedCopy(
		file,
		resolutionMappings[resolution]
	);

	// retreive metadata
	const sharpMetadata = await sharpInstance.metadata();
	if (!sharpMetadata.height || !sharpMetadata.width || !sharpMetadata.format)
		throw new APIError(
			StatusCodes.INTERNAL_SERVER_ERROR,
			"Sharp instance metadata retreiver didn't return correctly."
		);

	// create imageobject
	const imageObject = await prisma.imageObject.create({
		data: {
			width: sharpMetadata.width,
			height: sharpMetadata.height,

			resolution: (sharpMetadata.width * sharpMetadata.height) / 1000000,
			type: contentType(sharpMetadata.format) || "webp",
			ext: mimeExtension(sharpMetadata.format) || ".webp",
			size: 0,
		},
	});

	// save as file to static
	sharpInstance.toFile(
		join(process.env.STATIC_PATH || "./", `${imageObject.id}${imageObject.ext}`)
	);

	return imageObject;
}

export default async function Create(req: Request, res: Response) {
	await req.multipart(async (field) => {
		if (field.file) {
			//
			// Check file type
			//
			if (!field.mime_type.startsWith("image/"))
				throw new APIError(StatusCodes.UNSUPPORTED_MEDIA_TYPE);

			const extension = mimeExtension(field.mime_type);

			if (!extension) throw new APIError(StatusCodes.UNSUPPORTED_MEDIA_TYPE);

			// Create Temporary Identity for file
			const temporaryIdentifier = createId();

			const temporaryFile = join(
				process.env.TEMP_PATH || "./",
				`${temporaryIdentifier}.${extension}`
			);

			// Save file temporary
			await field.write(temporaryFile);

			const objects = await (() =>
				new Promise(
					(
						resolve: (objects: Record<Resolution, ImageObject | null>) => void
					) => {
						const objects: Record<Resolution, ImageObject | null> = {
							low: null,
							mid: null,
							high: null,
							base: null,
						};
						let filled = 0;
						const keys = Object.keys(objects) as Resolution[];

						// Remove temporary file
						for (const objectName of keys) {
							createOptimizedVersion(temporaryFile, objectName).then(
								(result) => {
									objects[objectName] = result;
									filled += 1;
									if (filled == keys.length) {
										resolve(objects);
									}
								}
							);
						}
					}
				))();

			const image = await prisma.image.create({
				data: {
					lowId: objects.low?.id,
					midId: objects.mid?.id,
					highId: objects.high?.id,
					baseId: objects.base?.id,
				},
				include: {
					base: true,
					high: true,
					low: true,
					mid: true,
				},
			});

			unlink(temporaryFile);

			res.status(201).json(image);
			return;
		}
		throw new APIError(StatusCodes.NO_CONTENT);
	});
	throw new APIError(StatusCodes.NOT_ACCEPTABLE);
}
