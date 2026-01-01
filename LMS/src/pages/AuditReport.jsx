import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ShieldAlert, FileText } from 'lucide-react';

export default function AuditReport() {
  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-8 w-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900">System Audit & Reset Report</h1>
      </div>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            1. Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            A full system reset and security audit was performed on <strong>2025-12-10</strong>. 
            All user-generated data has been securely wiped to ensure a clean state. 
            A comprehensive review of the system architecture, data models, and security controls was conducted.
          </p>
          <div className="mt-4 flex gap-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Status: System Reset Complete</Badge>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ready for Onboarding</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            2. Actions Performed (Data Wipe)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-slate-600">
            {[
              'Organization', 'Payment', 'Course', 'Student', 
              'Attendance', 'Assignment', 'Grade', 'CalendarEvent', 
              'Material', 'Announcement', 'Message'
            ].map((entity) => (
              <div key={entity} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="line-through">{entity}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">* SubscriptionPlan configuration was preserved.</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            3. Critical Findings: Multi-Tenancy Gap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h4 className="font-semibold text-red-900 mb-2">Issue Identified</h4>
            <p className="text-red-800 text-sm">
              While <code>Organization</code> and <code>Payment</code> entities support True Multi-Tenancy via <code>organization_id</code>, 
              the core educational entities (Course, Student, etc.) currently lack this identifier and rely on <code>created_by</code>.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Recommendations</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li><strong>Schema Migration:</strong> Add <code>organization_id</code> to all entities immediately.</li>
              <li><strong>Unified Filtering:</strong> Refactor all queries to filter by Organization ID instead of User Email.</li>
              <li><strong>Invite System:</strong> Implement user invitations to bind users to organizations.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}