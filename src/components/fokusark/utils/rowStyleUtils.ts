
export const getRowBgColor = (isSubProject: boolean, index: number): string => {
  if (isSubProject) return "bg-muted";
  return index === 0 || index % 2 === 0 ? "bg-background" : "bg-muted";
};
