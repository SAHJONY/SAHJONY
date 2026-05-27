-- Enable Row Level Security on NextAuth tables
-- Fixes CRITICAL security vulnerabilities reported by Supabase Advisor
-- Table names match what Supabase Advisor reports (capitalized, in public schema)

-- Enable RLS on public.User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on public.Account table
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on public.Session table
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on public.VerificationToken table
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Policies for public.User table
-- Users can view and update their own profile
CREATE POLICY "Users can view own user" ON public."User"
    FOR SELECT USING (auth.uid() = "id");

CREATE POLICY "Users can update own user" ON public."User"
    FOR UPDATE USING (auth.uid() = "id");

-- Policies for public.Account table (NextAuth OAuth accounts)
-- Users can view, insert, update, delete their own OAuth accounts
CREATE POLICY "Users can view own accounts" ON public."Account"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own accounts" ON public."Account"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own accounts" ON public."Account"
    FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own accounts" ON public."Account"
    FOR DELETE USING (auth.uid() = "userId");

-- Policies for public.Session table
-- Users can view and delete their own sessions
CREATE POLICY "Users can view own sessions" ON public."Session"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own sessions" ON public."Session"
    FOR DELETE USING (auth.uid() = "userId");

-- Policies for public.VerificationToken table
-- Verification tokens are publicly readable (needed for email verification flow)
-- Note: VerificationToken doesn't have userId column, only identifier (email), token, expires
CREATE POLICY "Anyone can view verification tokens" ON public."VerificationToken"
    FOR SELECT USING (true);

-- Note: If you're not using OAuth, you might not have Account entries
-- The policies still work but won't affect you if the table is empty

-- TO RUN THIS MIGRATION:
-- 1. Go to https://supabase.com/dashboard/project/rtwwnxipchwgwegtjqco/sql/new
-- 2. Run: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--    to verify actual table names
-- 3. Adjust table/column names if different from expected
-- 4. Run the ALTER TABLE and CREATE POLICY statements