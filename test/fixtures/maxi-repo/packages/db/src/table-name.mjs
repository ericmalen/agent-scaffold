// Maps a Prisma model name to its physical table name.
export function tableName(model) {
  return model.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() + 's';
}
