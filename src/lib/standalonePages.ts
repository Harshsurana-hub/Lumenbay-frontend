/** Pages that bring their own header and should not get the marketplace chrome. */
export function isStandalonePage(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname === "/privacy" ||
    pathname === "/terms"
  );
}
