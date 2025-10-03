import { Card } from "@/components/ui/card";

type Note = { id: string; title: string; snippet?: string };

export function RecentNotes({ notes = [] as Note[] }: { notes?: Note[] }) {
  return (
    <Card className="p-4">
      <h3 className="text-base font-medium">Recent Notes</h3>
      <ul className="mt-3 space-y-3">
        {notes.length === 0 ? (
          <li className="text-sm text-muted-foreground">No notes yet.</li>
        ) : (
          notes.map((n) => (
            <li key={n.id} className="text-sm">
              <div className="font-medium truncate">{n.title}</div>
              {n.snippet && <div className="text-muted-foreground truncate">{n.snippet}</div>}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}


