import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './GroupManagement.css';

const GroupManagement = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create group form
  const [createForm, setCreateForm] = useState({
    name: '',
    groupType: 'friends',
    description: '',
  });
  const [generatedCode, setGeneratedCode] = useState('');

  // Join group form
  const [joinCode, setJoinCode] = useState('');

  // Load user's groups on mount
  useEffect(() => {
    loadMyGroups();
  }, []);

  const loadMyGroups = async () => {
    try {
      const groups = await groupAPI.getMyGroups();
      setMyGroups(groups);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratedCode('');

    if (!createForm.name.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);

    try {
      const data = await groupAPI.createGroup(
        createForm.name,
        createForm.groupType,
        createForm.description
      );

      setGeneratedCode(data.group.code);
      setSuccess(`Group "${data.group.name}" created successfully!`);
      setCreateForm({ name: '', groupType: 'friends', description: '' });
      
      // Reload groups and update user
      await loadMyGroups();
      if (data.updatedUser) {
        updateUser(data.updatedUser);
      }

      // If this is user's first group, navigate to dashboard
      if (!user.currentGroup) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!joinCode.trim()) {
      setError('Please enter a group code');
      return;
    }

    setLoading(true);

    try {
      const data = await groupAPI.joinGroup(joinCode.toUpperCase());
      setSuccess(`Successfully joined "${data.group.name}"!`);
      setJoinCode('');
      
      // Reload groups and update user
      await loadMyGroups();
      if (data.updatedUser) {
        updateUser(data.updatedUser);
      }

      // If this is user's first group, navigate to dashboard
      if (!user.currentGroup) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchGroup = async (groupId) => {
    try {
      const data = await groupAPI.switchGroup(groupId);
      updateUser(data.user);
      setSuccess('Switched group successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveGroup = async (groupId, groupName) => {
    if (!confirm(`Are you sure you want to leave "${groupName}"?`)) {
      return;
    }

    try {
      const data = await groupAPI.leaveGroup(groupId);
      setSuccess(`Left "${groupName}" successfully`);
      await loadMyGroups();
      if (data.updatedUser) {
        updateUser(data.updatedUser);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Code copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="group-management-page">
      <div className="group-container">
        <h1>Group Management</h1>
        <p className="subtitle">Create a new group or join an existing one with an invite code</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Group
          </button>
          <button
            className={`tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            Join Group
          </button>
          <button
            className={`tab ${activeTab === 'mygroups' ? 'active' : ''}`}
            onClick={() => setActiveTab('mygroups')}
          >
            My Groups {myGroups.length > 0 && `(${myGroups.length})`}
          </button>
        </div>

        {/* Create Group Tab */}
        {activeTab === 'create' && (
          <div className="tab-content card">
            <h2>Create a New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="input-group">
                <label htmlFor="name">Group Name *</label>
                <input
                  type="text"
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Marketing Team, CS 101 Study Group"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="groupType">Group Type *</label>
                <select
                  id="groupType"
                  value={createForm.groupType}
                  onChange={(e) => setCreateForm({ ...createForm, groupType: e.target.value })}
                  required
                >
                  <option value="workplace">Workplace</option>
                  <option value="academic">Academic</option>
                  <option value="community">Community</option>
                  <option value="friends">Friends</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="What's this group for?"
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </form>

            {generatedCode && (
              <div className="code-display">
                <h3>✅ Group Created!</h3>
                <p>Share this code with others to invite them:</p>
                <div className="code-box">
                  <span className="code">{generatedCode}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(generatedCode)}
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="hint">This code is unique to your group. Keep it safe!</p>
              </div>
            )}
          </div>
        )}

        {/* Join Group Tab */}
        {activeTab === 'join' && (
          <div className="tab-content card">
            <h2>Join an Existing Group</h2>
            <p>Enter the 6-character invite code you received:</p>
            <form onSubmit={handleJoinGroup}>
              <div className="input-group">
                <label htmlFor="joinCode">Invite Code *</label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., A3F2C1"
                  maxLength="6"
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Joining...' : 'Join Group'}
              </button>
            </form>
          </div>
        )}

        {/* My Groups Tab */}
        {activeTab === 'mygroups' && (
          <div className="tab-content">
            <h2>My Groups</h2>
            {myGroups.length === 0 ? (
              <div className="card empty-state">
                <p>You haven't joined any groups yet.</p>
                <p>Create a new group or join one with an invite code!</p>
              </div>
            ) : (
              <div className="groups-list">
                {myGroups.map((group) => (
                  <div key={group._id} className="group-card card">
                    <div className="group-header">
                      <h3>
                        {group.name}
                        {user.currentGroup?._id === group._id && (
                          <span className="badge badge-active">Active</span>
                        )}
                      </h3>
                      <span className="group-type">{group.groupType}</span>
                    </div>
                    {group.description && <p className="group-description">{group.description}</p>}
                    <div className="group-meta">
                      <span>👥 {group.members?.length || 0} members</span>
                      <span>🔑 Code: <strong>{group.code}</strong></span>
                    </div>
                    <div className="group-actions">
                      {user.currentGroup?._id !== group._id && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleSwitchGroup(group._id)}
                        >
                          Switch to This Group
                        </button>
                      )}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => copyToClipboard(group.code)}
                      >
                        📋 Copy Code
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleLeaveGroup(group._id, group.name)}
                      >
                        Leave Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {user.currentGroup && (
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;
