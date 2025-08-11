import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ParentSetupWizard from '@/components/ParentSetupWizard';
import { Loader2 } from 'lucide-react';

const Setup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          navigate('/auth');
          return;
        }

        setUserProfile(data);

        // If user doesn't have a family, redirect them to create one first
        if (!data.family_id) {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleSetupComplete = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-islamic-green mx-auto mb-4" />
          <p className="text-muted-foreground">Loading setup wizard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || !userProfile.family_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Unable to access setup. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <ParentSetupWizard 
      familyId={userProfile.family_id} 
      onComplete={handleSetupComplete}
    />
  );
};

export default Setup;