export function ResponsiveImg({
  src,
  srcMobile,
  className,
  alt = "",
}: {
  src?: string;
  srcMobile?: string;
  className?: string;
  alt?: string;
}) {
  const desktop = src?.trim() || "";
  const mobile = srcMobile?.trim() || "";
  if (!desktop && !mobile) return null;
  if (!mobile || mobile === desktop) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={desktop || mobile} alt={alt} className={className} draggable={false} />
    );
  }
  if (!desktop) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mobile} alt={alt} className={className} draggable={false} />
    );
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mobile} alt={alt} className={`${className ?? ""} md:hidden`} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={desktop} alt={alt} className={`${className ?? ""} hidden md:block`} draggable={false} />
    </>
  );
}
