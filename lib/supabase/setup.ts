import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcevjnmdqthbnprywyyv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZXZqbm1kcXRoYm5wcnl3eXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjY0OTgsImV4cCI6MjA1OTY0MjQ5OH0.JbEXstJn_vmJoDBSg3xMJN5TmR3ciSh1AoyAAqRiZpw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  try {
    // Enable UUID extension
    const { error: extensionError } = await supabase.rpc('install_extension', {
      name: 'uuid-ossp'
    })
    
    if (extensionError) {
      console.error('Error installing uuid extension:', extensionError)
    }

    // Create analyses table
    const { error: tableError } = await supabase.from('analyses').upsert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        user_id: 'system',
        video_url: 'placeholder',
        pdf_url: 'placeholder',
        status: 'completed',
        result: null
      }
    ], { onConflict: 'id' })

    if (tableError) {
      console.error('Error creating table:', tableError)
      return
    }

    // Create indexes
    const { error: indexError } = await supabase.query(`
      create index if not exists analyses_user_id_idx on analyses(user_id);
      create index if not exists analyses_status_idx on analyses(status);
    `)

    if (indexError) {
      console.error('Error creating indexes:', indexError)
      return
    }

    // Enable RLS
    const { error: rlsError } = await supabase.query(`
      alter table analyses enable row level security;
    `)

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
      return
    }

    // Create policies
    const { error: policiesError } = await supabase.query(`
      create policy "Enable read access for all users" on analyses
        for select using (true);

      create policy "Enable insert access for all users" on analyses
        for insert with check (true);

      create policy "Enable update access for all users" on analyses
        for update using (true);
    `)

    if (policiesError) {
      console.error('Error creating policies:', policiesError)
      return
    }

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

// Execute setup
setupDatabase() 