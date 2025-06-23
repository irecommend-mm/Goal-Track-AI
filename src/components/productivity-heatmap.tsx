'use client';
import { Calendar } from '@/components/ui/calendar';
import type { ProgressRecord } from '@/lib/types';
import { format, parse } from 'date-fns';

function getProductivityLevel(completedTasks: number | undefined): number {
    if (!completedTasks) return 0;
    if (completedTasks <= 2) return 1;
    if (completedTasks <= 4) return 2;
    if (completedTasks <= 6) return 3;
    return 4;
}

export default function ProductivityHeatmap({ history }: { history: ProgressRecord[] }) {

    const modifiers = history.reduce((acc, record) => {
        const level = getProductivityLevel(record.completedTasks);
        if (level > 0) {
            const key = `prod_${level}`;
            if (!acc[key]) acc[key] = [];
            // Parse the date string correctly to avoid timezone issues
            acc[key].push(parse(record.date, 'yyyy-MM-dd', new Date()));
        }
        return acc;
    }, {} as Record<string, Date[]>);

    const modifiersClassNames = {
        prod_1: 'rdp-day_prod_1',
        prod_2: 'rdp-day_prod_2',
        prod_3: 'rdp-day_prod_3',
        prod_4: 'rdp-day_prod_4',
    };

    return (
        <div className="flex justify-center rounded-md border p-4">
            <Calendar
                numberOfMonths={3}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                disabled={{ after: new Date() }}
                className="p-0"
            />
        </div>
    );
}
