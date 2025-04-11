import { supabase } from '../lib/supabase/client'

async function setupDatabase() {
  try {
    // Check if table exists by attempting to select from it
    const { error } = await supabase
      .from('analyses')
      .select()
      .limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it using raw SQL
      const createTableSQL = `
        CREATE TABLE public.analyses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          user_id TEXT NOT NULL,
          video_url TEXT NOT NULL,
          pdf_url TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
          result JSONB
        );
        
        -- Add RLS policies
        ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own analyses"
          ON public.analyses
          FOR SELECT
          USING (auth.uid()::text = user_id);
          
        CREATE POLICY "Users can insert their own analyses"
          ON public.analyses
          FOR INSERT
          WITH CHECK (auth.uid()::text = user_id);
          
        CREATE POLICY "Users can update their own analyses"
          ON public.analyses
          FOR UPDATE
          USING (auth.uid()::text = user_id);
      `
      
      const { error: createTableError } = await supabase
        .rpc('exec_sql', { sql: createTableSQL })
        
      if (createTableError) {
        throw createTableError
      }
      console.log('Successfully created analyses table')
    } else if (error) {
      throw error
    } else {
      console.log('Analyses table already exists')
    }

    // Verify the table exists and show its structure
    const { data, error: describeError } = await supabase
      .from('analyses')
      .select()
      .limit(0)
    
    if (describeError) {
      throw describeError
    }
    
    console.log('Database setup completed successfully')
    
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase().catch(console.error) 