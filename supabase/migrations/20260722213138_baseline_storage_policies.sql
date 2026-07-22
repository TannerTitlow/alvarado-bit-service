CREATE POLICY "Allow authenticated updates and deletes"
ON "storage"."objects"
TO "authenticated"
USING (("bucket_id" = 'featured-content'::"text"));

CREATE POLICY "Allow authenticated uploads"
ON "storage"."objects"
FOR INSERT
TO "authenticated"
WITH CHECK (("bucket_id" = 'featured-content'::"text"));

CREATE POLICY "Allow authenticated users to upload images"
ON "storage"."objects"
FOR INSERT
TO "authenticated"
WITH CHECK (("bucket_id" = 'product-images'::"text"));

CREATE POLICY "Allow authenticated users to upload images 88iv0u_0"
ON "storage"."objects"
FOR INSERT
TO "authenticated"
WITH CHECK (("bucket_id" = 'drill-bit-model-images'::"text"));

CREATE POLICY "Allow public read"
ON "storage"."objects"
FOR SELECT
USING (("bucket_id" = 'featured-content'::"text"));

CREATE POLICY "Allow public to read images"
ON "storage"."objects"
FOR SELECT
USING (("bucket_id" = 'product-images'::"text"));

CREATE POLICY "Allow public to read images 88iv0u_0"
ON "storage"."objects"
FOR SELECT
USING (("bucket_id" = 'drill-bit-model-images'::"text"));
