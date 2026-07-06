import { z } from "zod";

const searchParamsSchema = z.object({
  status: z.enum(["matched", "unmatched", "ignored"]).nullable().catch(null),
  sort: z.enum(["date", "amount"]).catch("date"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable()
    .catch(null),
});

export type ParsedSearchParams = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(
  searchParams: URLSearchParams
): ParsedSearchParams {
  return searchParamsSchema.parse({
    status: searchParams.get("status"),
    sort: searchParams.get("sort"),
    dir: searchParams.get("dir"),
    month: searchParams.get("month"),
  });
}
