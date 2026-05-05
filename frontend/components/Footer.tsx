export default function Footer() {
  return (
    <footer
      className="text-center py-8 text-xs"
      style={{
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border)",
      }}
    >
      Created by{" "}
      <span style={{ color: "var(--text)" }}>Parth Sood</span>
    </footer>
  );
}
