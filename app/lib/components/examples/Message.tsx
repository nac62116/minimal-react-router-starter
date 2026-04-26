import { useEffect, useState } from "react";
import { Link, useLocation, useNavigation } from "react-router";
import { useHydrated } from "remix-utils/use-hydrated";
import type { Message } from "~/lib/utils/message.server";

// Simple Message component to display the message from lib/utils/message.server.ts
export function Message(props: { message: Message | null }) {
  // TODO: Message isRichtext when its needed
  const [message, setMessage] = useState(props.message);
  const navigation = useNavigation();
  const location = useLocation();
  const isHydrated = useHydrated();

  useEffect(() => {
    if (navigation.state === "idle") {
      setMessage(props.message);
      if (props.message === null) {
        return;
      }
      let timeout: NodeJS.Timeout | undefined;
      if (props.message.delayInMillis !== "persistent") {
        timeout = setTimeout(() => {
          setMessage(null);
        }, props.message.delayInMillis ?? 5000);
      }
      return () => {
        clearTimeout(timeout);
      };
    } else {
      return;
    }
  }, [navigation.state, props.message]);

  if (message === null) {
    return null;
  }

  return (
    <p
      id={message.id ?? "message"}
      key={message.key}
      className={`fixed left-0 top-0 right-0 text-center rounded-sm p-2 ${message.level === "positive" ? "bg-green-700 text-white" : message.level === "neutral" ? "bg-neutral-400 text-neutral-800" : message.level === "attention" ? "bg-yellow-500 text-neutral-800" : "bg-red-900 text-white"}`}
    >
      <span>{message.message}</span>
      {isHydrated === false || message.delayInMillis === "persistent" ? (
        <Link
          to={`${location.pathname}${location.search}${location.hash}`}
          onClick={(event) => {
            event.preventDefault();
            setMessage(null);
          }}
          aria-label="Remove message"
          className="absolute top-2 bottom-2 right-4 hover:underline hover:font-semibold"
        >
          X
        </Link>
      ) : null}
    </p>
  );
}
