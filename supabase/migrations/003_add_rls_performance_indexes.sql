-- Performance indexes for RLS policies
-- These speed up the subquery-based access control checks

-- Agent table - workspaceId lookup for RLS
CREATE INDEX idx_agent_workspaceid ON public."Agent"("workspaceId");

-- Conversation table - workspaceId lookup for RLS
CREATE INDEX idx_conversation_workspaceid ON public."Conversation"("workspaceId");

-- Message table - conversationId lookup for RLS subqueries
CREATE INDEX idx_message_conversationid ON public."Message"("conversationId");

-- UsageLog table - userId and workspaceId for RLS
CREATE INDEX idx_usage_log_userid ON public."UsageLog"("userId");
CREATE INDEX idx_usage_log_workspaceid ON public."UsageLog"("workspaceId");

-- Plugin table - userId for RLS
CREATE INDEX idx_plugin_userid ON public."Plugin"("userId");

-- Additional indexes for direct userId lookups
CREATE INDEX idx_api_key_userid ON public."ApiKey"("userId");
CREATE INDEX idx_subscription_userid ON public."Subscription"("userId");
CREATE INDEX idx_workspace_userid ON public."Workspace"("userId");
CREATE INDEX idx_team_ownerid ON public."Team"("ownerId");
CREATE INDEX idx_team_member_userid ON public."TeamMember"("userId");
CREATE INDEX idx_team_member_teamid ON public."TeamMember"("teamId");