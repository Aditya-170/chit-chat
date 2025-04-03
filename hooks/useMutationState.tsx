import { useMutation } from "convex/react";
import { useState } from "react";

export const useMutationState = (mutationToRun: any) => {
  const [Pending, setPending] = useState(false);
  const mutationFn = useMutation(mutationToRun);

  const mutate = async (payload: any) => {
    setPending(true);
    try {
      const res = await mutationFn(payload);
      return res; // Return the successful result
    } catch (err) {
      throw err; // Ensure error is thrown for proper handling in `catch`
    } finally {
      setPending(false);
    }
  };

  return { mutate, Pending };
};
