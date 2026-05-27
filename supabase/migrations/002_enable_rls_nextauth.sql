-- Hermes Agent SaaS - RLS Enablement for All Tables
-- Fixes 14 critical security vulnerabilities
-- Note: IDs are TEXT type, not UUID, so we use ::text casts

-- Enable RLS on auth-related tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on application tables
ALTER TABLE public."Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Plugin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UsageLog" ENABLE ROW LEVEL SECURITY;

-- User policies (id is TEXT type)
CREATE POLICY "Users can view own user" ON public."User" FOR SELECT USING (auth.uid()::text = "id");
CREATE POLICY "Users can update own user" ON public."User" FOR UPDATE USING (auth.uid()::text = "id");

-- Account policies (userId is TEXT type)
CREATE POLICY "Users can view own accounts" ON public."Account" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own accounts" ON public."Account" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own accounts" ON public."Account" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own accounts" ON public."Account" FOR DELETE USING (auth.uid()::text = "userId");

-- Session policies (userId is TEXT type)
CREATE POLICY "Users can view own sessions" ON public."Session" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own sessions" ON public."Session" FOR DELETE USING (auth.uid()::text = "userId");

-- VerificationToken (public read for email verification)
CREATE POLICY "Anyone can view verification tokens" ON public."VerificationToken" FOR SELECT USING (true);

-- Workspace policies (userId is TEXT type)
CREATE POLICY "Users can view own workspaces" ON public."Workspace" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own workspaces" ON public."Workspace" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own workspaces" ON public."Workspace" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own workspaces" ON public."Workspace" FOR DELETE USING (auth.uid()::text = "userId");

-- Conversation policies (access through workspaceId -> userId)
CREATE POLICY "Users can view own conversations" ON public."Conversation" FOR SELECT USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));
CREATE POLICY "Users can insert own conversations" ON public."Conversation" FOR INSERT WITH CHECK (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));
CREATE POLICY "Users can update own conversations" ON public."Conversation" FOR UPDATE USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));
CREATE POLICY "Users can delete own conversations" ON public."Conversation" FOR DELETE USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));

-- Message policies (access through conversation -> workspace -> userId)
CREATE POLICY "Users can view own messages" ON public."Message" FOR SELECT USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = (SELECT "workspaceId" FROM public."Conversation" WHERE id = "conversationId")));
CREATE POLICY "Users can insert own messages" ON public."Message" FOR INSERT WITH CHECK (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = (SELECT "workspaceId" FROM public."Conversation" WHERE id = "conversationId")));
CREATE POLICY "Users can delete own messages" ON public."Message" FOR DELETE USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = (SELECT "workspaceId" FROM public."Conversation" WHERE id = "conversationId")));

-- Agent policies (access through workspaceId -> userId)
CREATE POLICY "Users can view own agents" ON public."Agent" FOR SELECT USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));
CREATE POLICY "Users can insert own agents" ON public."Agent" FOR INSERT WITH CHECK (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));
CREATE POLICY "Users can update own agents" ON public."Agent" FOR UPDATE USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));
CREATE POLICY "Users can delete own agents" ON public."Agent" FOR DELETE USING (auth.uid()::text = (SELECT "userId" FROM public."Workspace" WHERE id = "workspaceId"));

-- ApiKey policies (direct userId)
CREATE POLICY "Users can view own api keys" ON public."ApiKey" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own api keys" ON public."ApiKey" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own api keys" ON public."ApiKey" FOR DELETE USING (auth.uid()::text = "userId");

-- Subscription policies (direct userId)
CREATE POLICY "Users can view own subscriptions" ON public."Subscription" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own subscriptions" ON public."Subscription" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own subscriptions" ON public."Subscription" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own subscriptions" ON public."Subscription" FOR DELETE USING (auth.uid()::text = "userId");

-- Team policies (ownerId column)
CREATE POLICY "Users can view own teams" ON public."Team" FOR SELECT USING (auth.uid()::text = "ownerId");
CREATE POLICY "Users can insert own teams" ON public."Team" FOR INSERT WITH CHECK (auth.uid()::text = "ownerId");
CREATE POLICY "Users can update own teams" ON public."Team" FOR UPDATE USING (auth.uid()::text = "ownerId");
CREATE POLICY "Users can delete own teams" ON public."Team" FOR DELETE USING (auth.uid()::text = "ownerId");

-- TeamMember policies (direct userId)
CREATE POLICY "Users can view own team memberships" ON public."TeamMember" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own team memberships" ON public."TeamMember" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own team memberships" ON public."TeamMember" FOR DELETE USING (auth.uid()::text = "userId");

-- Plugin policies (public read for system plugins, user write for custom)
CREATE POLICY "Anyone can view plugins" ON public."Plugin" FOR SELECT USING (true);
CREATE POLICY "Users can insert own plugins" ON public."Plugin" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own plugins" ON public."Plugin" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own plugins" ON public."Plugin" FOR DELETE USING (auth.uid()::text = "userId");

-- UsageLog policies (direct userId)
CREATE POLICY "Users can view own usage logs" ON public."UsageLog" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own usage logs" ON public."UsageLog" FOR INSERT WITH CHECK (auth.uid()::text = "userId");