import { useState, useEffect } from 'react';
import { 
  setClassRollNumberRange, 
  getAllClassSettings,
  deleteClassSettings
} from '../../services/firebaseDb';

// Icons
const EditIcon = () => (
  <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ClassSettings = () => {
  const [classSettings, setClassSettings] = useState([]);
  const [formData, setFormData] = useState({
    className: '',
    startRoll: '',
    endRoll: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);

  // Load class settings on component mount
  useEffect(() => {
    loadClassSettings();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'className' ? value.toUpperCase() : value
    }));
  };

  // Load all class settings from Firebase
  const loadClassSettings = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const settings = await getAllClassSettings();
      setClassSettings(settings || []);
    } catch (error) {
      console.error('Error loading class settings:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load class settings. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { className, startRoll, endRoll } = formData;
    
    // Validation
    if (!className || !startRoll || !endRoll) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    const start = parseInt(startRoll, 10);
    const end = parseInt(endRoll, 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end < 1) {
      setMessage({ type: 'error', text: 'Roll numbers must be positive numbers' });
      return;
    }

    if (start > end) {
      setMessage({ type: 'error', text: 'Start roll cannot be greater than end roll' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      await setClassRollNumberRange(className, start, end, editingId);
      
      setMessage({ 
        type: 'success', 
        text: editingId 
          ? 'Class updated successfully' 
          : 'Class added successfully' 
      });
      
      // Reset form
      setFormData({ className: '', startRoll: '', endRoll: '' });
      setEditingId(null);
      
      // Refresh the list
      await loadClassSettings();
      
    } catch (error) {
      console.error('Error saving class settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to save class settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle edit action
  const handleEdit = (cls) => {
    setFormData({
      className: cls.className,
      startRoll: cls.rollNumberRange.start.toString(),
      endRoll: cls.rollNumberRange.end.toString()
    });
    setEditingId(cls.id);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteClassSettings(id);
      setMessage({ type: 'success', text: 'Class deleted successfully' });
      await loadClassSettings();
    } catch (error) {
      console.error('Error deleting class:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to delete class' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setFormData({ className: '', startRoll: '', endRoll: '' });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="admin-card">
      <h3>Class Roll Number Management</h3>
      
      {/* Status Message */}
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="className">Class Name</label>
            <input
              id="className"
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              placeholder="e.g., BSCS-2023"
              required
              disabled={loading || saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="startRoll">Start Roll No</label>
            <input
              id="startRoll"
              type="number"
              name="startRoll"
              min="1"
              value={formData.startRoll}
              onChange={handleChange}
              placeholder="1"
              required
              disabled={loading || saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endRoll">End Roll No</label>
            <input
              id="endRoll"
              type="number"
              name="endRoll"
              min={formData.startRoll || 1}
              value={formData.endRoll}
              onChange={handleChange}
              placeholder="100"
              required
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : editingId ? 'Update Class' : 'Add Class'}
          </button>
          
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={loading || saving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Class List */}
      <div className="class-list">
        <div className="section-header">
          <h4>Current Class Settings</h4>
          <button 
            className="btn btn-sm btn-outline"
            onClick={loadClassSettings}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        
        {loading && classSettings.length === 0 ? (
          <div className="loading-state">Loading class settings...</div>
        ) : classSettings.length === 0 ? (
          <div className="empty-state">No class settings found. Add a new class above.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Roll Number Range</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classSettings.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.className}</td>
                    <td>{cls.rollNumberRange.start} - {cls.rollNumberRange.end}</td>
                    <td className="actions">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(cls)}
                        disabled={loading}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="btn-icon danger"
                        onClick={() => handleDelete(cls.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSettings;
