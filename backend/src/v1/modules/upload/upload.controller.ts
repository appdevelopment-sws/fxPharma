import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { uploadService } from "./upload.service.js";

type UploadQuery = {
  fileName?: string;
  fileType?: string;
};

type UploadRequest = Request & {
  file?: Express.Multer.File;
  query: UploadQuery;
};

export class UploadController {
  getPresignedUrl = catchAsync(async (req: UploadRequest, res: Response) => {
    const data = await uploadService.generatePresignedUrl(req.query);

    res.json({
      success: true,
      data,
      message: "Presigned URL generated successfully",
    });
  });

  uploadSingle = catchAsync(async (req: UploadRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const data = await uploadService.uploadLocalFile(req.file);

    res.status(200).json({
      success: true,
      data,
      message: "File uploaded successfully",
    });
  });
}

export const uploadController = new UploadController();
