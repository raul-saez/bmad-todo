import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.string().cuid(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoSchema = TodoSchema.pick({ title: true })
export const UpdateTodoSchema = TodoSchema.pick({
  title: true,
  completed: true,
}).partial()
