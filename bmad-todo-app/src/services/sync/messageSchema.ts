import { z } from 'zod'

export const SyncMessageSchema = z.object({
  resource: z.literal('todo'),
  action: z.enum(['created', 'updated', 'deleted', 'sync-request']),
  data: z.unknown(),
  timestamp: z.number(),
  source: z.string().min(1),
})

export type SyncMessage = z.infer<typeof SyncMessageSchema>
