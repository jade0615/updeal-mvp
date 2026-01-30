
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS referred_by text;

CREATE INDEX IF NOT EXISTS idx_coupons_referred_by ON public.coupons(referred_by);
