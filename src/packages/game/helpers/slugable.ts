import { slugify } from "pkg/slugify";

export const Slugable = (name: string) => ({
  name,
  slug: slugify(name),
});
