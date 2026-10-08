import WelkomModal from "./WelkomModal";

export default function HomePage() {
  return (
    <main>
      <h1>Vensters Veluws Verleden</h1>
      <div className="grid">
        <div className="card">
          <a href="https://brillenmannetje.nl/work/veluwsverleden/ROM_ABV_KLEUR_DEF.tif">
            <h2>Oog in oog met de Romeinen</h2>
          </a>
          <WelkomModal />
        </div>
      </div>
    </main>
  );
}