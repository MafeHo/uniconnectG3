import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useUserStore, type AcademicProfile, type Career, type Section } from '@uniconnect/shared';
import { apiClient } from '../main';

export const useProfile = (externalUserId?: string) => {
  const { user } = useAuthStore();
  const { profile, profileLoaded, setProfile, setProfileLoaded } = useUserStore();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingStructure, setFetchingStructure] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [profileData, setProfileData] = useState<Partial<AcademicProfile>>({
    studentId: externalUserId || user?.uid || '',
    facultyId: '',
    academicLevelId: '',
    formationLevelId: '',
    careerId: '',
    subjects: [],
    biography: '',
    phone: '',
    age: '',
    studyPreference: '',
    showEmail: true,
  });

  const targetUid = externalUserId || user?.uid;
  const isExternal = !!externalUserId && externalUserId !== user?.uid;
  
  // Track if we've already fetched profile to prevent infinite loops
  const hasFetchedRef = useRef(false);

  // Load profile from store or fetch if not loaded
  useEffect(() => {
    const loadProfile = async () => {
      // If already loaded in this session, use store data
      if (profileLoaded && profile) {
        setProfileData(profile);
        if (profile.careerId) {
          const structureRes = await apiClient.getAxiosInstance().get(`/api/career-structure/${profile.careerId}`);
          setSections(structureRes.data || []);
        }
        return;
      }

      // Only fetch if not loaded yet and we have a user
      if (!targetUid || profileLoaded || hasFetchedRef.current) return;

      hasFetchedRef.current = true;
      setLoading(true);
      try {
        const [profileRes, careersRes] = await Promise.all([
          apiClient.getAxiosInstance().get(`/api/academic-profile/${targetUid}`),
          apiClient.getAxiosInstance().get('/api/careers'),
        ]);

        setCareers(careersRes.data || []);

        if (profileRes.data) {
          const data = profileRes.data;
          const initialProfile = {
            ...data,
            facultyId: data.facultyId || '',
            academicLevelId: data.academicLevelId || '',
            formationLevelId: data.formationLevelId || '',
            careerId: data.careerId || '',
            subjects: data.subjects || [],
            biography: data.biography || '',
            phone: data.phone || '',
            age: data.age?.toString() || '',
            studyPreference: data.studyPreference || '',
            showEmail: data.showEmail !== undefined ? data.showEmail : true,
          };

          setProfileData(initialProfile);
          
          // Save to store if profile exists
          if (data.studentId && data.careerId) {
            setProfile(initialProfile as AcademicProfile);
          }

          if (data.careerId) {
            const structureRes = await apiClient.getAxiosInstance().get(`/api/career-structure/${data.careerId}`);
            setSections(structureRes.data || []);
          }

          if (!isExternal && (!data.studentId || !data.careerId)) {
            setIsEditing(true);
          }
        } else {
          // No profile found - mark as loaded but empty
          setProfileLoaded(true);
          if (!isExternal) {
            setIsEditing(true);
          }
        }
      } catch (e) {
        console.error('Error loading profile:', e);
        // Mark as loaded even on error to prevent infinite retries
        setProfileLoaded(true);
        if (!isExternal) {
          setIsEditing(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [targetUid, profileLoaded, isExternal, setProfile, setProfileLoaded]);

  // Load careers separately if not loaded
  useEffect(() => {
    if (careers.length === 0) {
      apiClient.getAxiosInstance().get('/api/careers')
        .then(res => setCareers(res.data || []))
        .catch(console.error);
    }
  }, [careers.length]);

  const updateCareer = async (id: string) => {
    setProfileData((prev) => ({ ...prev, careerId: id, subjects: [] }));
    setFetchingStructure(true);
    try {
      const res = await apiClient.getAxiosInstance().get(`/api/career-structure/${id}`);
      setSections(res.data || []);
    } catch (e) {
      console.error('Error changing career:', e);
    } finally {
      setFetchingStructure(false);
    }
  };

  const loadCareerStructure = async (careerId: string) => {
    if (!careerId) return;
    setFetchingStructure(true);
    try {
      const res = await apiClient.getAxiosInstance().get(`/api/career-structure/${careerId}`);
      setSections(res.data || []);
    } catch (e) {
      console.error('Error loading career structure:', e);
    } finally {
      setFetchingStructure(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return { success: false, error: 'No user ID' };
    try {
      setSaving(true);
      const response = await apiClient.getAxiosInstance().post<AcademicProfile>(
        '/api/academic-profile',
        {
          studentId: user.uid,
          ...profileData,
        }
      );
      const savedProfile = response.data;
      
      // Update local state
      setProfileData(savedProfile);
      
      // Save to global store
      setProfile(savedProfile);
      
      setIsEditing(false);
      return { success: true };
    } catch (e: any) {
      console.error('Error saving profile:', e);
      return { success: false, error: e.message || 'Failed to save profile' };
    } finally {
      setSaving(false);
    }
  };

  // Determine if onboarding should be shown
  const hasProfile = profileLoaded && profile && !!profile.careerId;
  const showOnboarding = profileLoaded && !hasProfile && !isExternal;

  return {
    user,
    profileData,
    loading,
    saving,
    fetchingStructure,
    isEditing,
    setIsEditing,
    hasProfile,
    showOnboarding,
    careers,
    sections,
    setProfileData,
    updateCareer,
    saveProfile,
    loadCareerStructure,
  };
};
