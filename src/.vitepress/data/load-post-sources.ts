import { loadContentSources } from "./load-content-sources.ts";
import { preparePosts } from "./post-utils.ts";

export async function loadPostSources(files: string[], srcDir: string, options: { includeDrafts?: boolean } = {}) {
  return preparePosts(await loadContentSources(files, srcDir), options);
}
