const SUPABASE_URL = 'https://mnjnidezyxofejbrdzqb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uam5pZGV6eXhvZmVqYnJkenFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NzY0ODIsImV4cCI6MjEwNDA1MjQ4Mn0.HHGOnJ00gsVOTfMmxxJY34A3bX6StIpWQl6lcpRskG8';

// Initialize Supabase Client (assuming global supabase from CDN is available)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
