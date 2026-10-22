/**
 * An image attached to a message (the store barcode): drawn at its own size, scaled down to fit
 * Discord's 550 x 350 preview box and the window, 8px corners.
 */
export function Attachment({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const scale = Math.min(1, 550 / width, 350 / height);
  return (
    <div className="mt-1 max-w-full min-w-0 self-start overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        draggable={false}
        className="block h-auto max-w-full"
        style={{ width: Math.round(width * scale) }}
      />
    </div>
  );
}
