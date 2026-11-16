import { supabase } from './supabase';

export async function uploadImage(file: File, bucket: string = 'avatars') {
  // Check if Supabase is properly configured
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || 
                        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isPlaceholder) {
    console.warn('Supabase not configured. Using simulated upload.');
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return a nice random avatar as fallback
    return `https://picsum.photos/seed/${Math.random()}/200/200`;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
