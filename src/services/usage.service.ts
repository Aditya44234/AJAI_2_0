import { connectDB } from "../config/db";
import { Usage } from "../models/Usage";

const TEMP_LIMIT = 10;
const USER_LIMIT = 100;

function todayKey(id: string) {
    const date = new Date().toISOString().slice(0, 10);
    return `${id}_${date}`
}


export async function checkAndIncrementUsage(
    id: string,
    isTemp: boolean
) {
    await connectDB();

    const key = todayKey(id);

    const limit = isTemp ? TEMP_LIMIT : USER_LIMIT;

    const usage = await Usage.findOne({ key });

    if (usage && usage.count >= limit) {
        throw new Error(
            isTemp
                ? "Free limit reached. Please login to continue."
                : "Daily usage limit reached."
        );
    }

    await Usage.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );
}
