import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './CreateCampaignPage.css';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    target_audience: '',
    ad_type: 'standard',
    priority: '1',
    status: 'draft'
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const accessCodeId = localStorage.getItem('access_code_id');
      const brandName = localStorage.getItem('brand_name');
      
      // First create the campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('interactive_ad_campaigns')
        .insert([{
          brand_name: brandName,
          name: formData.name,
          ad_type: formData.ad_type || 'standard',
          priority: parseInt(formData.priority) || 1,
          is_active: formData.status === 'active'
        }])
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Then create the submission linking the brand to the campaign
      const { error: submissionError } = await supabase
        .from('ad_campaign_submissions')
        .insert([{
          brand_access_code_id: accessCodeId,
          campaign_id: campaign.id,
          status: formData.status === 'active' ? 'submitted' : 'draft',
          metadata: {
            description: formData.description,
            budget: parseFloat(formData.budget),
            target_audience: formData.target_audience
          }
        }]);

      if (submissionError) throw submissionError;
      
      navigate('/dashboard/campaigns');
    } catch (err) {
      alert('Error creating campaign: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-campaign-page">
      <div className="page-header">
        <h1>Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-group">
          <label htmlFor="name">Campaign Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter campaign name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your campaign goals and strategy"
          />
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget ($) *</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="target_audience">Target Audience</label>
          <input
            type="text"
            id="target_audience"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            placeholder="e.g., 18-35, tech enthusiasts"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ad_type">Ad Type</label>
          <select
            id="ad_type"
            name="ad_type"
            value={formData.ad_type}
            onChange={handleChange}
          >
            <option value="standard">Standard</option>
            <option value="video">Video</option>
            <option value="interactive">Interactive</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority (1-10)</label>
          <input
            type="number"
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            min="1"
            max="10"
            placeholder="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/campaigns')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
