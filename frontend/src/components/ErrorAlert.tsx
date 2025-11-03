interface Props {
  message: string;
}

export default function ErrorAlert({ message }: Props) {
  if (!message) return null;
  return (
    <div style={{ color: "red", marginTop: "20px" }}>
      <strong>Error:</strong> {message}
    </div>
  );
}


