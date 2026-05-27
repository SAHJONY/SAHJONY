-- Enable Row Level Security on NextAuth tables
-- Fixes CRITICAL security vulnerabilities reported by Supabase Advisor

-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on auth.account table
ALTER TABLE auth.account ENABLE ROW LEVEL SECURITY;

-- Enable RLS on auth.session table
ALTER TABLE auth.session ENABLE ROW LEVEL SECURITY;

-- Enable RLS on auth.verification_token table
ALTER TABLE auth.verification_token ENABLE ROW LEVEL SECURITY;

-- Policies for auth.users table
-- Users can view and update their own profile
CREATE POLICY "Users can view own auth user" ON auth.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own auth user" ON auth.users
    FOR UPDATE USING (auth.uid() = id);

-- Policies for auth.account table (NextAuth OAuth accounts)
-- Users can view, insert, update, delete their own OAuth accounts
CREATE POLICY "Users can view own accounts" ON auth.account
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON auth.account
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON auth.account
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON auth.account
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for auth.session table
-- Users can view and delete their own sessions
CREATE POLICY "Users can view own sessions" ON auth.session
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON auth.session
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for auth.verification_token table
-- Verification tokens are publicly readable (needed for email verification)
-- But users can only delete tokens associated with their user_id
CREATE POLICY "Anyone can view verification tokens" ON auth.verification_token
    FOR SELECT USING (true);

CREATE POLICY "Users can delete own verification tokens" ON auth.verification_token
    FOR DELETE USING (auth.uid() = user_id);

-- Note: If you're not using OAuth, you might not have Account entries
-- The policies still work but won't affect you if the table is empty