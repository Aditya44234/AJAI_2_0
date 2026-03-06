import { Schema, models, model } from "mongoose"


export interface IUsage {
    key: string;
    count: number;
    createdAt: Date;
}

const UsageSchema = new Schema<IUsage>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        count: {
            type: Number,
            default: 0,
        },

        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 60 * 24,
        },
    }
);



export const Usage = models.Usage || model<IUsage>("Usage", UsageSchema);