import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-blue-800 text-white h-screen p-4 fixed top-0 left-0">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400">Panel Admin</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/admin/questions"
              className={({ isActive }) =>
                `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`
              }
            >
              Kelola Soal
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/leaderboard"
              className={({ isActive }) =>
                `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`
              }
            >
              Leaderboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/feedback"
              className={({ isActive }) =>
                `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`
              }
            >
              Feedback
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`
              }
            >
              Kembali ke Dashboard
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;