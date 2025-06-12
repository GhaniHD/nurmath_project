import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const missions = ['misi-1', 'misi-2', 'misi-3'];

  return (
    <div className="w-64 bg-blue-800 text-white h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/story-telling"
              className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            >
              Story Telling
            </NavLink>
          </li>
          <li>
            <span className="block p-2 font-bold">Data</span>
            <ul className="pl-4 space-y-1">
              {missions.map((mission) => (
                <li key={mission}>
                  <NavLink
                    to={`/data/${mission}`}
                    className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
                  >
                    {mission.replace('misi-', 'Misi ')}
                  </NavLink>
                  <NavLink
                    to={`/data/${mission}/leaderboard`}
                    className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
                  >
                    Leaderboard
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <span className="block p-2 font-bold">Diagram</span>
            <ul className="pl-4 space-y-1">
              {missions.map((mission) => (
                <li key={mission}>
                  <NavLink
                    to={`/diagram/${mission}`}
                    className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
                  >
                    {mission.replace('misi-', 'Misi ')}
                  </NavLink>
                  <NavLink
                    to={`/diagram/${mission}/leaderboard`}
                    className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
                  >
                    Leaderboard
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <NavLink
              to="/angket"
              className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            >
              Angket Kepuasan
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/questions"
              className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            >
              Panel Admin
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;