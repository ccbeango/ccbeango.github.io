import { loadContentSources } from "./load-content-sources.ts";
import { prepareMoments } from "./moment-utils.ts";

export async function loadMomentSources(files: string[], srcDir: string, options: { includeDrafts?: boolean } = {}) {
  return prepareMoments(await loadContentSources(files, srcDir), options);
}
