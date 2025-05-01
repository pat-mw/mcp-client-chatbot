"use client";

import { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import { cn } from "lib/utils";
import { motion } from "framer-motion";

interface ImageMessageProps {
  message: UIMessage;
  threadId: string;
  isLoading: boolean;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  className?: string;
}

export function ImageMessage({ message, className }: ImageMessageProps) {
  // Generate a random seed for the image to ensure we get a different image each time
  const randomSeed = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${randomSeed}/1200/600`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        className,
        "w-full mx-auto max-w-7xl px-6 group/message fade-in animate-in"
      )}
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="relative w-full aspect-video overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt="Random image"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
