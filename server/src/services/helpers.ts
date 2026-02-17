export function sortRecordByValueDescending(unsortedRecord: Record<string, number>): Record<string, number> {
  // 1. Convert the Record to an array of [key, value] pairs using Object.entries()
  const entries: [string, number][] = Object.entries(unsortedRecord);

  // 2. Sort the array of entries by the value (index 1) in descending order
  entries.sort((a, b) => b[1] - a[1]);

  // 3. Reconstruct the sorted array of entries back into a new Record using Array.reduce() or Object.fromEntries()
  const sortedRecord = entries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, number>);

  return sortedRecord;
}