interface BlogFiltersProps {
  categories: import("@/types/blog/blog").BlogTaxonomy[];
  tags: import("@/types/blog/blog").BlogTaxonomy[];
  activeCategory?: string;
  activeTag?: string;
}
