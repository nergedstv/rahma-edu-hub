DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t.tablename);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.tablename);
  END LOOP;
END $$;

GRANT INSERT ON public.applications TO anon;
GRANT INSERT ON public.contact_enquiries TO anon;
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT ON public.announcements TO anon;