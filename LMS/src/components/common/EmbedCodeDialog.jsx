import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle2, Code2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmbedCodeDialog({ open, onClose, url, title }) {
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600px');
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe 
  src="${url}" 
  width="${width}" 
  height="${height}"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 12px;"
  title="${title}"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('קוד ההטמעה הועתק ללוח');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-600" />
            קוד הטמעה (Embed)
          </DialogTitle>
          <DialogDescription>
            העתק את הקוד הבא והדבק אותו באתר שלך להטמעת התוכן
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Size Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>רוחב</Label>
              <Input
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="100%"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>גובה</Label>
              <Input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="600px"
                dir="ltr"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>תצוגה מקדימה</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50">
              <div 
                className="mx-auto bg-white rounded-lg shadow-sm overflow-hidden"
                style={{ 
                  width: width === '100%' ? '100%' : width,
                  height: '200px',
                  maxWidth: '100%'
                }}
              >
                <iframe
                  src={url}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title={title}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>קוד HTML</Label>
            <div className="relative">
              <Textarea
                value={embedCode}
                readOnly
                className="font-mono text-xs h-32 bg-slate-900 text-green-400 border-slate-700"
                dir="ltr"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 left-2 h-7 gap-2"
                variant={copied ? "default" : "secondary"}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    הועתק!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    העתק קוד
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 הוראות שימוש:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>התאם את הרוחב והגובה לפי הצורך</li>
              <li>לחץ על "העתק קוד" כדי להעתיק את קוד ה-iframe</li>
              <li>הדבק את הקוד בדף ה-HTML שלך במקום הרצוי</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
          <Button onClick={handleCopy}>
            {copied ? <CheckCircle2 className="h-4 w-4 ml-2" /> : <Copy className="h-4 w-4 ml-2" />}
            {copied ? 'הועתק!' : 'העתק קוד'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}