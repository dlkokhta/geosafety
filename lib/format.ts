const amountFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGel(amount: number) {
  return `${amountFormat.format(amount)} ₾`;
}

// entry_date arrives as "YYYY-MM-DD"; format from the string parts to
// avoid timezone shifts from Date parsing.
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatMonth(isoMonth: string) {
  const [year, month] = isoMonth.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}
