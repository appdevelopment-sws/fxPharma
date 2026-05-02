/**
 * Builds a Prisma search filter (OR clause) for multiple fields.
 * @param search - The search string
 * @param fields - The fields to search in (default: ['name', 'key'])
 */
export const buildSearchFilter = (search?: string, fields: string[] = ["name", "key"]) => {
  if (!search) return {};

  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    })),
  };
};
