import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AUTH_STORAGE_KEY = 'brand_auth';

export const useBrandAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [brandName, setBrandName] = useState(null);
  const [brandId, setBrandId] = useState(null);
  const [accessCodeId, setAccessCodeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      
      if (!storedAuth) {
        setLoading(false);
        return;
      }

      try {
        const { access_code, brand_name, access_code_id } = JSON.parse(storedAuth);

        // Validate code is still valid
        const { data: codeData, error: codeError } = await supabase
          .from('brand_access_codes')
          .select('id, brand_name, is_revoked')
          .eq('brand_name', brand_name)
          .eq('code', access_code)
          .eq('is_revoked', false)
          .single();

        if (codeError || !codeData) {
          console.warn('Access code validation failed:', codeError?.message || 'Code not found');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Get brand profile
        const { data: profileData, error: profileError } = await supabase
          .from('brand_profiles')
          .select('id, brand_name')
          .eq('access_code_id', codeData.id)
          .single();

        if (profileError || !profileData) {
          console.warn('Brand profile validation failed:', profileError?.message || 'Profile not found');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Valid session - also store individual keys
        localStorage.setItem('access_code_id', codeData.id);
        localStorage.setItem('brand_name', codeData.brand_name);
        
        setBrandName(codeData.brand_name);
        setBrandId(profileData.id);
        setAccessCodeId(codeData.id);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to validate session:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (access_code, brand_name, access_code_id) => {
    const authData = { access_code, brand_name, access_code_id };
    console.log('💾 Storing auth data for brand:', brand_name);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    
    // Also store individual keys for backward compatibility
    localStorage.setItem('access_code_id', access_code_id);
    localStorage.setItem('brand_name', brand_name);
    
    // Get brand profile
    const { data: profileData } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('access_code_id', access_code_id)
      .single();

    setBrandName(brand_name);
    setBrandId(profileData?.id);
    setAccessCodeId(access_code_id);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('access_code_id');
    localStorage.removeItem('brand_name');
    setBrandName(null);
    setBrandId(null);
    setAccessCodeId(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

  return {
    isAuthenticated,
    brandName,
    brandId,
    accessCodeId,
    loading,
    login,
    logout
  };
};