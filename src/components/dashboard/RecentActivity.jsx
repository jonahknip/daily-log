import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Image as ImageIcon, MapPin } from "lucide-react";

export default function RecentActivity({ logs }) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Recent Field Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead>Crew</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Work Performed</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.slice(0, 10).map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-600">
                  {log.date ? format(new Date(log.date), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{log.crew_name}</TableCell>
                <TableCell>
                  <div className="flex items-center text-slate-500 text-sm">
                    <MapPin className="w-3 h-3 mr-1" />
                    {log.location}
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate text-slate-600" title={log.work_performed}>
                  {log.work_performed}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-slate-700">
                  {log.hours_worked}
                </TableCell>
                <TableCell>
                  {log.photos && log.photos.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {log.photos.length}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  No logs found. Start by creating a new entry.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}