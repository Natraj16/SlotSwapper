import { useState, useEffect } from 'react';
import { swapAPI } from '../utils/api';
import { useWebSocket } from '../context/WebSocketContext';
import './Notifications.css';

const Notifications = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notifications, clearNotifications } = useWebSocket();

  useEffect(() => {
    fetchRequests();
  }, []);

  // Refresh when new notifications arrive
  useEffect(() => {
    const hasSwapNotification = notifications.some(
      n => n.type === 'NEW_SWAP_REQUEST' || n.type === 'SWAP_ACCEPTED' || n.type === 'SWAP_REJECTED'
    );
    if (hasSwapNotification) {
      fetchRequests();
    }
  }, [notifications]);

  const fetchRequests = async () => {
    try {
      const [incoming, outgoing] = await Promise.all([
        swapAPI.getIncomingRequests(),
        swapAPI.getOutgoingRequests(),
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, accept) => {
    try {
      await swapAPI.respondToSwap(requestId, accept);
      await fetchRequests();
      clearNotifications();
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
    <div className="notifications-page">
      <div className="container">
        <h1>Swap Requests</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Incoming Requests Section */}
        <section className="requests-section">
          <h2 className="section-title">
            <span className="title-icon">📥</span>
            Incoming Requests ({incomingRequests.length})
          </h2>

          {incomingRequests.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">📭</span>
              <p>No incoming swap requests</p>
            </div>
          ) : (
            <div className="requests-grid grid grid-2">
              {incomingRequests.map((request) => (
                <div key={request._id} className="request-card card incoming">
                  <div className="request-header">
                    <h3>Swap Request</h3>
                    <span className="badge badge-pending">{request.status}</span>
                  </div>

                  <div className="request-user">
                    <span className="user-icon">👤</span>
                    <strong>{request.initiatorId.name}</strong> wants to swap with you
                  </div>

                  <div className="swap-details">
                    <div className="swap-slot">
                      <div className="slot-label">They offer:</div>
                      <div className="slot-info offer-slot">
                        <strong>{request.initiatorSlotId.title}</strong>
                        <p>{formatDateTime(request.initiatorSlotId.startTime)}</p>
                        <p>{formatDateTime(request.initiatorSlotId.endTime)}</p>
                      </div>
                    </div>

                    <div className="swap-arrow">🔄</div>

                    <div className="swap-slot">
                      <div className="slot-label">For your:</div>
                      <div className="slot-info receive-slot">
                        <strong>{request.receiverSlotId.title}</strong>
                        <p>{formatDateTime(request.receiverSlotId.startTime)}</p>
                        <p>{formatDateTime(request.receiverSlotId.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="request-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleRespond(request._id, true)}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRespond(request._id, false)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Outgoing Requests Section */}
        <section className="requests-section">
          <h2 className="section-title">
            <span className="title-icon">📤</span>
            Outgoing Requests ({outgoingRequests.length})
          </h2>

          {outgoingRequests.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">📪</span>
              <p>No outgoing swap requests</p>
            </div>
          ) : (
            <div className="requests-grid grid grid-2">
              {outgoingRequests.map((request) => (
                <div key={request._id} className="request-card card outgoing">
                  <div className="request-header">
                    <h3>Your Request</h3>
                    <span className={`badge badge-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="request-user">
                    <span className="user-icon">👤</span>
                    Sent to <strong>{request.receiverId.name}</strong>
                  </div>

                  <div className="swap-details">
                    <div className="swap-slot">
                      <div className="slot-label">You offered:</div>
                      <div className="slot-info offer-slot">
                        <strong>{request.initiatorSlotId.title}</strong>
                        <p>{formatDateTime(request.initiatorSlotId.startTime)}</p>
                        <p>{formatDateTime(request.initiatorSlotId.endTime)}</p>
                      </div>
                    </div>

                    <div className="swap-arrow">🔄</div>

                    <div className="swap-slot">
                      <div className="slot-label">For their:</div>
                      <div className="slot-info receive-slot">
                        <strong>{request.receiverSlotId.title}</strong>
                        <p>{formatDateTime(request.receiverSlotId.startTime)}</p>
                        <p>{formatDateTime(request.receiverSlotId.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="alert alert-info">
                      Waiting for response...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Notifications;
