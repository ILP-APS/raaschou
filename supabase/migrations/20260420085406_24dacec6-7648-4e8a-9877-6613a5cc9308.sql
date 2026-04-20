ALTER TABLE public.offer_line_items
  DROP CONSTRAINT offer_line_items_project_id_fkey;

ALTER TABLE public.offer_line_items
  ADD CONSTRAINT offer_line_items_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;