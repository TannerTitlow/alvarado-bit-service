ALTER TABLE public.inventory_units
  DROP CONSTRAINT inventory_units_model_id_fkey;

ALTER TABLE public.inventory_units
  ADD CONSTRAINT inventory_units_model_id_fkey
  FOREIGN KEY (model_id)
  REFERENCES public.drill_bit_models(id)
  ON DELETE CASCADE;
