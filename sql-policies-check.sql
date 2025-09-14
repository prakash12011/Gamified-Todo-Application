-- RLS Policies for Todos Table
-- Run these in Supabase SQL Editor to ensure proper permissions

-- Enable RLS on todos table (if not already enabled)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own todos
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to insert their own todos
CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own todos
CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own todos
CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE
    USING (auth.uid() = user_id);

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'todos';
