/** Prisma filter: only rows that have not been soft-deleted. */
export const activeOnly = { deletedAt: null } as const;

export function assertActiveRecord(
  record: { deletedAt: Date | null } | null,
  label: string,
): asserts record is { deletedAt: Date | null } {
  if (!record) throw { statusCode: 404, message: `${label} tidak ditemukan.` };
  if (record.deletedAt) {
    throw { statusCode: 400, message: `${label} sudah diarsipkan dan tidak dapat digunakan.` };
  }
}
