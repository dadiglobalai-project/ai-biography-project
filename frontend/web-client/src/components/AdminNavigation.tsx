import { NavLink, Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, LayoutDashboard, LogOut, RotateCcw, Settings, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';
import './admin.css';

export function AdminHeader() {
  return (
    <header className="admin-header">
      <Link to="/" className="admin-brand"><span className="admin-logo-mark"><BrandLogo variant="mark" /></span>Xinghuoji<span className="admin-brand-divider" /> <small>ADMIN</small></Link>
      <div className="admin-header-actions">
        <Link to="/" className="admin-site-link">View website <ArrowUpRight size={15} /></Link>
        <Link to="/account-settings" className="admin-profile" aria-label="Admin account settings"><span>AD</span><div>Administrator<small>Account settings</small></div></Link>
      </div>
    </header>
  );
}

export function AdminNavigation({ onLogout }: { onLogout: () => Promise<void> }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-workspace"><ShieldCheck size={21} /><div>Admin workspace<small>Manage your community</small></div></div>
      <p className="admin-nav-label">WORKSPACE</p>
      <nav aria-label="Admin navigation">
        <NavLink to="/admin/memberships" className={({ isActive }) => isActive ? 'active' : ''}><LayoutDashboard size={18} />Membership activation</NavLink>
        <NavLink to="/admin/refunds" className={({ isActive }) => isActive ? 'active' : ''}><RotateCcw size={18} />Refund requests</NavLink>
      </nav>
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-note"><BookOpen size={22} /><p>Every story matters.</p><span>A little care keeps every legacy in good hands.</span></div>
        <Link to="/account-settings"><Settings size={18} />Account settings</Link>
        <button type="button" onClick={() => void onLogout()}><LogOut size={18} />Sign out</button>
      </div>
    </aside>
  );
}
