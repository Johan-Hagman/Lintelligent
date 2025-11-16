import { Alert } from "./ui/Alert";

interface Props {
  message: string;
}

export default function ErrorAlert({ message }: Props) {
  if (!message) return null;

  return (
    <Alert variant="error" className="mt-6" withIcon>
      <p className="text-sm font-semibold text-danger">Something went wrong</p>
      <p className="text-sm text-danger/80">{message}</p>
    </Alert>
  );
}
