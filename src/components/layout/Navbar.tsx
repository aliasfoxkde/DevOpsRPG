import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          DevOpsQuest
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/learn" className="hover:text-primary">Learn</Link>
          <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
        </div>
      </div>
    </nav>
  )
}
