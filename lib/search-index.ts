export type SearchIndexItem = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  searchText: string;
};

export function buildSearchIndex(): SearchIndexItem[] {
  return [];
}
