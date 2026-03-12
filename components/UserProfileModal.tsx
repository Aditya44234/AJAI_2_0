"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Personality } from "@/types/chat";
import type { User } from "@/types/user";
import { useEffect, useState } from "react";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  personality: Personality;
}

export function UserProfileModal({
  open,
  onOpenChange,
  user,
  personality,
}: UserProfileModalProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!open) return;

    setCurrentTime(new Date());
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [open]);

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card/95 p-0 text-card-foreground backdrop-blur-xl">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card p-6 sm:p-7">
          <DialogHeader className="items-start text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary text-2xl font-semibold uppercase text-primary-foreground shadow-sm">
              {user.name.slice(0, 1)}
            </div>
            <DialogTitle className="text-xl">User Profile</DialogTitle>
            <DialogDescription>
              Account details and your current chat mode.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Name
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {user.name}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Email
              </p>
              <p className="mt-2 break-all text-base font-medium text-foreground">
                {user.email}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Personality
                </p>
                <p className="mt-2 text-base font-medium capitalize text-foreground">
                  {personality} mode
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Current Time
                </p>
                <p className="mt-2 text-base font-medium text-foreground">
                  {formattedTime}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
