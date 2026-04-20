
export const getRowBgColor = (isSubProject: boolean, index: number): string => {
  // Subs: plain background, no shading. Parents continue to alternate.
  if (isSubProject) return "bg-background";
  return index === 0 || index % 2 === 0 ? "bg-background" : "bg-muted";
};
