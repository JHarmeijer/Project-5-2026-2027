import Link from "next/link";


export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm p-4 flex justify-center gap-6">
            <Link href="/" className="text-gray-700">Home</Link>
        </nav>
    ); 
}