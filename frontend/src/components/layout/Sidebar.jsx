import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, UserCog, Users } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // puedes cambiar esto después si eliminas login
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-wider">
          HOTEL<span className="text-blue-500">DB</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 mt-6 flex flex-col gap-2">
        
        {/* ADMIN */}
        <NavLink
          to="/admin"
          className={({isActive}) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`
          }
        >
          <UserCog size={20} /> Admin
        </NavLink>

        {/* RECEPCIONISTA */}
        <NavLink
          to="/recepcionista"
          className={({isActive}) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`
          }
        >
          <Users size={20} /> Recepcionista
        </NavLink>

        {/* USUARIO */}
        <NavLink
          to="/usuario"
          className={({isActive}) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`
          }
        >
          <ShoppingBag size={20} /> Usuario
        </NavLink>

      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:bg-slate-800 w-full px-4 py-3 rounded-lg transition"
        >
          <LogOut size={20} /> Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;