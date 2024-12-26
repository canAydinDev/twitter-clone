import * as z from "zod";

export const UserValidation = z.object({
  bio: z.string().min(10, { message: "Min 10 characters!!!" }).max(1000),
});
