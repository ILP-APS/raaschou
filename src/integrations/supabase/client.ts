// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://djfeqkiuvuwvhmuubsdr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZmVxa2l1dnV3dmhtdXVic2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTc4ODIsImV4cCI6MjA1NzUzMzg4Mn0.ak8PI92ujioQAZLwm-LBu8GZSI1KVWkPi2fPX5hQ5-I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);