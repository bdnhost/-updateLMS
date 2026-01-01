import React from 'react';
import { GraduationCap, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PrintLayout - תשתית הדפסה אחידה למסמכי עבודה
 * 
 * Props:
 * - title: כותרת המסמך
 * - subtitle: כותרת משנה (אופציונלי)
 * - organizationName: שם הארגון
 * - organizationLogo: לוגו הארגון (URL)
 * - documentType: סוג המסמך (attendance, grades, session-prep, materials-review)
 * - metadata: מטא-דאטה נוספת (תאריך, קורס, מפגש וכו')
 * - children: תוכן המסמך
 * - footer: תוכן פוטר מותאם אישית (אופציונלי)
 */
export default function PrintLayout({
    title,
    subtitle,
    organizationName = 'EduManage',
    organizationLogo,
    documentType = 'general',
    metadata = {},
    children,
    footer
}) {
    const printDate = new Date().toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="print-document" dir="rtl">
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    .print-document {
                        width: 100%;
                        max-width: none;
                        margin: 0;
                        padding: 0;
                        font-family: 'Heebo', 'Noto Sans Hebrew', Arial, sans-serif;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .page-break {
                        page-break-after: always;
                    }
                    
                    .avoid-break {
                        page-break-inside: avoid;
                    }
                    
                    button, nav, header.no-print, aside {
                        display: none !important;
                    }
                }
                
                @media screen {
                    .print-document {
                        max-width: 210mm;
                        margin: 20px auto;
                        padding: 20mm;
                        background: white;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        min-height: 297mm;
                    }
                }
                
                .print-document {
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #1e293b;
                }
                
                .print-header {
                    border-bottom: 3px solid #7c3aed;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                    background: white !important;
                    page-break-after: avoid;
                }

                .print-title {
                    font-size: 24pt;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }
                
                .print-subtitle {
                    font-size: 14pt;
                    color: #64748b;
                    margin: 0 0 12px 0;
                }
                
                .print-metadata {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    font-size: 10pt;
                    color: #64748b;
                    margin-top: 12px;
                }
                
                .print-metadata-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .print-metadata-label {
                    font-weight: 600;
                    color: #475569;
                }
                
                .print-content {
                    margin: 25px 0;
                }
                
                .print-footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 9pt;
                    color: #94a3b8;
                    background: white !important;
                    page-break-before: avoid;
                }

                @media print {
                    .print-footer {
                        position: fixed;
                        bottom: 15mm;
                        left: 15mm;
                        right: 15mm;
                    }
                }
                
                .print-footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .print-footer-logo img {
                    height: 32px;
                    width: auto;
                }
                
                .print-footer-info {
                    text-align: left;
                }
                
                .doc-type-attendance .print-header {
                    border-bottom-color: #10b981;
                }
                
                .doc-type-grades .print-header {
                    border-bottom-color: #f59e0b;
                }
                
                .doc-type-session-prep .print-header {
                    border-bottom-color: #3b82f6;
                }
                
                .doc-type-materials-review .print-header {
                    border-bottom-color: #ec4899;
                }
                
                .doc-type-assignment .print-header {
                    border-bottom-color: #7c3aed;
                }
                
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                
                .print-table th {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 10px;
                    text-align: start;
                    font-weight: 600;
                    color: #475569;
                }
                
                .print-table td {
                    border: 1px solid #e2e8f0;
                    padding: 10px;
                    text-align: start;
                }
                
                .print-table tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                
                .print-list {
                    list-style-position: inside;
                    margin: 10px 0;
                }
                
                .print-list-item {
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .print-info-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-right: 4px solid #7c3aed;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 4px;
                }
                
                .print-section-title {
                    font-size: 14pt;
                    font-weight: 600;
                    color: #334155;
                    margin: 20px 0 12px 0;
                    padding-bottom: 6px;
                    border-bottom: 2px solid #e2e8f0;
                }
            `}</style>

            <div className={`doc-type-${documentType} print-container`}>
                {/* Header */}
                <div className="print-header">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h1 className="print-title">{title}</h1>
                            {subtitle && <h2 className="print-subtitle">{subtitle}</h2>}
                        </div>
                        {organizationLogo && (
                            <img
                                src={organizationLogo}
                                alt={organizationName}
                                className="h-16 w-auto object-contain"
                            />
                        )}
                    </div>

                    {Object.keys(metadata).length > 0 && (
                        <div className="print-metadata">
                            {metadata.date && (
                                <div className="print-metadata-item">
                                    <span className="print-metadata-label">תאריך:</span>
                                    <span className="text-lg font-semibold">{metadata.date}</span>
                                </div>
                            )}
                            {metadata.course && (
                                <div className="print-metadata-item">
                                    <span className="print-metadata-label">קורס:</span>
                                    <span>{metadata.course}</span>
                                </div>
                            )}
                            {metadata.session && (
                                <div className="print-metadata-item">
                                    <span className="print-metadata-label">מפגש:</span>
                                    <span>{metadata.session}</span>
                                </div>
                            )}
                            {metadata.teacher && (
                                <div className="print-metadata-item">
                                    <span className="print-metadata-label">מרצה:</span>
                                    <span>{metadata.teacher}</span>
                                </div>
                            )}
                            {Object.entries(metadata)
                                .filter(([key]) => !['date', 'course', 'session', 'teacher'].includes(key))
                                .map(([key, value]) => (
                                    <div key={key} className="print-metadata-item">
                                        <span className="print-metadata-label">{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="print-content">
                    {children}
                </div>

                {/* Footer */}
                <div className="print-footer">
                    <div className="print-footer-logo">
                        {organizationLogo ? (
                            <img src={organizationLogo} alt={organizationName} />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-slate-700">{organizationName}</span>
                            </div>
                        )}
                    </div>

                    {footer || (
                        <div className="print-footer-info">
                            <div>הופק בתאריך: {printDate}</div>
                            <div className="mt-1">מופק באמצעות מערכת EduManage</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * PrintButton - כפתור ייצוא PDF מתוקן ללא כפילויות
 */
export function PrintButton({ className = '', children = 'ייצא PDF', filename = 'document.pdf', ...props }) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleExportPDF = async () => {
        setIsGenerating(true);
        try {
            const printContainer = document.querySelector('.print-container');
            if (!printContainer) {
                console.error('Print container not found');
                window.print();
                return;
            }

            // Hide no-print elements
            const noPrintElements = printContainer.querySelectorAll('.no-print');
            const originalDisplays = [];
            noPrintElements.forEach(el => {
                originalDisplays.push(el.style.display);
                el.style.display = 'none';
            });

            // Save original styles
            const originalWidth = printContainer.style.width;
            const originalMaxWidth = printContainer.style.maxWidth;
            const originalPadding = printContainer.style.padding;
            
            // Set A4 width for consistent rendering
            printContainer.style.width = '794px'; // A4 width at 96 DPI
            printContainer.style.maxWidth = '794px';
            printContainer.style.padding = '40px'; // Consistent padding

            // Wait for images to load
            const images = printContainer.querySelectorAll('img');
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );

            // Generate high-quality canvas
            const canvas = await html2canvas(printContainer, {
                scale: 2, // High quality
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                windowWidth: 794,
                height: printContainer.scrollHeight,
                imageTimeout: 0,
                removeContainer: false,
                onclone: (clonedDoc) => {
                    // Ensure all styles are applied in cloned document
                    const clonedContainer = clonedDoc.querySelector('.print-container');
                    if (clonedContainer) {
                        clonedContainer.style.width = '794px';
                        clonedContainer.style.maxWidth = '794px';
                        clonedContainer.style.padding = '40px';
                    }
                }
            });

            // Restore original styles
            printContainer.style.width = originalWidth;
            printContainer.style.maxWidth = originalMaxWidth;
            printContainer.style.padding = originalPadding;
            noPrintElements.forEach((el, index) => {
                el.style.display = originalDisplays[index];
            });

            // PDF Configuration (A4)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const margin = 10; // 10mm margins

            // Calculate dimensions
            const contentWidth = pdfWidth - (margin * 2);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * contentWidth) / canvas.width;
            const pageHeight = pdfHeight - (margin * 2);

            // Convert canvas to high-quality image
            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            let heightLeft = imgHeight;
            let position = 0;
            let page = 1;

            // Add first page
            pdf.addImage(
                imgData,
                'JPEG',
                margin,
                margin,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            );

            heightLeft -= pageHeight;

            // Add subsequent pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                page++;

                pdf.addImage(
                    imgData,
                    'JPEG',
                    margin,
                    position + margin,
                    imgWidth,
                    imgHeight,
                    undefined,
                    'FAST'
                );

                heightLeft -= pageHeight;
            }

            // Save PDF
            pdf.save(filename);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('שגיאה ביצירת PDF. אנא נסה שנית או השתמש בהדפסה רגילה.');
            window.print();
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className={`no-print px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold ${className}`}
            {...props}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    מייצר PDF...
                </>
            ) : (
                <>
                    <Download className="w-5 h-5" />
                    {children}
                </>
            )}
        </button>
    );
}

/**
 * PrintPreview - תצוגת מקדימה להדפסה
 */
export function PrintPreview({ children, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-auto no-print">
            <div className="min-h-screen p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-5 mb-6 flex justify-between items-center sticky top-6 z-10 shadow-2xl border-2 border-indigo-200">
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-indigo-600" />
                            </div>
                            תצוגה מקדימה להדפסה
                        </h3>
                        <div className="flex gap-3">
                            <PrintButton className="px-8 py-3 text-base">
                                ייצא PDF
                            </PrintButton>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 border-2 border-slate-300 rounded-xl hover:bg-slate-100 transition-all font-bold text-slate-700 hover:shadow-lg"
                                >
                                    סגור
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-200">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}