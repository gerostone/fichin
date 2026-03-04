export function sanitizeReviewContent(content: string): string {
  const withoutTags = content.replace(/<[^>]*>/g, "");
  return withoutTags.trim();
}
