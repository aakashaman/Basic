import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user, setIsAuthenticated }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');
  const [editingTasks, setEditingTasks] = useState({});
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/todos`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTodos(data);
        const initialEditingTasks = {};
        data.forEach((todo) => {
          initialEditingTasks[todo.id] = todo.task;
        });
        setEditingTasks(initialEditingTasks);
      } else {
        setError(data.error || 'Failed to fetch todos');
      }
    } catch (err) {
      setError('Failed to fetch todos');
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ task: newTodo }),
      });
      const data = await response.json();
      if (response.ok) {
        setTodos([...todos, data]);
        setEditingTasks({ ...editingTasks, [data.id]: data.task });
        setNewTodo('');
      } else {
        setError(data.message || 'Failed to add todo');
      }
    } catch (err) {
      setError('Failed to add todo');
    }
  };

  const handleUpdateTodo = async (id) => {
    const task = editingTasks[id];
    if (!task.trim()) {
      setError('Task cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ task }),
      });
      const updatedTodo = await response.json();
      if (response.ok) {
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      } else {
        setError(updatedTodo.message || 'Failed to update todo');
      }
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
        const updatedEditingTasks = { ...editingTasks };
        delete updatedEditingTasks[id];
        setEditingTasks(updatedEditingTasks);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete todo');
      }
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  const handleTaskChange = (id, value) => {
    setEditingTasks({ ...editingTasks, [id]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1 className="navbar-title">Todo App</h1>
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </nav>
      <h2>Welcome, {user.username}!</h2>
      {error && <p className="error">{error}</p>}
      <div className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo"
        />
        <button onClick={handleAddTodo}>Add Todo</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="text"
              value={editingTasks[todo.id] || todo.task}
              onChange={(e) => handleTaskChange(todo.id, e.target.value)}
            />
            <button onClick={() => handleUpdateTodo(todo.id)}>Update</button>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;