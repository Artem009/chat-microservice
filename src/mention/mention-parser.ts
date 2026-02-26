const UUID_PATTERN =
  /@([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

export function parseMentions(content: string): string[] {
  const matches = content.matchAll(UUID_PATTERN);
  const userIds = new Set<string>();

  for (const match of matches) {
    userIds.add(match[1].toLowerCase());
  }

  return [...userIds];
}
