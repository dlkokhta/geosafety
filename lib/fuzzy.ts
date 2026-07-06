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
