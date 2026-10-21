/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://woemeffuldsgpggsxtrv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CGTJm73gscLpvlYf7fs56w_NUO96Y2Z';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
