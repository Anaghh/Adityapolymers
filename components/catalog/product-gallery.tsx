import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getProductImages } from "@/lib/data";
import type { Product } from "@/lib/types";

/**
 * Product photography band. Renders nothing until real photos exist in the
 * `product-images` bucket — per the design rules, no CSS-drawn placeholders,
 * no stock slop. The moment photos are uploaded (admin uploads via Supabase
 * Storage + a product_images row), the band activates: primary image large,
 * the rest in a strip below.
 *
 * Layout: 16:9 hero frame (grid), explicit mobile collapse. The images are
 * decorative support; the spec table remains the page's core content.
 */
export async function ProductGallery({ product }: { product: Product }) {
  const images = await getProductImages(product.id);
  if (images.length === 0) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const src = (path: string) => `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;

  const [primary, ...rest] = images;

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-paper">
            <Image
              src={src(primary.storagePath)}
              alt={primary.alt || product.name}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          {rest.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {rest.slice(0, 3).map((image) => (
                <li
                  key={image.id}
                  className="relative aspect-video overflow-hidden rounded-lg border border-line bg-paper"
                >
                  <Image
                    src={src(image.storagePath)}
                    alt={image.alt || product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Photos show representative plant and application views; the specification table is the
          binding reference for the grade.
        </p>
      </Container>
    </section>
  );
}
