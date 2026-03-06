export function generateChatTitle(message: string): string {
    if (!message) return "New Chat";

    const cleaned = message.trim().replace(/\s+/g, " ");

    return cleaned.length > 40
        ? cleaned.substring(0, 40) + "..."
        : cleaned;
}
