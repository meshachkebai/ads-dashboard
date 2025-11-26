import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useBrandAuth } from '../hooks/useBrandAuth';
import StatCard from '../components/shared/StatCard';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { accessCodeId } = useBrandAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingApproval: 0,
    totalImpressions: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [accessCodeId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get submissions for this brand
      const { data: submissions, error: submissionsError } = await supabase
        .from('ad_campaign_submissions')
        .select(`
          *,
          interactive_ad_campaigns (
            id,
            name,
            brand_name,
            ad_type,
            created_at
          )
        `)
        .eq('brand_access_code_id', accessCodeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (submissionsError) throw submissionsError;

      // Calculate stats
      const totalCampaigns = submissions?.length || 0;
      const activeCampaigns = submissions?.filter(s => s.status === 'live').length || 0;
      const pendingApproval = submissions?.filter(s => s.status === 'submitted' || s.status === 'under_review').length || 0;

      setStats({
        totalCampaigns,
        activeCampaigns,
        pendingApproval,
        totalImpressions: 0 // TODO: Calculate from analytics
      });

      setRecentCampaigns(submissions || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'status-draft' },
      submitted: { label: 'Submitted', className: 'status-submitted' },
      under_review: { label: 'Under Review', className: 'status-review' },
      approved: { label: 'Approved', className: 'status-approved' },
      rejected: { label: 'Rejected', className: 'status-rejected' },
      live: { label: 'Live', className: 'status-live' }
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Overview</h1>
        <button className="btn btn-primary" onClick={() => navigate('/create')}>
          + Create Campaign
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Campaigns"
          value={stats.totalCampaigns}
          loading={loading}
        />
        <StatCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          loading={loading}
        />
        <StatCard
          label="Pending Approval"
          value={stats.pendingApproval}
          loading={loading}
        />
        <StatCard
          label="Total Impressions"
          value={stats.totalImpressions.toLocaleString()}
          loading={loading}
        />
      </div>

      <div className="recent-campaigns-section">
        <h2>Recent Campaigns</h2>
        
        {loading ? (
          <div className="loading-state">Loading campaigns...</div>
        ) : recentCampaigns.length === 0 ? (
          <div className="empty-state card">
            <p>No campaigns yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="campaigns-list">
            {recentCampaigns.map((submission) => (
              <div key={submission.id} className="campaign-card card">
                <div className="campaign-header">
                  <div>
                    <h3>{submission.interactive_ad_campaigns?.name || 'Untitled Campaign'}</h3>
                    <p className="campaign-type">{submission.interactive_ad_campaigns?.ad_type}</p>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
                
                <div className="campaign-meta">
                  <span>Created: {new Date(submission.created_at).toLocaleDateString()}</span>
                  {submission.submitted_at && (
                    <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="campaign-actions">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/campaigns/${submission.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}