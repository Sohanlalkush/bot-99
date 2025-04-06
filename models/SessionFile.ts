// models/SessionFile.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ISessionFile extends Document {
  fileName: string;
  content: any; // You can refine this type if you know the structure
}

const sessionFileSchema = new Schema<ISessionFile>({
  fileName: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
});

const SessionFile = mongoose.model<ISessionFile>(
  "SessionFile",
  sessionFileSchema,
);
export default SessionFile;
