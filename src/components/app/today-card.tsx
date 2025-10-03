"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

type Task = { id: string; title: string; done?: boolean; due?: string };

export function TodayCard({ tasks = [] as Task[] }: { tasks?: Task[] }) {
  const top = useMemo(() => tasks.slice(0, 3), [tasks]);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Today</h2>
        <Button size="sm">Start Focus</Button>
      </div>
      <ul className="mt-4 space-y-3">
        {top.length === 0 ? (
          <li className="text-sm text-muted-foreground">No tasks yet. Add your first task.</li>
        ) : (
          top.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <Checkbox id={t.id} />
              <label htmlFor={t.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t.title}
              </label>
              {t.due && <span className="ml-auto text-xs text-muted-foreground">{t.due}</span>}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}


