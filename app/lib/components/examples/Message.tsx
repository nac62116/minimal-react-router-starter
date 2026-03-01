import type { Message } from "~/lib/utils/message.server";

// Simple Message component to display the message from lib/utils/message.server.ts
export function Message(props: {
  message: Pick<Message, "message" | "level">;
}) {
  const { message } = props;

  return (
    <p
      className={`abolute left-0 top-0 right-0 text-center rounded-sm p-2 ${message.level === "positive" ? "bg-green-700 text-white" : message.level === "neutral" ? "bg-neutral-400 text-neutral-800" : message.level === "attention" ? "bg-yellow-500 text-neutral-800" : "bg-red-900 text-white"}`}
    >
      {message.message}
    </p>
  );
}
