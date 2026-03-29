export function generateChatTitle(message: string): string {
    if (!message) return "New Chat";

    const cleaned = message.trim().replace(/\s+/g, " ");

    return cleaned.length > 10
        ? cleaned.substring(0, 10) + "..."
        : cleaned;
}
