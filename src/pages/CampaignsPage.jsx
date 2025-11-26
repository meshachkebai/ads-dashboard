import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import './CampaignsPage.css';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const accessCodeId = localStorage.getItem('access_code_id');
      
      const { data: submissions, error } = await supabase
        .from('ad_campaign_submissions')
        .select(`
          *,
          interactive_ad_campaigns (
            id,
            name,
            brand_name,
            ad_type,
            priority,
            is_active,
            created_at
          )
        `)
        .eq('brand_access_code_id', accessCodeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <h1>My Campaigns</h1>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState 
          title="No campaigns yet"
          message="Create your first campaign to get started"
        />
      ) : (
        <div className="campaigns-grid">
          {campaigns.map((submission) => (
            <div key={submission.id} className="campaign-card">
              <div className="campaign-header">
                <h3>{submission.interactive_ad_campaigns?.name || 'Untitled Campaign'}</h3>
                <span className={`status-badge status-${submission.status}`}>
                  {submission.status}
                </span>
              </div>
              <p className="campaign-type">Type: {submission.interactive_ad_campaigns?.ad_type || 'Standard'}</p>
              <p className="campaign-brand">Brand: {submission.interactive_ad_campaigns?.brand_name}</p>
              <div className="campaign-meta">
                <span>Priority: {submission.interactive_ad_campaigns?.priority || 1}</span>
                <span>Status: {submission.interactive_ad_campaigns?.is_active ? 'Active' : 'Inactive'}</span>
                <span>Created: {new Date(submission.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
