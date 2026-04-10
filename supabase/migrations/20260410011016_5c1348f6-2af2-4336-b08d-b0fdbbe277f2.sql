
-- Add trial tracking to player_profiles
ALTER TABLE public.player_profiles 
ADD COLUMN trial_started_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN subscription_status text NOT NULL DEFAULT 'trial';

-- Create storage bucket for user videos
INSERT INTO storage.buckets (id, name, public) VALUES ('user-videos', 'user-videos', false);

-- Storage policies for user videos
CREATE POLICY "Users can upload own videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
