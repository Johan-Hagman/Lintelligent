export default function Footer() {
  return (
    <footer className="bg-surface-raised text-text">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Lintelligent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
