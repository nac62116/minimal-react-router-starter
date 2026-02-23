import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { extendSearchParams } from "~/lib/utils/search-params.shared";

// Progressive enhanced dropdown (Also works without JS -> Important if network is slow)
export function Dropdown() {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(
    searchParams.get("dropdown") === "true" ? true : false
  );

  return (
    <>
      <Link
        to={`?${extendSearchParams(searchParams, {
          addOrReplace: {
            dropdown: String(!isOpen),
          },
        })}`}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        preventScrollReset
        className="hover:underline font-semibold"
      >
        {isOpen ? "Close dropdown" : "Open dropdown"}
      </Link>
      {isOpen ? (
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
      ) : null}
    </>
  );
}
