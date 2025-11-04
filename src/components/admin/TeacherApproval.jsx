import { useState, useEffect } from 'react';
import { 
  getPendingTeacherRequests, 
  approveTeacher, 
  rejectTeacher 
} from '../../services/firebaseDb';
import { getCurrentAdmin } from '../../services/session';

const TeacherApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const admin = getCurrentAdmin();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const pendingRequests = await getPendingTeacherRequests();
      setRequests(pendingRequests);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load teacher requests' });
      console.error('Error loading teacher requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!admin?.id) {
      setMessage({ type: 'error', text: 'Admin not authenticated' });
      return;
    }

    if (!window.confirm('Are you sure you want to approve this teacher?')) {
      return;
    }

    try {
      setLoading(true);
      await approveTeacher(requestId, admin.id);
      setMessage({ type: 'success', text: 'Teacher approved successfully' });
      await loadRequests();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to approve teacher' 
      });
      console.error('Error approving teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!admin?.id) {
      setMessage({ type: 'error', text: 'Admin not authenticated' });
      return;
    }

    if (!rejectReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for rejection' });
      return;
    }

    try {
      setLoading(true);
      await rejectTeacher(requestId, admin.id, rejectReason);
      setMessage({ type: 'success', text: 'Teacher request rejected' });
      setRejectReason('');
      setRejectingId(null);
      await loadRequests();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to reject teacher request' 
      });
      console.error('Error rejecting teacher request:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleString();
  };

  return (
    <div className="admin-card">
      <h3>Teacher Registration Requests</h3>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && !requests.length ? (
        <p>Loading teacher requests...</p>
      ) : requests.length === 0 ? (
        <p>No pending teacher requests.</p>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h4>{request.name}</h4>
                <span className="request-date">
                  Requested on: {formatDate(request.createdAt)}
                </span>
              </div>
              
              <div className="request-details">
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Phone:</strong> {request.phone || 'N/A'}</p>
                <p><strong>Subject:</strong> {request.subject || 'Not specified'}</p>
              </div>

              <div className="request-actions">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={loading}
                >
                  Approve
                </button>
                
                {rejectingId === request.id ? (
                  <div className="reject-form">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection"
                      className="form-control"
                    />
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(request.id)}
                      disabled={!rejectReason.trim() || loading}
                    >
                      Confirm Reject
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setRejectingId(request.id)}
                    disabled={loading}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherApproval;
