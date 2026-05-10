import { connectDB } from "@/src/config/db";
import { User } from "@/src/models/User";


export async function GET() {
    try {
        await connectDB();
        const userData = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        if (!userData) {
            return Response.json(
                { Message: "No user data found " },
                { status: 500 }
            )
        }

        return Response.json(
            {
                No_of_users: userData.length,
                Users: userData,
            },
            { status: 200 }
        )

    } catch (error: any) {
        return Response.json(
            { Error: error.message },
            { status: 500 }
        )
    }
}