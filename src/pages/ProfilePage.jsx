import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import './ProfilePage.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const accessCodeId = localStorage.getItem('access_code_id');
      
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('access_code_id', accessCodeId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        name: data.brand_name || '',
        email: data.contact_email || '',
        website: data.website || '',
        description: data.description || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

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
      
      const { error } = await supabase
        .from('brand_profiles')
        .update({
          brand_name: formData.name,
          contact_email: formData.email,
          website: formData.website,
          description: formData.description
        })
        .eq('access_code_id', accessCodeId);

      if (error) throw error;
      
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !profile) return <LoadingSpinner />;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Brand Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Brand Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
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
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-field">
            <label>Brand Name</label>
            <p>{profile?.brand_name || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p>{profile?.contact_email || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Website</label>
            <p>{profile?.website || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Description</label>
            <p>{profile?.description || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Member Since</label>
            <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
