import Link from "next/link";
import SchoolplaatViewer from "../components/map/SchoolplaatViewer";

export default function SchoolplaatPage() {
  return (
    <main className="page-shell school-page">
      <header className="page-header school-header">
        <h1>Oog in oog met de Romeinen</h1>
        <Link href="/" className="back-link">
          Terug naar overzicht
        </Link>
      </header>

      <SchoolplaatViewer src="/api/schoolplaat" />
    </main>
  );
}
