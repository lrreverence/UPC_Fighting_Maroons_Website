-- Add reference_link column to news table
ALTER TABLE public.news 
ADD COLUMN reference_link TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.news.reference_link IS 'URL link to the original news source';