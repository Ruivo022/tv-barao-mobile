import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hvfznilryscauyfgxkrd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QNNPntR5_EkynmSdfzf-6g_d--GXAdU";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);