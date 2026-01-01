import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ShieldAlert, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AuditLogTable() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 1000) // Latest 1000
  });

  const filteredLogs = logs?.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_resource?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-500" />
            לוג פעילות מערכת (Audit Logs)
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading || isRefetching} title="רענן לוגים">
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
        <div className="relative w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="חפש לפי פעולה, משתמש..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="text-right">משתמש</TableHead>
                <TableHead className="text-right">פעולה</TableHead>
                <TableHead className="text-right">משאב</TableHead>
                <TableHead className="text-right">IP</TableHead>
                <TableHead className="text-right">פרטים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    טוען נתונים...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    לא נמצאו רשומות
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.created_date), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium">{log.actor_name || log.actor_id}</TableCell>
                    <TableCell>
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium">
                            {log.action}
                        </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{log.target_resource}</TableCell>
                    <TableCell className="text-xs font-mono">{log.ip_address}</TableCell>
                    <TableCell className="text-slate-500 text-xs truncate max-w-[200px]" title={log.details}>
                        {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}