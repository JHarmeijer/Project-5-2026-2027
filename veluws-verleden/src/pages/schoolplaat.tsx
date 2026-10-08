import Link from "next/link";
import SchoolplaatViewer from "../components/map/SchoolplaatViewer";

export default function SchoolplaatPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>Oog in oog met de Romeinen</h1>
        <Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
          Terug naar overzicht
        </Link>
      </div>

      <SchoolplaatViewer src="/api/schoolplaat" />
    </main>
  );
}
