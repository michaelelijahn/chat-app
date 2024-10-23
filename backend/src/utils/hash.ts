import crypto from "crypto";

export const hash = (plaintext: string): string => {
    const hash = crypto.createHash("sha256");
    const hashedText = hash.update(plaintext).digest("hex");
    return hashedText;
}

export const generateRandomID = () => {
    return crypto.randomUUID();
}