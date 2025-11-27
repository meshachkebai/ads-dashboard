import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { uploadAdToR2, getAudioDuration } from '../services/r2Upload';
import './CreateCampaignPage.css';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    target_audience: '',
    ad_type: 'audio',
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

      let audioUrl = null;
      let artworkUrl = null;
      let duration = 30;

      // Upload audio ad to R2 if audio file is provided
      if (audioFile && formData.ad_type === 'audio') {
        console.log('Uploading audio ad to R2...');
        
        // Get audio duration
        try {
          duration = await getAudioDuration(audioFile);
        } catch (err) {
          console.warn('Could not detect audio duration, using default 30s');
        }

        const uploadResult = await uploadAdToR2({
          audioFile,
          artworkFile,
          brandName,
          campaignName: formData.name,
          adName: `${formData.name} v1`
        });

        audioUrl = uploadResult.audioUrl;
        artworkUrl = uploadResult.artworkUrl;
        
        console.log('Audio ad uploaded successfully:', { audioUrl, artworkUrl });
      }
      
      // Create campaign with audio URL in assets
      const { data: campaign, error: campaignError } = await supabase
        .from('interactive_ad_campaigns')
        .insert([{
          brand_name: brandName,
          name: formData.name,
          ad_type: formData.ad_type || 'audio',
          priority: parseInt(formData.priority) || 1,
          is_active: false, // Always start as inactive, admin must approve
          assets: formData.ad_type === 'audio' ? {
            audio_url: audioUrl,
            artwork_url: artworkUrl,
            duration: duration,
            skip_delay: 5
          } : {},
          targeting: {
            userSegment: 'free',
            frequencyCap: 3
          },
          schedule: {
            start_date: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create submission for admin approval
      const { error: submissionError } = await supabase
        .from('ad_campaign_submissions')
        .insert([{
          ad_campaign_id: campaign.id,
          submitter_id: accessCodeId,
          status: 'pending',
          submission_data: {
            description: formData.description,
            budget: parseFloat(formData.budget),
            target_audience: formData.target_audience,
            audio_url: audioUrl,
            artwork_url: artworkUrl,
            duration: duration
          }
        }]);

      if (submissionError) throw submissionError;
      
      alert('Campaign submitted for approval!');
      navigate('/campaigns');
    } catch (err) {
      console.error('Error creating campaign:', err);
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
          <label htmlFor="budget">Budget (PGK) *</label>
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
            <option value="audio">Audio Ad</option>
            <option value="static">Static Banner</option>
            <option value="tap-reveal">Tap Reveal</option>
            <option value="pour-animation">Pour Animation</option>
          </select>
        </div>

        {formData.ad_type === 'audio' && (
          <>
            <div className="form-group">
              <label htmlFor="audioFile">Audio File (MP3) *</label>
              <input
                type="file"
                id="audioFile"
                accept="audio/mpeg,audio/mp3"
                onChange={(e) => setAudioFile(e.target.files[0])}
                required
              />
              {audioFile && (
                <p className="file-info">Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="artworkFile">Artwork (Optional)</label>
              <input
                type="file"
                id="artworkFile"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => setArtworkFile(e.target.files[0])}
              />
              {artworkFile && (
                <p className="file-info">Selected: {artworkFile.name}</p>
              )}
            </div>
          </>
        )}

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
            <option value="draft">Save as Draft</option>
            <option value="pending">Submit for Approval</option>
          </select>
          <p className="help-text">Campaigns must be approved by admin before going live</p>
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
