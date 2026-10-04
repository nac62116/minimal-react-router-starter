import { useEffect, useState } from "react";

export function MatomoOptOut(props: {
  locales: {
    trackerActive: string;
    trackerInactive: string;
    matomoNotConfigured: string;
  };
}) {
  const { locales } = props;
  const [isOptedOutOfMatomo, setIsOptedOutOfMatomo] = useState(false);

  useEffect(() => {
    try {
      const _paq = (window._paq = window._paq || []);
      _paq.push([
        function () {
          // @ts-expect-error - Matomo docs mention that this works. https://developer.matomo.org/guides/tracking-javascript-guide
          setIsOptedOutOfMatomo(this.isUserOptedOut());
        },
      ]);
    } catch (error) {
      console.warn(`Matomo Opt-Out initialization failed.`);
      const formData = new FormData();
      formData.append(
        "error",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
      void fetch("/error", {
        method: "POST",
        body: formData,
      });
    }
  }, []);

  return (
    <>
      {typeof ENV.MATOMO_URL !== "undefined" ? (
        <>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="w-fit flex gap-2 items-center">
              <input
                id="matomo-opt-out"
                type="checkbox"
                checked={!isOptedOutOfMatomo}
                onChange={(e) => {
                  const isChecked = !e.target.checked;
                  setIsOptedOutOfMatomo(isChecked);
                  const _paq = (window._paq = window._paq || []);
                  try {
                    if (isChecked === false) {
                      _paq.push(["forgetUserOptOut"]);
                    } else {
                      window._paq.push(["optUserOut"]);
                    }
                  } catch (error) {
                    console.warn(`Matomo Opt-Out trigger failed.`);
                    const formData = new FormData();
                    formData.append(
                      "error",
                      JSON.stringify(error, Object.getOwnPropertyNames(error))
                    );
                    void fetch("/error", {
                      method: "POST",
                      body: formData,
                    });
                  }
                }}
              />
              <label htmlFor="matomo-opt-out" className="cursor-pointer">
                {isOptedOutOfMatomo
                  ? locales.trackerInactive
                  : locales.trackerActive}
              </label>
            </div>
          </div>
        </>
      ) : (
        <p className="mb-4">{locales.matomoNotConfigured}</p>
      )}
    </>
  );
}
