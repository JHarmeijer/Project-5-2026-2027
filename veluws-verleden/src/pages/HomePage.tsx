import { Link } from "react-router-dom";

export default function HomePage() {
  const schoolplates = [
    {
      id: 3,
      title: "Oog in oog met de Romeinen",
      route: "/romeinen"
    }
  ];

  return (
    <div>
      <h1>Vensters Veluws Verleden</h1>

      <div className="grid">
        {schoolplates.map((plate) => (
          <Link key={plate.id} to={plate.route}>
            <div className="card">
              <h2>{plate.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}