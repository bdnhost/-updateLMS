import React from 'react';
import DynamicGuideForm from '@/components/guides/DynamicGuideForm';

/**
 * דוגמה מתקדמת למדריך עם כל סוגי השדות
 */
const advancedGuideConfig = {
    title: "מדריך מקיף - כל סוגי השדות",
    chapter: "פרק 2: למידה מעמיקה",
    section: "מדור ב: תרגול מעשי",
    task: "מטלה 2: שאלון מקיף",
    introTitle: "🚀 ברוכים הבאים למדריך המתקדם",
    introduction: "במדריך זה תתנסו בכל סוגי השדות הזמינים במערכת. זהו דוגמה למדריך מקיף שמשלב שאלות מסוגים שונים.",
    fields: [
        {
            name: "student_name",
            label: "שם מלא",
            type: "text",
            placeholder: "הכנס את שמך המלא",
            required: true,
            hint: "שם פרטי ושם משפחה"
        },
        {
            name: "age",
            label: "גיל",
            type: "number",
            min: 12,
            max: 100,
            required: true
        },
        {
            name: "learning_preference",
            label: "מה הדרך המועדפת עליך ללמוד?",
            type: "multiple_choice",
            required: true,
            options: [
                { value: "video", label: "סרטוני הדרכה" },
                { value: "reading", label: "חומר כתוב" },
                { value: "practice", label: "תרגול מעשי" },
                { value: "discussion", label: "דיונים קבוצתיים" }
            ]
        },
        {
            name: "interests",
            label: "תחומי עניין (בחר כמה שתרצה)",
            type: "multiple_answers",
            options: [
                "תכנות",
                "עיצוב",
                "מדעים",
                "ספרות",
                "היסטוריה",
                "אומנות",
                "ספורט",
                "מוזיקה"
            ]
        },
        {
            name: "agree_rules",
            label: "האם אתה מסכים לכללי הקורס?",
            type: "true_false",
            required: true,
            trueLabel: "כן, אני מסכים",
            falseLabel: "לא, איני מסכים"
        },
        {
            name: "motivation",
            label: "מה מניע אותך ללמוד?",
            type: "essay",
            placeholder: "שתף אותנו במחשבות שלך (לפחות 100 מילים)...",
            required: true,
            description: "כתוב בחופשיות על המוטיבציה שלך"
        },
        {
            name: "match_terms",
            label: "התאם בין המונחים להגדרות",
            type: "matching",
            description: "גרור או בחר את ההגדרה המתאימה לכל מונח",
            pairs: [
                { left: "Algorithm" },
                { left: "Database" },
                { left: "API" }
            ],
            rightOptions: [
                "ממשק תכנות יישומים",
                "רצף הוראות לפתרון בעיה",
                "מאגר מידע מאורגן"
            ]
        },
        {
            name: "priority_order",
            label: "סדר את היעדים שלך לפי חשיבות (הכי חשוב למעלה)",
            type: "ordering",
            items: [
                "להבין את העקרונות",
                "לקבל ציון טוב",
                "לבנות פרויקט מעשי",
                "לעבוד עם אחרים"
            ]
        },
        {
            name: "fill_sentence",
            label: "השלם את המשפטים הבאים",
            type: "fill_blanks",
            sentences: [
                { before: "שפת התכנות האהובה עלי היא", after: "כי היא..." },
                { before: "בעתיד אני רוצה לעבוד בתחום", after: "" }
            ]
        },
        {
            name: "portfolio_file",
            label: "העלה קובץ CV או תיק עבודות (אופציונלי)",
            type: "file_upload",
            accept: ".pdf,.doc,.docx",
            description: "קבצים בפורמט PDF, DOC או DOCX בלבד"
        },
        {
            name: "additional_notes",
            label: "הערות נוספות",
            type: "textarea",
            placeholder: "כל דבר נוסף שתרצה לשתף..."
        }
    ]
};

export default function GuideExampleAdvanced() {
    return <DynamicGuideForm guideConfig={advancedGuideConfig} />;
}