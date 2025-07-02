import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { isBrandAuthenticated, clearBrandAuth } from '../../utils/auth';
import { offersAPI } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../styles/brand/BrandAnalytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function BrandAnalytics() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    deleted: 0
  });
  const [activeOffer, setActiveOffer] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearsList, setYearsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for token and redirect to login if not present
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
    }
  }, [navigate]);

  // Calculate stats from offers (same logic as BrandOffers)
  const calculateStats = (offersData) => {
    const total = offersData.length;
    let active = 0;
    let expired = 0;
    
    offersData.forEach(offer => {
      const now = new Date();
      const isExpired = offer.valid_until ? new Date(offer.valid_until) < now : false;
      
      if (isExpired || offer.status === 'expired') {
        expired++;
      } else if (offer.status === 'active') {
        active++;
      }
    });
    
    return { total, active, expired };
  };
  
  // Load offers data from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        
        // Check authentication using our utility function
        if (!isBrandAuthenticated()) {
          throw new Error('You are not authenticated. Please login again.');
        }

        // Use the API service function
        const data = await offersAPI.getBrandOffers();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch offers');
        }
        
        setOffers(data.data);
        
        // Calculate and set stats
        const calculatedStats = calculateStats(data.data);
        setStats(calculatedStats);
        
        console.log('✅ Analytics data loaded successfully:', data.data);
        console.log('📊 Analytics stats calculated:', calculatedStats);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching analytics data:', err);
        setError(err.message);
        
        // Handle authentication errors
        if (err.message.includes('authentication') || err.message.includes('token')) {
          clearBrandAuth();
          navigate('/brand/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
      // Create a list of the last 10 years for the filter
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
    
    setYearsList(pastYears);
    
    // Set default selected year to the current year if not already set
    if (!selectedYear) {
      setSelectedYear(currentYear);
    }
    
  }, []);  // Remove selectedYear dependency since we now fetch data once
  
  // Update active offer and monthly data whenever offers change
  useEffect(() => {
    if (offers.length === 0) return;
    
    const now = new Date();
    
    // Find active offer (using correct field names)
    const active = offers.find(offer => {
      const expiryDate = offer.valid_until ? new Date(offer.valid_until) : null;
      return offer.status === 'active' && (!expiryDate || now < expiryDate);
    });
    
    // Set active offer details
    setActiveOffer(active);
    
    // Generate monthly data for selected year
    generateMonthlyData(selectedYear);
    
  }, [offers, selectedYear]);

  // Generate data for monthly offers chart
  const generateMonthlyData = (year) => {
    // Initialize array with zeros for all months
    const monthsData = Array(12).fill(0);
    
    // Count offers by month for the selected year (using correct field name)
    offers.forEach(offer => {
      const offerDate = new Date(offer.created_at); // Use created_at instead of createdAt
      const offerYear = offerDate.getFullYear();
      
      if (offerYear === year) {
        const month = offerDate.getMonth();
        monthsData[month]++;
      }
    });
    
    setMonthlyData(monthsData);
  };
  
  // Check if the latest offer has expired
  const isLatestOfferExpired = () => {
    if (offers.length === 0) return true;
    
    // Sort offers by creation date (newest first) - using correct field name
    const sortedOffers = [...offers].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at) // Use created_at instead of createdAt
    );
    
    const latestOffer = sortedOffers[0];
    const now = new Date();
    const expiryDate = new Date(latestOffer.valid_until); // Use valid_until instead of expiryDate
    
    return now > expiryDate || latestOffer.status === 'expired';
  };
  
  // Format a date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Chart configurations
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Offers Created',
        data: monthlyData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const statusChartData = {
    labels: ['Active', 'Expired', 'Deleted'],
    datasets: [
      {
        data: [stats.active, stats.expired, stats.deleted],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Offers Created in ${selectedYear}`,
      },
    },
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Offers Status Distribution',
      },
    },
  };
  
  return (
    <div className="brand-analytics-container">
      {isLoading ? (
        <div className="loading-container">
          <div>Loading...</div>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">
            <h3>Error Loading Analytics</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      ) : (
        <>
          <div className="analytics-header">
            <h2>Brand Analytics Dashboard</h2>
            <div className="year-filter">
              <label htmlFor="yearSelect">Select Year:</label>
              <select 
                id="yearSelect"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {yearsList.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="stats-cards-container">
        <div className="stats-card">
          <h3>Total Offers</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stats-card active">
          <h3>Active Offers</h3>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stats-card expired">
          <h3>Expired Offers</h3>
          <div className="stat-value">{stats.expired}</div>
        </div>
        <div className="stats-card deleted">
          <h3>Deleted Offers</h3>
          <div className="stat-value">{stats.deleted}</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-wrapper monthly-chart">
          <h3>Monthly Offer Creation Activity</h3>
          <div className="chart-container">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-wrapper status-chart">
          <h3>Offers Status Distribution</h3>
          <div className="chart-container pie-chart">
            <Pie data={statusChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
      
      <div className="analytics-actions">
        <button 
          onClick={() => navigate('/brand/dashboard')}
          className="back-button"
        >
          Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/brand/offers')}
          className="view-offers-button"
        >
          View All Offers
        </button>
      </div>
      </>
      )}
    </div>
  );
}

export default BrandAnalytics;
