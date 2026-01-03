// check_exam_questions.js
// בדיקת מבחנים ובוחנים עם content_data

import { createClient } from '@base44/sdk';

// יצירת client (ה-appId נלקח מ-base44Client.js)
const base44 = createClient({
  appId: "693824c5c1ad33c1f114ebd2",
  requiresAuth: false // סקריפט לא צריך auth
});

async function main() {
  console.log("בודק מבחנים ובוחנים במערכת...");
  console.log("=".repeat(80));

  try {
    // קבלת כל המטלות
    const assignments = await base44.entities.Assignment.list();

    // סינון מבחנים ובוחנים
    const exams = assignments.filter(a => a.type === 'exam' || a.type === 'quiz');

    console.log(`נמצאו ${exams.length} מבחנים/בוחנים\n`);

    // קטגוריזציה
    const withQuestions = [];
    const withoutContentData = [];
    const withContentNoQuestions = [];

    for (const exam of exams) {
      if (!exam.content_data) {
        withoutContentData.push(exam);
      } else if (!exam.content_data.questions || exam.content_data.questions.length === 0) {
        withContentNoQuestions.push(exam);
      } else {
        withQuestions.push(exam);
      }
    }

    console.log(`✅ עם שאלות: ${withQuestions.length}`);
    console.log(`⚠️  עם content_data אבל ללא questions: ${withContentNoQuestions.length}`);
    console.log(`❌ ללא content_data בכלל: ${withoutContentData.length}`);
    console.log("\n" + "=".repeat(80));

    // פירוט מבחנים עם שאלות
    if (withQuestions.length > 0) {
      console.log("\n📝 מבחנים/בוחנים עם שאלות:");
      console.log("-".repeat(80));
      for (const exam of withQuestions) {
        const questions = exam.content_data?.questions || [];
        console.log(`  ${exam.title || 'ללא כותרת'}`);
        console.log(`    - סוג: ${exam.type || 'לא ידוע'}`);
        console.log(`    - מספר שאלות: ${questions.length}`);
        if (questions.length > 0) {
          console.log(`    - דוגמה לשאלה: ${questions[0].question_text?.substring(0, 60)}...`);
        }
        console.log();
      }
    }

    // פירוט מבחנים ללא שאלות
    if (withoutContentData.length > 0 || withContentNoQuestions.length > 0) {
      console.log("\n⚠️  מבחנים/בוחנים ללא שאלות:");
      console.log("-".repeat(80));
      for (const exam of [...withoutContentData, ...withContentNoQuestions]) {
        console.log(`  ❌ ${exam.title || 'ללא כותרת'}`);
        console.log(`     ID: ${exam.id}`);
        console.log(`     סוג: ${exam.type || 'לא ידוע'}`);
        console.log();
      }
    }

    console.log("=".repeat(80));
    if (withoutContentData.length > 0 || withContentNoQuestions.length > 0) {
      console.log("💡 להרצת תיקון: node fix_exam_content_data.js");
    }

  } catch (error) {
    console.error("❌ שגיאה:", error.message);
    console.error(error);
  }
}

main();
