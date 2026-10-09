import SchoolplaatViewer from "../components/map/SchoolplaatViewer";

export default function SchoolplaatPage() {
  return (
    <main className="page-shell school-page">

      <SchoolplaatViewer src="/api/schoolplaat" terugHref="/" />
    </main>
  );
}