// fix_exam_content_data.js
// מילוי content_data למבחנים ובוחנים

import { createClient } from '@base44/sdk';

// יצירת client
const base44 = createClient({
  appId: "693824c5c1ad33c1f114ebd2",
  requiresAuth: false
});

function generateQuestions(examTitle, examType, numQuestions) {
  const questions = [];

  const isFinal = examTitle.includes('מבחן סיום') || examTitle.includes('מבחן גמר') || examTitle.toLowerCase().includes('final');
  const isMidterm = examTitle.includes('מבחן אמצע') || examTitle.toLowerCase().includes('midterm') || examTitle.includes('בוחן');

  const questionTemplates = {
    multipleChoice: [
      {
        question_text: 'מהו המושג המרכזי בנושא שנלמד?',
        question_type: 'multiple_choice',
        points: 10,
        options: ['הגדרה א', 'הגדרה ב', 'הגדרה ג', 'הגדרה ד']
      },
      {
        question_text: 'באיזו שיטה משתמשים לפתרון הבעיה?',
        question_type: 'multiple_choice',
        points: 10,
        options: ['שיטה ראשונה', 'שיטה שנייה', 'שיטה שלישית', 'שיטה רביעית']
      }
    ],
    open: [
      {
        question_text: 'הסבר בהרחבה את המושג המרכזי שנלמד בקורס',
        question_type: 'open_ended',
        points: 20
      },
      {
        question_text: 'תאר את התהליך המלא לפתרון הבעיה',
        question_type: 'open_ended',
        points: 20
      }
    ],
    practical: [
      {
        question_text: 'כתוב קוד המממש את הפונקציונליות הנדרשת',
        question_type: 'code',
        points: 25
      },
      {
        question_text: 'פתור את הבעיה המעשית הבאה',
        question_type: 'practical',
        points: 25
      }
    ]
  };

  // קביעת חלוקת סוגי שאלות
  let mcCount, openCount, practicalCount;

  if (examType === 'quiz') {
    mcCount = Math.floor(numQuestions * 0.8);
    openCount = numQuestions - mcCount;
    practicalCount = 0;
  } else if (isFinal) {
    mcCount = Math.floor(numQuestions * 0.4);
    openCount = Math.floor(numQuestions * 0.3);
    practicalCount = numQuestions - mcCount - openCount;
  } else if (isMidterm) {
    mcCount = Math.floor(numQuestions * 0.5);
    openCount = Math.floor(numQuestions * 0.3);
    practicalCount = numQuestions - mcCount - openCount;
  } else {
    mcCount = Math.floor(numQuestions * 0.5);
    openCount = Math.floor(numQuestions * 0.4);
    practicalCount = numQuestions - mcCount - openCount;
  }

  // הוספת שאלות רב ברירה
  for (let i = 0; i < mcCount; i++) {
    const template = questionTemplates.multipleChoice[i % questionTemplates.multipleChoice.length];
    questions.push({
      ...template,
      question_text: `שאלה ${i + 1}: ${template.question_text}`
    });
  }

  // הוספת שאלות פתוחות
  for (let i = 0; i < openCount; i++) {
    const template = questionTemplates.open[i % questionTemplates.open.length];
    questions.push({
      ...template,
      question_text: `שאלה ${mcCount + i + 1}: ${template.question_text}`
    });
  }

  // הוספת שאלות מעשיות
  for (let i = 0; i < practicalCount; i++) {
    const template = questionTemplates.practical[i % questionTemplates.practical.length];
    questions.push({
      ...template,
      question_text: `שאלה ${mcCount + openCount + i + 1}: ${template.question_text}`
    });
  }

  return questions;
}

async function main() {
  console.log("מחפש מבחנים ובוחנים ללא content_data...");
  console.log("=".repeat(80));

  try {
    // קבלת כל המטלות
    const assignments = await base44.entities.Assignment.list();

    // סינון מבחנים ובוחנים
    const exams = assignments.filter(a => a.type === 'exam' || a.type === 'quiz');

    console.log(`נמצאו ${exams.length} מבחנים/בוחנים`);

    // מציאת מבחנים ללא content_data או ללא questions
    const needsUpdate = exams.filter(exam =>
      !exam.content_data || !exam.content_data.questions || exam.content_data.questions.length === 0
    );

    console.log(`מתוכם ${needsUpdate.length} דורשים עדכון\n`);

    if (needsUpdate.length === 0) {
      console.log("כל המבחנים והבוחנים כבר מעודכנים!");
      return;
    }

    // עדכון כל מבחן
    let updatedCount = 0;

    for (const exam of needsUpdate) {
      const examTitle = exam.title || 'ללא כותרת';
      const examType = exam.type || 'exam';

      // קביעת מספר שאלות
      const numQuestions = examType === 'quiz' ? 5 : 10;

      // יצירת שאלות
      const questions = generateQuestions(examTitle, examType, numQuestions);

      // בניית content_data
      const contentData = {
        questions,
        total_points: questions.reduce((sum, q) => sum + (q.points || 10), 0),
        time_limit_minutes: examType === 'exam' ? 90 : 45,
        instructions: `מבחן זה כולל ${numQuestions} שאלות. קרא כל שאלה בעיון וענה בצורה מפורטת ומדויקת.`
      };

      // עדכון במערכת
      try {
        await base44.entities.Assignment.update(exam.id, {
          content_data: contentData
        });

        console.log(`✅ עודכן: ${examTitle}`);
        console.log(`   סוג: ${examType}, שאלות: ${numQuestions}, נקודות: ${contentData.total_points}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ שגיאה בעדכון ${examTitle}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`סיום: עודכנו ${updatedCount} מבחנים/בוחנים`);

  } catch (error) {
    console.error("❌ שגיאה:", error.message);
    console.error(error);
  }
}

main();
