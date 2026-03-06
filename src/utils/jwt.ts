import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT Secret not defined or provided")
}

export function signToken(payload: object) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
}

export function verifyToken<T>(token: string): T {
    return jwt.verify(token, JWT_SECRET) as T;
}