import { Card } from "@/components/ui/card";

export function CalendarNow({ nextEvent }: { nextEvent?: { title: string; time: string } }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="font-medium">Up next:</span>
        <span className="truncate">{nextEvent?.title ?? "Free time"}</span>
        <span className="ml-auto text-muted-foreground">{nextEvent?.time ?? "—"}</span>
      </div>
    </Card>
  );
}


