export function ResponsiveImg({
  src,
  srcMobile,
  className,
  alt = "",
}: {
  src: string;
  srcMobile?: string;
  className?: string;
  alt?: string;
}) {
  return (
    <picture className="contents">
      {srcMobile ? <source media="(max-width: 767px)" srcSet={srcMobile} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} draggable={false} />
    </picture>
  );
}
