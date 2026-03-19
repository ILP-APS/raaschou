GRANT EXECUTE ON FUNCTION public.upsert_project TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_project_from_n8n TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_offer_line_item TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_project_metrics TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_completion_metrics TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_setting TO anon, authenticated, service_role;