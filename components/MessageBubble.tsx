// "use client"

// import { cn } from "@/lib/utils"
// import type { Message } from "@/types/chat"
// import { Bot, User } from "lucide-react"

// interface MessageBubbleProps {
//   message: Message
// }

// export function MessageBubble({ message }: MessageBubbleProps) {
//   const isUser = message.role === "user"

//   return (
//     <div className={cn("flex gap-3 w-full", isUser ? "justify-end" : "justify-start")}>
//       {/* {!isUser && (
//         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
//           <Bot className="w-4 h-4 text-accent-foreground" />
//         </div>
//       )} */}
//       <div
//         className={cn(
//           "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
//           isUser
//             ? "bg-primary text-primary-foreground rounded-br-md"
//             : "bg-card text-card-foreground rounded-bl-md border border-border"
//         )}
//       >
//         <p className="whitespace-pre-wrap break-words flex ">{message.content}</p>
//       </div>
//       {/* {isUser && (
//         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//           <User className="w-4 h-4 text-primary-foreground" />
//         </div>
//       )} */}
//     </div>
//   )
// }

"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "relative max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-300",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground rounded-bl-md border border-border animate-message-pulse",
          // base pseudo element
          "before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2",
          isUser
            ? [
                // user tail on right
                "before:right-[-6px]",
                "before:border-y-[8px] before:border-l-[8px] before:border-y-transparent before:border-l-primary before:border-r-0",
              ]
            : [
                // bot tail on left
                "before:left-[-6px]",
                "before:border-y-[8px] before:border-r-[8px] before:border-y-transparent before:border-r-card before:border-l-0",
                // add border color match for the tail edge
                "after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[-7px] after:border-y-[9px] after:border-r-[9px] after:border-y-transparent after:border-r-border after:border-l-0",
              ],
        )}
      >
        <div className="whitespace-pre-wrap break-words ">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
