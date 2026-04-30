INSERT INTO public.settings (key, value, description)
VALUES ('min_offer_amount', 25000, 'Minimum tilbudsbeløb for at vise aftale i Fokusark (kr)')
ON CONFLICT (key) DO NOTHING;