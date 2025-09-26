'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import VoiceRecorder from './VoiceRecorder';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  interestedIn: string;
  bio?: string;
  photos: string[];
  voicePreference: {
    voice: string;
    enabled: boolean;
  };
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    maxDistance: number;
  };
}

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PROFILE), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PROFILE), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const clearSwipeHistory = async () => {
    if (!confirm('Are you sure you want to clear your swipe history? This will allow you to see all profiles again, but will also remove all your current matches.')) {
      return;
    }

    setClearingHistory(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CLEAR_SWIPE_HISTORY), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! ${data.newPotentialMatches} new profiles are now available to swipe.`);
        // Refresh profile to update any counts
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to clear swipe history:', error);
      alert('Failed to clear swipe history. Please try again.');
    } finally {
      setClearingHistory(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PHOTOS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, photos: data.photos } : null);
      }
    } catch (error) {
      console.error('Failed to upload photos:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <div className="flex space-x-3">
          <button
            onClick={clearSwipeHistory}
            disabled={clearingHistory || saving}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm"
            title="Clear your swipe history to see all profiles again"
          >
            {clearingHistory ? 'Clearing...' : '🔄 Reset Swipes'}
          </button>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Photos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Photos</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {profile.photos.map((photo, index) => (
            <Image
              key={index}
              src={photo}
              alt={`Photo ${index + 1}`}
              width={200}
              height={128}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
        {isEditing && (
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-pink-50 file:text-pink-700
                hover:file:bg-pink-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max 6 photos, 5MB each</p>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
            disabled={!isEditing}
            min="18"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            disabled={!isEditing}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
            placeholder="Tell others about yourself..."
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Preferences</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={profile.preferences.ageRange.min}
              onChange={(e) => setProfile({
                ...profile,
                preferences: {
                  ...profile.preferences,
                  ageRange: {
                    ...profile.preferences.ageRange,
                    min: parseInt(e.target.value)
                  }
                }
              })}
              disabled={!isEditing}
              min="18"
              max="100"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
            />
            <span>to</span>
            <input
              type="number"
              value={profile.preferences.ageRange.max}
              onChange={(e) => setProfile({
                ...profile,
                preferences: {
                  ...profile.preferences,
                  ageRange: {
                    ...profile.preferences.ageRange,
                    max: parseInt(e.target.value)
                  }
                }
              })}
              disabled={!isEditing}
              min="18"
              max="100"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (km)</label>
          <input
            type="number"
            value={profile.preferences.maxDistance}
            onChange={(e) => setProfile({
              ...profile,
              preferences: {
                ...profile.preferences,
                maxDistance: parseInt(e.target.value)
              }
            })}
            disabled={!isEditing}
            min="1"
            max="500"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Voice Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Voice Settings</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={profile.voicePreference.enabled}
            onChange={(e) => setProfile({
              ...profile,
              voicePreference: {
                ...profile.voicePreference,
                enabled: e.target.checked
              }
            })}
            disabled={!isEditing}
            className="mr-2 text-pink-600 focus:ring-pink-500"
          />
          <label className="text-sm text-gray-700">Enable voice messages</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Voice</label>
          <select
            value={profile.voicePreference.voice}
            onChange={(e) => setProfile({
              ...profile,
              voicePreference: {
                ...profile.voicePreference,
                voice: e.target.value
              }
            })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50"
          >
            <option value="alloy">Alloy</option>
            <option value="echo">Echo</option>
            <option value="fable">Fable</option>
            <option value="onyx">Onyx</option>
            <option value="nova">Nova</option>
            <option value="shimmer">Shimmer</option>
          </select>
        </div>
      </div>

      {/* Voice Cloning */}
      <div className="mt-8">
        <VoiceRecorder
          onVoiceCloned={(voiceData) => {
            console.log('Voice cloned successfully:', voiceData);
            // Optionally refresh profile or update state
          }}
        />
      </div>

      {isEditing && (
        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}