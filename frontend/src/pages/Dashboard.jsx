import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    status: 'BUSY',
  });
  const [error, setError] = useState('');
  const { notifications } = useWebSocket();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Refresh events when swap is accepted/rejected
  useEffect(() => {
    const hasSwapNotification = notifications.some(
      n => n.type === 'SWAP_ACCEPTED' || n.type === 'SWAP_REJECTED'
    );
    if (hasSwapNotification) {
      fetchEvents();
    }
  }, [notifications]);

  const fetchEvents = async () => {
    try {
      const data = await eventAPI.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        endTime: new Date(event.endTime).toISOString().slice(0, 16),
        status: event.status,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        status: 'BUSY',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEvent) {
        await eventAPI.update(editingEvent._id, formData);
      } else {
        await eventAPI.create(formData);
      }
      await fetchEvents();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventAPI.delete(id);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleSwappable = async (event) => {
    const newStatus = event.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
    try {
      await eventAPI.update(event._id, { status: newStatus });
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Calendar</h1>
          {!user?.currentGroup && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              <strong>⚠️ No Active Group</strong> - Join or create a group to start swapping slots
              <button 
                className="btn btn-sm btn-primary" 
                style={{ marginLeft: '12px' }}
                onClick={() => navigate('/groups')}
              >
                Manage Groups
              </button>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-icon">📅</span>
            <h2>No events yet</h2>
            <p>Start by adding your first event to your calendar</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              Create Event
            </button>
          </div>
        ) : (
          <div className="events-grid grid grid-2">
            {events.map((event) => (
              <div key={event._id} className={`event-card card ${event.status.toLowerCase()}`}>
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className={`badge badge-${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="event-time">
                  <div>
                    <span className="time-icon">🕐</span>
                    <strong>Start:</strong> {formatDateTime(event.startTime)}
                  </div>
                  <div>
                    <span className="time-icon">🕐</span>
                    <strong>End:</strong> {formatDateTime(event.endTime)}
                  </div>
                </div>

                <div className="event-actions">
                  {event.status !== 'SWAP_PENDING' && (
                    <>
                      <button
                        className={`btn btn-sm ${event.status === 'SWAPPABLE' ? 'btn-outline' : 'btn-secondary'}`}
                        onClick={() => handleToggleSwappable(event)}
                      >
                        {event.status === 'SWAPPABLE' ? 'Mark as Busy' : 'Make Swappable'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleOpenModal(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(event._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {event.status === 'SWAP_PENDING' && (
                    <div className="alert alert-warning">
                      This event is involved in a pending swap request
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              
              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="BUSY">Busy</option>
                    <option value="SWAPPABLE">Swappable</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
