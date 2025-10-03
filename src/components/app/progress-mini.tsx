import { Card } from "@/components/ui/card";

export function ProgressMini({ completed = 0, total = 0 }: { completed?: number; total?: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Weekly Progress</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-3 h-2 rounded bg-muted">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </Card>
  );
}


