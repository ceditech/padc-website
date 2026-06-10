export type FormState = "idle" | "submitting" | "success" | "error";

export function FormStatus({
  state,
  success,
  error
}: {
  state: FormState;
  success: string;
  error?: string;
}) {
  if (state === "success") {
    return <div className="status-message success">{success}</div>;
  }

  if (state === "error") {
    return <div className="status-message error">{error ?? "Something went wrong. Please try again."}</div>;
  }

  return null;
}
