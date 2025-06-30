import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingBrands, setPendingBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats and pending brands
      const [statsResponse, pendingResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingBrands()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (pendingResponse.success) {
        setPendingBrands(pendingResponse.data.pendingBrands || []);
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBrand = (brandId, brandName) => {
    setSelectedBrand({ id: brandId, name: brandName });
    setModalType('approve');
    setShowModal(true);
  };

  const handleRejectBrand = (brandId, brandName) => {
    setSelectedBrand({ id: brandId, name: brandName });
    setModalType('reject');
    setRejectReason('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedBrand) return;
    
    setIsProcessing(true);
    try {
      let response;
      
      if (modalType === 'approve') {
        response = await adminAPI.approveBrand(selectedBrand.id, 'Approved by admin');
      } else {
        response = await adminAPI.rejectBrand(selectedBrand.id, rejectReason || 'Rejected by admin');
      }
      
      if (response.success) {
        const action = modalType === 'approve' ? 'approved' : 'rejected';
        const actionPast = modalType === 'approve' ? 'Approved' : 'Rejected';
        
        setSuccessMessage({
          type: modalType,
          message: `${actionPast} Successfully`,
          details: `Brand "${selectedBrand.name}" has been ${action} and notified via email.`
        });
        
        setShowModal(false);
        loadDashboardData(); // Reload data
        
        // Clear success message after 4 seconds
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert(`❌ Failed to ${modalType} brand: ${response.message}`);
      }
    } catch (error) {
      console.error(`❌ Error ${modalType}ing brand:`, error);
      alert(`❌ Failed to ${modalType} brand`);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBrand(null);
    setRejectReason('');
    setModalType('');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-logo">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="dashboard-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <div className="welcome-section">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Manage brand approvals and monitor system statistics from here.</p>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Total Brands</h3>
              <p>Total number of registered brands in the system</p>
              <div className="stat-number">{stats.totalBrands}</div>
            </div>
            <div className="dashboard-card">
              <h3>Pending Approval</h3>
              <p>Brands waiting for admin approval</p>
              <div className="stat-number pending">{stats.pendingBrands}</div>
            </div>
            <div className="dashboard-card">
              <h3>Approved</h3>
              <p>Successfully approved and active brands</p>
              <div className="stat-number approved">{stats.approvedBrands}</div>
            </div>
            <div className="dashboard-card">
              <h3>Rejected</h3>
              <p>Brands that were rejected during review</p>
              <div className="stat-number rejected">{stats.rejectedBrands}</div>
            </div>
          </div>
        )}

        {/* Pending Brands Section */}
        <div className="pending-brands-section">
          <h2>Pending Brand Approvals ({pendingBrands.length})</h2>
          
          {pendingBrands.length === 0 ? (
            <div className="dashboard-card">
              <h3>All Caught Up!</h3>
              <p>No pending brand approvals at this time.</p>
            </div>
          ) : (
            <div className="dashboard-cards">
              {pendingBrands.map((brand) => (
                <div key={brand.id} className="dashboard-card">
                  <h3>{brand.name}</h3>
                  <div className="brand-details" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {brand.logo && (
                      <div className="brand-logo-preview" style={{ minWidth: 120, maxWidth: 120, minHeight: 70, maxHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={`http://localhost:5000${brand.logo}`} alt={brand.name + ' logo'} className="brand-logo-img" style={{ width: 110, height: 60, objectFit: 'contain', borderRadius: 8, background: '#f8f8f8', border: '1px solid #eee' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                      <p style={{ margin: 0 }}><strong>Email:</strong> {brand.email}</p>
                      <p style={{ margin: 0 }}><strong>Website:</strong> {brand.website}</p>
                    </div>
                  </div>
                  <div className="brand-actions">
                    <button 
                      onClick={() => handleApproveBrand(brand.id, brand.name)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectBrand(brand.id, brand.name)}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className={`success-notification ${successMessage.type === 'reject' ? 'reject-notification' : 'approve-notification'}`}>
          <div className="success-content">
            <div className="success-text">
              <div className="success-title">{successMessage.message}</div>
              <div className="success-details">{successMessage.details}</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {modalType === 'approve' ? 'Approve Brand' : 'Reject Brand'}
              </h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <p>
                Are you sure you want to <strong>{modalType}</strong> the brand <strong>"{selectedBrand?.name}"</strong>?
              </p>
              
              {modalType === 'reject' && (
                <div className="reject-reason-section">
                  <label htmlFor="rejectReason">Rejection Reason (Optional):</label>
                  <textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows="3"
                  />
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn" 
                onClick={closeModal}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`modal-btn ${modalType === 'approve' ? 'approve-btn' : 'reject-btn'}`}
                onClick={confirmAction}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : (modalType === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
