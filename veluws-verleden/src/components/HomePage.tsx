import WelkomModal from "./WelkomModal";
import SchoolplaatViewer from "./SchoolplaatViewer";

export default function HomePage() {
  return (
    <main>
      <h1>Vensters Veluws Verleden</h1>
      <div className="grid">
        <div className="card">
            <h2>Oog in oog met de Romeinen</h2>
            <SchoolplaatViewer src="/api/schoolplaat" />
          <WelkomModal />
        </div>
      </div>
    </main>
  );
}