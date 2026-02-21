import sanitizeHtml from "sanitize-html";

// Extend if neccessary but be aware with user input you allow!

const allowedTags = [
  "b",
  "i",
  "em",
  "strong",
  "a",
  "ul",
  "ol",
  "p",
  "span",
  "li",
  "br",
];

const allowedAttributes = {
  a: [
    "class",
    "href",
    {
      name: "rel",
      multiple: true,
      values: ["noopener", "noreferrer"],
    },
    {
      name: "target",
      values: ["_blank"],
    },
  ],
  b: ["class"],
  i: ["class"],
  em: ["class"],
  strong: ["class"],
  ul: ["class"],
  ol: ["class"],
  p: ["class"],
  span: ["class"],
  li: ["class"],
  br: ["class"],
};

export const sanitizeUserHtml = (
  html: string | null,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: { [key: string]: string[] };
  }
) => {
  if (html === null) {
    return null;
  }
  if (allowedTags === undefined) {
    return null;
  }
  if (allowedAttributes === undefined) {
    return null;
  }
  const sanitizedHtml = sanitizeHtml(
    html,
    options ?? {
      allowedTags,
      allowedAttributes,
    }
  ).replaceAll("<br />", "<br>");
  return sanitizedHtml;
};
