
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdrosaaeknwgymqjdnkq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkcm9zYWFla253Z3ltcWpkbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTM1MTcsImV4cCI6MjA4MDA2OTUxN30.b6wDuyRdjCgkKsyrIYUuTatj_YzjLSsSw5OggrOjTcg';

export const supabase = createClient(supabaseUrl, supabaseKey);
