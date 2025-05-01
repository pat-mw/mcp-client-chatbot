import { UIMessage } from "ai";
import { PreviewMessage } from "../message";
import type { UseChatHelpers } from "@ai-sdk/react";
import { ImageMessage } from "./custom-messages/image-message";
import { Badge } from "ui/badge";

type GenericMessageProps = {
  message: UIMessage;
  threadId: string;
  isLoading: boolean;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  className?: string;
};

export function GenericMessage({
  message,
  threadId,
  isLoading,
  setMessages,
  reload,
  className,
}: GenericMessageProps) {
  // For testing purposes, we'll use a simple condition to test the ImageMessage
  // In a real implementation, this would be based on message properties
  const isImageMessage = message.parts?.some(
    (part) => part.type === "text" && part.text?.includes("show me an image")
  );

  if (isImageMessage) {
    return (
      <ImageMessage
        message={message}
        threadId={threadId}
        isLoading={isLoading}
        setMessages={setMessages}
        reload={reload}
        className={className}
      />
    );
  }

  return (
    <PreviewMessage
      threadId={threadId}
      message={message}
      isLoading={isLoading}
      setMessages={setMessages}
      reload={reload}
      className={className}
    />
  );
}
