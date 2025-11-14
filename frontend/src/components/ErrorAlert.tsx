interface Props {
  message: string;
}

export default function ErrorAlert({ message }: Props) {
  if (!message) return null;
  return (
    <section
      aria-label="Error message"
      role="alert"
      aria-live="assertive"
      className="mt-5 rounded-lg border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger"
    >
      <strong>Error:</strong> {message}
    </section>
  );
}
