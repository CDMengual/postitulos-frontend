export function updateItemInArray<T extends { id: number }, K extends keyof T>(
  array: T[],
  id: number,
  field: K,
  value: T[K]
): T[] {
  return array.map((item) =>
    item.id === id ? { ...item, [field]: value } : item
  );
}
