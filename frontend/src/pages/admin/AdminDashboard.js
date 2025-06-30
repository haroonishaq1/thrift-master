import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingBrands, setPendingBrands] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('brands'); // 'brands' or 'offers'
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
      
      // Load dashboard stats, pending brands, and pending offers
      const [statsResponse, pendingBrandsResponse, pendingOffersResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingBrands(),
        adminAPI.getPendingOffers()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (pendingBrandsResponse.success) {
        setPendingBrands(pendingBrandsResponse.data.pendingBrands || []);
      }

      if (pendingOffersResponse.success) {
        setPendingOffers(pendingOffersResponse.data.pendingOffers || []);
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
    if (selectedBrand) {
      return confirmBrandAction();
    } else if (selectedOffer) {
      return confirmOfferAction();
    }
  };

  const confirmBrandAction = async () => {
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

  const confirmOfferAction = async () => {
    if (!selectedOffer) return;
    
    setIsProcessing(true);
    try {
      let response;
      
      if (modalType === 'approve') {
        response = await adminAPI.approveOffer(selectedOffer.id);
      } else {
        response = await adminAPI.rejectOffer(selectedOffer.id, rejectReason || 'Rejected by admin');
      }
      
      if (response.success) {
        const action = modalType === 'approve' ? 'approved' : 'rejected';
        const actionPast = modalType === 'approve' ? 'Approved' : 'Rejected';
        
        setSuccessMessage({
          type: modalType,
          message: `${actionPast} Successfully`,
          details: `Offer "${selectedOffer.title}" has been ${action}.`
        });
        
        setShowModal(false);
        loadDashboardData(); // Reload data
        
        // Clear success message after 4 seconds
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert(`❌ Failed to ${modalType} offer: ${response.message}`);
      }
    } catch (error) {
      console.error(`❌ Error ${modalType}ing offer:`, error);
      alert(`❌ Failed to ${modalType} offer`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Offer approval handlers
  const handleOfferApprove = (offer) => {
    setSelectedOffer(offer);
    setModalType('approve');
    setShowModal(true);
  };

  const handleOfferReject = (offer) => {
    setSelectedOffer(offer);
    setModalType('reject');
    setShowModal(true);
  };

  // Brand approval handlers  
  const handleBrandApprove = (brand) => {
    setSelectedBrand(brand);
    setModalType('approve');
    setShowModal(true);
  };

  const handleBrandReject = (brand) => {
    setSelectedBrand(brand);
    setModalType('reject');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBrand(null);
    setSelectedOffer(null);
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

        {/* Management Tabs */}
        <div className="management-tabs">
          <button 
            className={`tab-button ${activeTab === 'brands' ? 'active' : ''}`}
            onClick={() => setActiveTab('brands')}
          >
            Pending Brands ({pendingBrands.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            Pending Offers ({pendingOffers.length})
          </button>
        </div>

        {/* Pending Brands Section */}
        {activeTab === 'brands' && (
          <div className="pending-section">
            <h2>Pending Brand Approvals</h2>
            {pendingBrands.length === 0 ? (
              <div className="empty-state">
                <p>✅ No pending brand approvals at the moment!</p>
              </div>
            ) : (
              <div className="pending-items">
                {pendingBrands.map((brand) => (
                  <div key={brand.id} className="pending-item">
                    <div className="item-info">
                      <div className="item-header">
                        <h3>{brand.name}</h3>
                        <span className="item-type">Brand</span>
                      </div>
                      <div className="item-details">
                        <p><strong>Email:</strong> {brand.email}</p>
                        <p><strong>Website:</strong> {brand.website || 'Not provided'}</p>
                        <p><strong>Description:</strong> {brand.description}</p>
                        <p><strong>Submitted:</strong> {new Date(brand.created_at).toLocaleDateString()}</p>
                      </div>
                      {brand.logo && (
                        <div className="brand-logo">
                          <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${brand.logo}`} alt={brand.name} />
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleBrandApprove(brand)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleBrandReject(brand)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Offers Section */}
        {activeTab === 'offers' && (
          <div className="pending-section">
            <h2>Pending Offer Approvals</h2>
            {pendingOffers.length === 0 ? (
              <div className="empty-state">
                <p>✅ No pending offer approvals at the moment!</p>
              </div>
            ) : (
              <div className="pending-items">
                {pendingOffers.map((offer) => (
                  <div key={offer.id} className="pending-item">
                    <div className="item-info">
                      <div className="item-header">
                        <h3>{offer.title}</h3>
                        <span className="item-type">Offer</span>
                      </div>
                      <div className="item-details">
                        <p><strong>Brand:</strong> {offer.brand_name}</p>
                        <p><strong>Discount:</strong> {offer.discount_percent}% OFF</p>
                        <p><strong>Category:</strong> {offer.category}</p>
                        <p><strong>Description:</strong> {offer.description}</p>
                        <p><strong>Valid Until:</strong> {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString() : 'No expiry'}</p>
                        <p><strong>Submitted:</strong> {new Date(offer.created_at).toLocaleDateString()}</p>
                      </div>
                      {offer.image_url && (
                        <div className="offer-image">
                          <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${offer.image_url}`} alt={offer.title} />
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleOfferApprove(offer)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleOfferReject(offer)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                {selectedBrand 
                  ? (modalType === 'approve' ? 'Approve Brand' : 'Reject Brand')
                  : (modalType === 'approve' ? 'Approve Offer' : 'Reject Offer')
                }
              </h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <p>
                Are you sure you want to <strong>{modalType}</strong> the {selectedBrand ? 'brand' : 'offer'} <strong>"{selectedBrand?.name || selectedOffer?.title}"</strong>?
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
