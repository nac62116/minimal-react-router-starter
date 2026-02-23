// TODO: List of search params used within the app to avoid conflicts (typesafe uniqueness if possible)

export function extendSearchParams(
  params: URLSearchParams,
  options: {
    addOrReplace?: Record<string, string>;
    remove?: string[];
  }
) {
  const { addOrReplace, remove } = options;
  const extendSearchParams = new URLSearchParams(params);
  if (addOrReplace) {
    for (const key in addOrReplace) {
      extendSearchParams.set(key, addOrReplace[key]);
    }
  }
  if (remove) {
    for (const key of remove) {
      extendSearchParams.delete(key);
    }
  }
  return extendSearchParams;
}
