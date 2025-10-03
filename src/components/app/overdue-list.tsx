import { Card } from "@/components/ui/card";

type Item = { id: string; title: string; due: string };

export function OverdueList({ items = [] as Item[] }: { items?: Item[] }) {
  return (
    <Card className="p-4">
      <h3 className="text-base font-medium">Overdue</h3>
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">Nothing overdue. Great job!</li>
        ) : (
          items.map((i) => (
            <li key={i.id} className="flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="truncate">{i.title}</span>
              <span className="ml-auto text-muted-foreground">{i.due}</span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}


