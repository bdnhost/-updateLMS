import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PrintLayout, { PrintButton } from '@/components/common/PrintLayout';
import { Loader2, FileText, Calendar, Award, CheckSquare, Target, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

export default function AssignmentPrintDocument({ assignment, course, trigger }) {
    const [open, setOpen] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
    const printRef = React.useRef(null);

    const { data: organization } = useQuery({
        queryKey: ['organization', course?.organization_id],
        queryFn: () => base44.entities.Organization.get(course.organization_id),
        enabled: open && !!course
    });

    const { data: relatedMaterials } = useQuery({
        queryKey: ['assignmentMaterials', assignment.id],
        queryFn: async () => {
            const links = await base44.entities.AssignmentMaterial.filter({ assignment_id: assignment.id });
            if (links.length === 0) return [];
            
            const materialIds = links.map(l => l.material_id);
            const allMaterials = await base44.entities.Material.list();
            return allMaterials.filter(m => materialIds.includes(m.id));
        },
        enabled: open
    });

    const typeLabels = {
        assignment: 'מטלה',
        quiz: 'בוחן',
        exam: 'מבחן',
        project: 'פרויקט'
    };

    const handleExportPDF = async () => {
        if (!printRef.current) return;
        
        setIsExporting(true);
        try {
            const element = printRef.current;
            const canvas = await html2canvas(element, {
                scale: 1,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${assignment.title}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('שגיאה ביצירת PDF');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <FileText className="w-4 h-4" />
                        הדפסת מטלה
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle>הדפסת מטלה - {assignment.title}</DialogTitle>
                </DialogHeader>
                
                <div ref={printRef}>
                <PrintLayout
                    title={typeLabels[assignment.type] || 'מטלה'}
                    subtitle={assignment.title}
                    organizationName={organization?.name}
                    organizationLogo={organization?.logo_url || course?.logo_url}
                    documentType="assignment"
                    metadata={{
                        קורס: course?.name,
                        'תאריך הגשה': assignment.due_date,
                        'משקל בציון': assignment.weight ? `${assignment.weight}%` : 'לא נקבע',
                        'ציון מקסימלי': assignment.max_score || 100
                    }}
                >
                    {/* Assignment Description & Guidelines */}
                    <div className="avoid-break">
                        <h3 className="print-section-title flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-600" />
                            הנחיות המטלה
                        </h3>
                        <div className="print-info-box">
                            {assignment.description ? (
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {assignment.description}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">לא הוזנו הנחיות למטלה זו</p>
                            )}
                        </div>
                    </div>

                    {/* Assignment Meta Info */}
                    <div className="avoid-break">
                        <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div>
                                <span className="font-semibold text-slate-600">סוג המטלה:</span>
                                <span className="mr-2">{typeLabels[assignment.type] || assignment.type}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-600">תאריך הגשה:</span>
                                <span className="mr-2">{assignment.due_date || 'לא נקבע'}</span>
                            </div>
                            {assignment.weight && (
                                <div>
                                    <span className="font-semibold text-slate-600">משקל בציון הסופי:</span>
                                    <span className="mr-2">{assignment.weight}%</span>
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-slate-600">ציון מקסימלי:</span>
                                <span className="mr-2">{assignment.max_score || 100}</span>
                            </div>
                        </div>
                    </div>

                    {/* Key Concepts */}
                    {assignment.key_concepts && assignment.key_concepts.length > 0 ? (
                        <div className="avoid-break">
                            <h3 className="print-section-title">מושגי מפתח</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {assignment.key_concepts.map((concept, idx) => (
                                    <div key={idx} className="print-info-box p-3 bg-amber-50/50 border border-amber-100">
                                        <div className="font-bold text-slate-800 mb-1">{concept.term}</div>
                                        {concept.definition && (
                                            <div className="text-sm text-slate-600">{concept.definition}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="avoid-break">
                            <h3 className="print-section-title">מושגי מפתח</h3>
                            <div className="print-info-box bg-slate-50/50 border-dashed">
                                <p className="text-slate-400 text-center italic">לא הוגדרו מושגי מפתח למטלה זו</p>
                            </div>
                        </div>
                    )}

                    {/* Related Materials */}
                    {relatedMaterials && relatedMaterials.length > 0 && (
                        <div className="avoid-break">
                            <h3 className="print-section-title">חומרי עזר מומלצים</h3>
                            <ul className="print-list">
                                {relatedMaterials.map((material, idx) => (
                                    <li key={material.id} className="print-list-item">
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-slate-600">{idx + 1}.</span>
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-800">{material.title}</div>
                                                {material.description && (
                                                    <div className="text-sm text-slate-600 mt-1">{material.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Resource Links */}
                    {assignment.resource_links && assignment.resource_links.length > 0 && (
                        <div className="avoid-break">
                            <h3 className="print-section-title">קישורים ומקורות</h3>
                            <ul className="print-list text-sm">
                                {assignment.resource_links.map((link, idx) => (
                                    <li key={idx} className="print-list-item font-mono break-all">
                                        {link}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Work Area for Students */}
                    <div className="avoid-break mt-8">
                        <h3 className="print-section-title">מרחב עבודה</h3>
                        <div className="print-info-box min-h-[400px] bg-slate-50/30">
                            <div className="text-sm text-slate-500 mb-4">
                                השתמש במרחב זה לרישומים, תשובות וסקיצות:
                            </div>
                            <div className="space-y-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="border-b border-slate-200 pb-3"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Student Details Section */}
                    <div className="avoid-break mt-6 border-t pt-6">
                        <h3 className="print-section-title">פרטי התלמיד</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="print-info-box">
                                <Label className="text-sm font-semibold text-slate-600 mb-2 block">שם מלא:</Label>
                                <div className="border-b-2 border-slate-300 pb-2"></div>
                            </div>
                            <div className="print-info-box">
                                <Label className="text-sm font-semibold text-slate-600 mb-2 block">תעודת זהות:</Label>
                                <div className="border-b-2 border-slate-300 pb-2"></div>
                            </div>
                            <div className="print-info-box">
                                <Label className="text-sm font-semibold text-slate-600 mb-2 block">תאריך הגשה:</Label>
                                <div className="border-b-2 border-slate-300 pb-2"></div>
                            </div>
                            <div className="print-info-box">
                                <Label className="text-sm font-semibold text-slate-600 mb-2 block">חתימה:</Label>
                                <div className="border-b-2 border-slate-300 pb-2"></div>
                            </div>
                        </div>

                        {/* QR Code for Digital Submission */}
                        <div className="mt-4 print-info-box bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200">
                            <div className="text-center">
                                <h4 className="font-bold text-slate-800 mb-2">הגשה דיגיטלית (אופציונלי)</h4>
                                <p className="text-sm text-slate-600 mb-3">
                                    סרוק את הברקוד להגשה דיגיטלית:
                                </p>
                                <div className="flex justify-center mb-2">
                                    <QRCodeSVG 
                                        value={`${window.location.origin}/PublicView?type=assignment&id=${assignment.id}`}
                                        size={120}
                                        level="M"
                                        includeMargin={true}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    ניתן לצרף תמונות של העבודה הכתובה או להשלים את המטלה באופן דיגיטלי
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="no-print mt-6 flex justify-center">
                        <PrintButton className="px-8 py-3 text-lg" filename={`מטלה-${assignment?.title || 'document'}.pdf`}>ייצא PDF</PrintButton>
                    </div>
                </PrintLayout>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Label({ children, className }) {
    return <span className={className}>{children}</span>;
}