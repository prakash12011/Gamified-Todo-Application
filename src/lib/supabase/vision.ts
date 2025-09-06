import { supabase } from './client';
import { VisionPlan } from '@/types/vision';

export async function fetchVisionPlans(userId: string): Promise<VisionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('vision_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vision plans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchVisionPlans:', error);
    return [];
  }
}

export async function createVisionPlan(visionPlan: Omit<VisionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<VisionPlan | null> {
  try {
    const { data, error } = await supabase
      .from('vision_plans')
      .insert([visionPlan])
      .select()
      .single();

    if (error) {
      console.error('Error creating vision plan:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createVisionPlan:', error);
    return null;
  }
}

export async function updateVisionPlan(id: string, updates: Partial<VisionPlan>): Promise<VisionPlan | null> {
  try {
    const { data, error } = await supabase
      .from('vision_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vision plan:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateVisionPlan:', error);
    return null;
  }
}

export async function deleteVisionPlan(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vision_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vision plan:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteVisionPlan:', error);
    return false;
  }
}
