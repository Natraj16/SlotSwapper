import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { swapAPI, eventAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Marketplace.css';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    // If user has no active group, don't fetch
    if (!user?.currentGroup) {
      setLoading(false);
      return;
    }

    try {
      const [slots, myEvents] = await Promise.all([
        swapAPI.getSwappableSlots(),
        eventAPI.getAll(),
      ]);
      setSwappableSlots(slots);
      setMySwappableSlots(myEvents.filter(e => e.status === 'SWAPPABLE'));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setSelectedMySlot('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedMySlot('');
    setError('');
  };

  const handleSubmitSwap = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMySlot) {
      setError('Please select one of your swappable slots');
      return;
    }

    try {
      await swapAPI.createSwapRequest(selectedMySlot, selectedSlot._id);
      setSuccess('Swap request sent successfully!');
      setTimeout(() => {
        handleCloseModal();
        fetchData();
      }, 1500);
    } catch (err) {
      setError(err.message);
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

  // If user has no active group
  if (!user?.currentGroup) {
    return (
      <div className="marketplace-page">
        <div className="container">
          <div className="empty-state card">
            <h2>No Active Group</h2>
            <p>You need to create or join a group to access the marketplace.</p>
            <p>Groups allow you to swap time slots with other members.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/groups')}
            >
              Go to Group Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="container">
        <div className="marketplace-header">
          <h1>Marketplace</h1>
          <p className="subtitle">Browse and swap available time slots in your group</p>
          <div className="alert alert-info" style={{ marginTop: '16px' }}>
            <strong>👥 {user.currentGroup.name}</strong> - Showing slots from members in this group
          </div>
        </div>

        {swappableSlots.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-icon">🛒</span>
            <h2>No swappable slots available</h2>
            <p>Check back later or ask your team to mark slots as swappable</p>
          </div>
        ) : (
          <div className="slots-grid grid grid-2">
            {swappableSlots.map((slot) => (
              <div key={slot._id} className="slot-card card">
                <div className="slot-header">
                  <h3>{slot.title}</h3>
                  <span className="badge badge-swappable">Available</span>
                </div>

                <div className="slot-owner">
                  <span className="owner-icon">👤</span>
                  <div>
                    <strong>{slot.userId.name}</strong>
                    <p className="owner-email">{slot.userId.email}</p>
                  </div>
                </div>

                <div className="slot-time">
                  <div>
                    <span className="time-icon">📅</span>
                    <strong>Start:</strong> {formatDateTime(slot.startTime)}
                  </div>
                  <div>
                    <span className="time-icon">📅</span>
                    <strong>End:</strong> {formatDateTime(slot.endTime)}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleRequestSwap(slot)}
                  style={{ width: '100%' }}
                >
                  Request Swap
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Swap Request Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h2>Request Swap</h2>
              
              <div className="selected-slot-info">
                <h3>You want this slot:</h3>
                <div className="info-box">
                  <p><strong>{selectedSlot.title}</strong></p>
                  <p>{formatDateTime(selectedSlot.startTime)} - {formatDateTime(selectedSlot.endTime)}</p>
                  <p className="owner-name">Owner: {selectedSlot.userId.name}</p>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {mySwappableSlots.length === 0 ? (
                <div className="alert alert-warning">
                  You don't have any swappable slots to offer. Please mark a slot as 
                  swappable in your dashboard first.
                </div>
              ) : (
                <form onSubmit={handleSubmitSwap}>
                  <div className="input-group">
                    <label>Select your slot to offer:</label>
                    <select
                      value={selectedMySlot}
                      onChange={(e) => setSelectedMySlot(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a slot --</option>
                      {mySwappableSlots.map((slot) => (
                        <option key={slot._id} value={slot._id}>
                          {slot.title} ({formatDateTime(slot.startTime)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
