/** An image path, or a coloured initial (synthetic demo people and servers). */
export type AvatarSource = string | { initial: string; color: string };

/**
 * Avatar of `size` px. `shape` "circle" for people and author icons, "square" for embed
 * thumbnails (Discord shows those as 3px-rounded squares).
 */
export function Avatar({
  src,
  size,
  shape = "circle",
  className = "",
}: {
  src: AvatarSource;
  size: number;
  shape?: "circle" | "square";
  className?: string;
}) {
  const radius = shape === "circle" ? "50%" : "3px";
  if (typeof src === "string") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={`shrink-0 object-cover ${className}`}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-semibold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: src.color,
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
      }}
    >
      {src.initial}
    </span>
  );
}
