import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building, Smartphone, Code2, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EmbedCodeDialog from '@/components/common/EmbedCodeDialog';
import { createPageUrl } from '@/utils';

export default function OrganizationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [embedOrg, setEmbedOrg] = useState(null);

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list()
  });

  const getPlan = (planId) => plans?.find(p => p.id === planId);

  const filteredOrgs = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.billing_email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-500" />
            ארגונים ושימוש (Organizations & Usage)
        </CardTitle>
        <div className="relative w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="חפש לפי שם ארגון..." 
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
                <TableHead className="text-right">ארגון</TableHead>
                <TableHead className="text-right">תוכנית</TableHead>
                <TableHead className="text-right">סטטוס מנוי</TableHead>
                <TableHead className="text-right w-1/3">ניצול SMS</TableHead>
                <TableHead className="text-right">הערות</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    טוען נתונים...
                  </TableCell>
                </TableRow>
              ) : filteredOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    לא נמצאו ארגונים
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrgs.map((org) => {
                    const plan = getPlan(org.plan_id);
                    const maxSMS = plan?.max_sms || 0;
                    const usage = org.sms_usage || 0;
                    const percent = maxSMS > 0 ? (usage / maxSMS) * 100 : 0;
                    
                    return (
                  <TableRow key={org.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                        <div>
                            <div className="font-bold">{org.name}</div>
                            <div className="text-xs text-slate-500">{org.billing_email}</div>
                        </div>
                    </TableCell>
                    <TableCell>{plan?.name || '-'}</TableCell>
                    <TableCell>
                        <Badge variant={org.subscription_status === 'active' ? 'outline' : 'secondary'} className={org.subscription_status === 'active' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                            {org.subscription_status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>{usage} / {maxSMS || '∞'}</span>
                                <span>{percent.toFixed(0)}%</span>
                            </div>
                            <Progress value={Math.min(percent, 100)} className={`h-2 ${percent > 90 ? 'text-red-600' : ''}`} />
                        </div>
                    </TableCell>
                    <TableCell>
                        {org.internal_notes && (
                            <div className="text-xs text-slate-500 truncate max-w-[150px]" title={org.internal_notes}>
                                {org.internal_notes}
                            </div>
                        )}
                    </TableCell>
                    <TableCell>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEmbedOrg(org)}
                            className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                            <Code2 className="w-3 h-3" />
                            הטמע
                        </Button>
                    </TableCell>
                  </TableRow>
                )}) 
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {embedOrg && (
        <EmbedCodeDialog
          open={!!embedOrg}
          onClose={() => setEmbedOrg(null)}
          embedUrl={`${window.location.origin}${createPageUrl('PublicView')}?type=school&id=${embedOrg.id}`}
          title={`הטמעת דף ארגון: ${embedOrg.name}`}
        />
      )}
    </Card>
  );
}