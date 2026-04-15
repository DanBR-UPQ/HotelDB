import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShoppingBag, Loader, AlertCircle, Plus, X } from 'lucide-react';

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '', precio: '', stock: '', imagen_url: '', categoria_id: 1, youtube_id: ''
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await api.get('/productos');
        setProductos(data);
      } catch (err) {
        if (err.message && err.message.includes('401')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, [navigate]);

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post('/productos', nuevoProducto);
      setProductos([...productos, data.producto]);
      setFormularioVisible(false);
      setNuevoProducto({ nombre: '', precio: '', stock: '', imagen_url: '', categoria_id: 1, youtube_id: '' });
    } catch (err) {
      alert("Error al crear el producto");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Inventario
        </h1>
        <button onClick={() => setFormularioVisible(!formularioVisible)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          {formularioVisible ? <><X size={20}/> Cancelar</> : <><Plus size={20}/> Nuevo Producto</>}
        </button>
      </div>

      {formularioVisible && (
        <form onSubmit={handleCrear} className="bg-white p-6 rounded-xl shadow-sm mb-8 grid grid-cols-2 gap-4 border border-slate-200">
          <input type="text" placeholder="Nombre" required className="p-2 border rounded" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
          <input type="number" placeholder="Precio" required className="p-2 border rounded" value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
          <input type="number" placeholder="Stock" className="p-2 border rounded" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
          <input type="text" placeholder="URL Imagen" className="p-2 border rounded" value={nuevoProducto.imagen_url} onChange={e => setNuevoProducto({...nuevoProducto, imagen_url: e.target.value})} />
          <input type="text" placeholder="ID YouTube (Ej: dQw4w9WgXcQ)" className="p-2 border rounded col-span-2" value={nuevoProducto.youtube_id} onChange={e => setNuevoProducto({...nuevoProducto, youtube_id: e.target.value})} />
          <button type="submit" className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold">Guardar Producto</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-100 overflow-hidden flex flex-col">
            <div className="h-48 bg-slate-900 flex items-center justify-center border-b overflow-hidden">
              {prod.youtube_id ? (
                <iframe width="100%" height="100%"
                        src={`https://www.youtube.com/embed/${prod.youtube_id}`}
                        title="YouTube video player" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
              ) : (
                <img src={prod.imagen_url || "https://via.placeholder.com/150"} alt={prod.nombre} className="max-h-full object-contain bg-white w-full" />
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{prod.nombre}</h3>
              <div className="flex justify-between items-center mt-auto pt-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">${prod.precio}</span>
                <span className="text-xs text-slate-400">Stock: {prod.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;