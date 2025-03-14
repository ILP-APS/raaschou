
import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function DashboardCard({
  title,
  subtitle,
  className,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "dashboard-card animate-fade-in",
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
