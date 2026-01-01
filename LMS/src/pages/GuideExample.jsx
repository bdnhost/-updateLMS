import React from 'react';
import DynamicGuideForm from '@/components/guides/DynamicGuideForm';

/**
 * דוגמה פשוטה למדריך עם שימוש בקומפוננטה המודולרית
 * ראה GUIDE_SCHEMA.md למדריך מלא
 */
const simpleGuideConfig = {
    title: "מדריך הכרות והשתלבות",
    chapter: "פרק 1: היכרות ראשונית",
    section: "מדור א: אודותיך",
    task: "מטלה 1: טופס היכרות",
    introTitle: "🎯 מטרת המדריך",
    introduction: "מדריך זה נועד לעזור לנו להכיר אותך טוב יותר ולהתאים עבורך את חווית הלמידה. אנא מלא את השדות הבאים בכנות ובפירוט.",
    fields: [
        {
            name: "full_name",
            label: "שם מלא",
            type: "text",
            placeholder: "הכנס את שמך המלא",
            required: true
        },
        {
            name: "main_goal",
            label: "מהי המטרה העיקרית שלך?",
            type: "textarea",
            placeholder: "תאר במשפטים אחדים מה המטרה שלך מהקורס הזה",
            required: true
        },
        {
            name: "strengths",
            label: "תאר את החוזקות שלך",
            type: "textarea",
            placeholder: "מהם הכישורים והתחומים שבהם אתה טוב?",
            required: true
        },
        {
            name: "improvements",
            label: "באילו תחומים תרצה להשתפר?",
            type: "textarea",
            placeholder: "ספר לנו על התחומים שבהם תרצה להתפתח"
        },
        {
            name: "notes",
            label: "הערות נוספות",
            type: "textarea",
            placeholder: "כל דבר נוסף שתרצה לשתף איתנו"
        }
    ]
};

export default function GuideExample() {
    return <DynamicGuideForm guideConfig={simpleGuideConfig} />;
}