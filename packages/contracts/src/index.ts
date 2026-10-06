import { z } from "zod";

export const isoUtcDateTimeSchema = z.iso.datetime({ offset: false });

export const apiHealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: isoUtcDateTimeSchema,
});

export type ApiHealthResponse = z.infer<typeof apiHealthResponseSchema>;
