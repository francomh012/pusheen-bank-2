import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://xfxtbppffijltwucqewz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHRicHBmZmlqbHR3dWNxZXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTgyMzksImV4cCI6MjA5MDYzNDIzOX0.7JQ4UpVt0Kl2pcO-fgdOJNwtcndWmLw55imPqDON568'

export const supabase = createClient(supabaseUrl, supabaseKey)