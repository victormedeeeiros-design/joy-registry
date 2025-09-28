-- Enable leaked password protection for better security
-- This prevents users from using commonly leaked passwords
-- Documentation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

-- Note: This setting is configured in the Supabase dashboard under Authentication settings
-- The SQL migration cannot directly enable this feature as it's a project-level setting
-- Users need to go to: Authentication > Settings > Password Protection
-- And enable "Leaked Password Protection"

-- For now, we'll add a comment as a reminder
-- This migration serves as documentation for the security requirement