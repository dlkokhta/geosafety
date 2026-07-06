// Legal-form words appear before or after the actual name ("შპს გეოტრანსი",
// "ბათუმი კარგო სს") and bank feeds often drop them entirely, so they carry
// no matching signal — remove them outright.
const LEGAL_FORMS = new Set([
  "შპს",
  "სს",
  "სპს",
  "კს",
  "ააიპ",
  "ltd",
  "llc",
  "jsc",
]);


export function normalizeCompanyName(name: string): string {
  return (
    name
      .toLocaleLowerCase("ka")      
      .replace(/ა\(ა\)იპ|ი\/მ/gu, " ")      
      .replace(/\([^)]*\)/gu, " ")      
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token !== "" && !LEGAL_FORMS.has(token))
      .join(" ")
  );
}

function bigrams(value: string): Map<string, number> {
  const grams = new Map<string, number>();
  for (let i = 0; i < value.length - 1; i++) {
    const gram = value.slice(i, i + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }
  return grams;
}


export function nameSimilarity(a: string, b: string): number {
  if (a === b) return a === "" ? 0 : 1;

  const gramsA = bigrams(a);
  const gramsB = bigrams(b);
  let totalA = 0;
  let shared = 0;

  for (const [gram, count] of gramsA) {
    totalA += count;
    shared += Math.min(count, gramsB.get(gram) ?? 0);
  }
  let totalB = 0;
  for (const count of gramsB.values()) totalB += count;

  if (totalA + totalB === 0) return 0;
  return (2 * shared) / (totalA + totalB);
}
