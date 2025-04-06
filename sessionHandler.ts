// sessionHandler.ts
import fs from "fs";
import path from "path";
import SessionFile from "./models/SessionFile";

// Ensure the sessions directory exists
export async function ensureSessionDir(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log("Created sessions directory.");
  }
}

// Restore JSON session files from MongoDB
export async function restoreSessionsFromDB(dirPath: string): Promise<void> {
  const existing = await SessionFile.find({});
  if (existing.length > 0) {
    console.log("Restoring sessions from DB...");
    existing.forEach((file) => {
      fs.writeFileSync(
        path.join(dirPath, file.fileName),
        JSON.stringify(file.content, null, 2),
      );
    });
  } else {
    console.log("No session data found in DB.");
  }
}

// Backup local session files to MongoDB
export async function backupDb(dirPath: string): Promise<void> {
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

  for (const fileName of files) {
    const filePath = path.join(dirPath, fileName);

    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      await SessionFile.findOneAndUpdate(
        { fileName },
        { content },
        { upsert: true, new: true },
      );
    } catch (err) {
      console.warn(`⚠️ Skipping file ${fileName}:`, err.message);
    }
  }

  console.log("Backup to MongoDB complete.");
}
