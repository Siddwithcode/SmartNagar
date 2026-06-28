import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TopCitizensTable({ citizens, isLoading }) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading citizens...</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Citizen</TableHead>
            <TableHead>Reports Submitted</TableHead>
            <TableHead>Resolved Reports</TableHead>
            <TableHead>Civic Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {citizens.map((citizen) => (
            <TableRow key={citizen._id}>
              <TableCell className="font-semibold">#{citizen.rank}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{citizen.name}</p>
                  <p className="text-xs text-muted-foreground">{citizen.email}</p>
                </div>
              </TableCell>
              <TableCell>{citizen.reportsSubmitted}</TableCell>
              <TableCell>{citizen.resolvedReports}</TableCell>
              <TableCell>{citizen.civicPoints}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
