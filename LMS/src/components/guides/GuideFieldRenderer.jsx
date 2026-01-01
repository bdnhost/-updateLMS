import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Upload, GripVertical } from 'lucide-react';

/**
 * GuideFieldRenderer - רכיב מרכזי לרינדור שדות דינמיים במדריכים
 * תומך בכל סוגי השדות הנפוצים
 */
export default function GuideFieldRenderer({ field, value, onChange, disabled = false }) {
    const handleChange = (newValue) => {
        if (onChange) {
            onChange(field.name, newValue);
        }
    };

    const renderField = () => {
        switch (field.type) {
            case 'text':
            case 'short_answer':
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        required={field.required}
                        className="w-full"
                    />
                );

            case 'textarea':
            case 'essay':
            case 'long_answer':
                return (
                    <Textarea
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        required={field.required}
                        className="w-full min-h-[120px]"
                    />
                );

            case 'number':
            case 'numerical':
                return (
                    <Input
                        type="number"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        required={field.required}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className="w-full"
                    />
                );

            case 'multiple_choice':
            case 'radio':
                return (
                    <RadioGroup value={value || ''} onValueChange={handleChange} disabled={disabled}>
                        <div className="space-y-3">
                            {field.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                    <RadioGroupItem value={option.value || option} id={`${field.name}-${idx}`} />
                                    <Label htmlFor={`${field.name}-${idx}`} className="flex-1 cursor-pointer">
                                        {option.label || option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                );

            case 'multiple_answers':
            case 'checkbox_group':
                return (
                    <div className="space-y-3">
                        {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <Checkbox
                                    id={`${field.name}-${idx}`}
                                    checked={value?.includes(option.value || option) || false}
                                    onCheckedChange={(checked) => {
                                        const currentValues = value || [];
                                        const optionValue = option.value || option;
                                        if (checked) {
                                            handleChange([...currentValues, optionValue]);
                                        } else {
                                            handleChange(currentValues.filter(v => v !== optionValue));
                                        }
                                    }}
                                    disabled={disabled}
                                />
                                <Label htmlFor={`${field.name}-${idx}`} className="flex-1 cursor-pointer">
                                    {option.label || option}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            case 'true_false':
            case 'boolean':
                return (
                    <RadioGroup value={value?.toString() || ''} onValueChange={(v) => handleChange(v === 'true')} disabled={disabled}>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <RadioGroupItem value="true" id={`${field.name}-true`} />
                                <Label htmlFor={`${field.name}-true`} className="flex-1 cursor-pointer">
                                    {field.trueLabel || 'אמת'}
                                </Label>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <RadioGroupItem value="false" id={`${field.name}-false`} />
                                <Label htmlFor={`${field.name}-false`} className="flex-1 cursor-pointer">
                                    {field.falseLabel || 'שקר'}
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                );

            case 'matching':
                return (
                    <div className="space-y-4">
                        {field.pairs?.map((pair, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                                <div className="font-medium">{pair.left}</div>
                                <select
                                    value={value?.[idx] || ''}
                                    onChange={(e) => {
                                        const newValue = [...(value || [])];
                                        newValue[idx] = e.target.value;
                                        handleChange(newValue);
                                    }}
                                    disabled={disabled}
                                    className="p-2 rounded border border-slate-200"
                                >
                                    <option value="">בחר...</option>
                                    {field.rightOptions?.map((option, optIdx) => (
                                        <option key={optIdx} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                );

            case 'ordering':
            case 'sorting':
                return (
                    <div className="space-y-2">
                        {(value || field.items)?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                                <span className="flex-1">{item}</span>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (idx === 0) return;
                                            const newValue = [...(value || field.items)];
                                            [newValue[idx - 1], newValue[idx]] = [newValue[idx], newValue[idx - 1]];
                                            handleChange(newValue);
                                        }}
                                        disabled={disabled || idx === 0}
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const items = value || field.items;
                                            if (idx === items.length - 1) return;
                                            const newValue = [...items];
                                            [newValue[idx], newValue[idx + 1]] = [newValue[idx + 1], newValue[idx]];
                                            handleChange(newValue);
                                        }}
                                        disabled={disabled || idx === (value || field.items)?.length - 1}
                                    >
                                        ↓
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'file_upload':
                return (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <input
                            type="file"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Upload file logic here
                                    handleChange(file.name);
                                }
                            }}
                            disabled={disabled}
                            accept={field.accept}
                            className="text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            {field.accept ? `קבצים נתמכים: ${field.accept}` : 'כל סוגי הקבצים'}
                        </p>
                    </div>
                );

            case 'fill_blanks':
                return (
                    <div className="space-y-3">
                        {field.sentences?.map((sentence, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-sm">{sentence.before}</span>
                                <Input
                                    value={value?.[idx] || ''}
                                    onChange={(e) => {
                                        const newValue = [...(value || [])];
                                        newValue[idx] = e.target.value;
                                        handleChange(newValue);
                                    }}
                                    disabled={disabled}
                                    className="max-w-[200px]"
                                    placeholder="___"
                                />
                                <span className="text-sm">{sentence.after}</span>
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        סוג שדה לא נתמך: {field.type}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-2">
            {field.label && (
                <Label htmlFor={field.name} className="text-base font-semibold flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                </Label>
            )}
            {field.description && (
                <p className="text-sm text-slate-600 mb-2">{field.description}</p>
            )}
            {renderField()}
            {field.hint && (
                <p className="text-xs text-slate-500 mt-1">{field.hint}</p>
            )}
        </div>
    );
}