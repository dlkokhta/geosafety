
const NEEDS_QUOTING = /[",\r\n]/;

function escapeField(value: string | number): string {
  const text = String(value);
  return NEEDS_QUOTING.test(text)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}


export function toCsv(rows: (string | number)[][]): string {
  return (
    "\uFEFF" +
    rows.map((row) => row.map(escapeField).join(",")).join("\r\n") +
    "\r\n"
  );
}
