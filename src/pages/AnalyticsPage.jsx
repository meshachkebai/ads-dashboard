import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import StatCard from '../components/shared/StatCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const accessCodeId = localStorage.getItem('access_code_id');
      
      const { data: submissions } = await supabase
        .from('ad_campaign_submissions')
        .select(`
          *,
          interactive_ad_campaigns (
            id,
            is_active
          )
        `)
        .eq('brand_access_code_id', accessCodeId);

      const totalCampaigns = submissions?.length || 0;
      const activeCampaigns = submissions?.filter(s => s.status === 'live').length || 0;
      const liveCampaigns = submissions?.filter(s => s.interactive_ad_campaigns?.is_active).length || 0;

      setAnalytics({
        totalCampaigns,
        activeCampaigns,
        liveCampaigns,
        pendingReview: submissions?.filter(s => s.status === 'under_review').length || 0
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      <div className="analytics-grid">
        <StatCard
          label="Total Campaigns"
          value={analytics.totalCampaigns}
        />
        <StatCard
          label="Live Campaigns"
          value={analytics.activeCampaigns}
        />
        <StatCard
          label="Active in System"
          value={analytics.liveCampaigns}
        />
        <StatCard
          label="Pending Review"
          value={analytics.pendingReview}
        />
      </div>

      <div className="analytics-section">
        <h2>Campaign Performance</h2>
        <div className="placeholder-chart">
          <p>📊 Chart visualization coming soon</p>
        </div>
      </div>
    </div>
  );
}
