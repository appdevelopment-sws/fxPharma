import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UploadController {
  static uploadSingle = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;
      // Path to src/uploads
      const uploadDir = path.join(process.cwd(), "src/uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = path.join(uploadDir, fileName);

      fs.writeFileSync(uploadPath, req.file.buffer);

      const fileUrl = `/uploads/${fileName}`;

      res.status(200).json({
        success: true,
        data: {
          url: fileUrl,
          path: fileUrl,
          fileName: fileName,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
