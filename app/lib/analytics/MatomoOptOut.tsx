import { useEffect, useState, useSyncExternalStore } from "react";

// DNT never changes while the page is open, so there's nothing to subscribe to.
// Defined outside the component so the reference is stable.
const subscribeNoop = () => () => {};

export function MatomoOptOut(props: {
  locales: {
    trackerActive: string;
    trackerInactive: string;
    doNotTrackEnabled: string;
    matomoNotConfigured: string;
  };
}) {
  const { locales } = props;
  const [isOptedOutOfMatomo, setIsOptedOutOfMatomo] = useState(false);

  const doNotTrack = useSyncExternalStore(
    subscribeNoop,
    () => navigator.doNotTrack === "1", // client
    () => false // server and hydration
  );

  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
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
            {doNotTrack === false ? (
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
            ) : (
              <p>{locales.doNotTrackEnabled}</p>
            )}
          </div>
        </>
      ) : (
        <p className="mb-4">{locales.matomoNotConfigured}</p>
      )}
    </>
  );
}
