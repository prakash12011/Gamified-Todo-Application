// Client-side profile functions for CRUD operations
import { supabase } from '@/lib/supabase/client';

type Profile = {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  coins: number;
  streak_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  console.log('Updating profile for user:', userId, 'with data:', updates);
  
  try {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    const result = await response.json();
    console.log('Profile updated successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function uploadAvatar(userId: string, file: File) {
  console.log('Uploading avatar for user:', userId, 'file:', file.name);
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload avatar');
    }

    const result = await response.json();
    console.log('Avatar uploaded successfully:', result);
    return result.avatar_url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

export async function deleteAvatar(userId: string, avatarUrl: string) {
  // Extract file path from URL
  const urlParts = avatarUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `avatars/${fileName}`;

  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }

  // Update profile to remove avatar URL
  await updateUserProfile(userId, { avatar_url: null });
}
