export const PEDAGOGICAL_LIBRARY = {
  "version": "1.0",
  "language": "he",
  "tone_profiles": ["supportive", "neutral", "challenging"],
  "contexts": {
    "pre_task_entry": {
      "description": "Triggered when student enters a new task or unit",
      "prompts": [
        {
          "id": "intent_focus_01",
          "tone": "supportive",
          "message": "לפני שמתחילים — מה היית רוצה שיישאר איתך מהמשימה הזו?"
        },
        {
          "id": "intent_focus_02",
          "tone": "neutral",
          "message": "איזו רמת שליטה היית רוצה להשיג כאן?"
        },
        {
          "id": "intent_focus_03",
          "tone": "challenging",
          "message": "אם היית צריך ליישם את זה מחר — מה הכי חשוב שתבין עכשיו?"
        }
      ]
    },
    "prior_knowledge_check": {
      "description": "Triggered before content consumption",
      "prompts": [
        {
          "id": "pk_01",
          "tone": "supportive",
          "message": "גם אם אתה לא בטוח — איך אתה מרגיש ביחס לנושא הזה כרגע?"
        },
        {
          "id": "pk_02",
          "tone": "neutral",
          "message": "עד כמה החומר הזה מוכר לך מניסיון קודם?"
        },
        {
          "id": "pk_03",
          "tone": "challenging",
          "message": "מה לדעתך יהיה החלק הכי מאתגר כאן?"
        }
      ]
    },
    "reading_content": {
      "description": "Displayed during text-based learning",
      "prompts": [
        {
          "id": "read_01",
          "tone": "supportive",
          "message": "עצור רגע — אם היית צריך לסכם את הפסקה הזו במשפט אחד, מה היית כותב?"
        },
        {
          "id": "read_02",
          "tone": "neutral",
          "message": "איזו מילה או מושג כאן נראה לך מרכזי?"
        },
        {
          "id": "read_03",
          "tone": "challenging",
          "message": "איזו הנחה סמויה מסתתרת כאן לדעתך?"
        }
      ]
    },
    "video_learning": {
      "description": "Triggered during or after video playback",
      "prompts": [
        {
          "id": "video_01",
          "tone": "supportive",
          "message": "שווה לעצור רגע — מה הרעיון המרכזי שנאמר עד עכשיו?"
        },
        {
          "id": "video_02",
          "tone": "neutral",
          "message": "איזה מושג חדש שמעת כאן לראשונה?"
        },
        {
          "id": "video_03",
          "tone": "challenging",
          "message": "איפה לדעתך אפשר לטעות ביישום של מה שהוסבר?"
        }
      ]
    },
    "exercise_attempt": {
      "description": "Before or during exercise solving",
      "prompts": [
        {
          "id": "ex_01",
          "tone": "supportive",
          "message": "נסה קודם מהזיכרון — גם אם זה לא מושלם."
        },
        {
          "id": "ex_02",
          "tone": "neutral",
          "message": "איזו נוסחה או עיקרון אמור לעזור כאן?"
        },
        {
          "id": "ex_03",
          "tone": "challenging",
          "message": "איך היית מסביר את דרך הפתרון למישהו אחר?"
        }
      ]
    },
    "struggle_detected": {
      "description": "Triggered after wrong attempt or long inactivity",
      "prompts": [
        {
          "id": "struggle_01",
          "tone": "supportive",
          "message": "תקיעות היא חלק טבעי בלמידה — מה בדיוק לא ברור לך כאן?"
        },
        {
          "id": "struggle_02",
          "tone": "neutral",
          "message": "איזה שלב בפתרון מרגיש לך הכי בעייתי?"
        },
        {
          "id": "struggle_03",
          "tone": "challenging",
          "message": "אם היית צריך לשנות רק דבר אחד בגישה — מה זה היה?"
        }
      ]
    },
    "progress_feedback": {
      "description": "Shown at milestones",
      "prompts": [
        {
          "id": "prog_01",
          "tone": "supportive",
          "message": "יפה — ההתקדמות כאן מצטברת, גם אם זה לא מרגיש ככה."
        },
        {
          "id": "prog_02",
          "tone": "neutral",
          "message": "השלמת חלק משמעותי מהמשימה."
        },
        {
          "id": "prog_03",
          "tone": "challenging",
          "message": "מה לדעתך עדיין חסר כדי להרגיש שליטה אמיתית?"
        }
      ]
    },
    "post_task_reflection": {
      "description": "Triggered after task completion",
      "prompts": [
        {
          "id": "ref_01",
          "tone": "supportive",
          "message": "מה הפתיע אותך בלמידה הזו?"
        },
        {
          "id": "ref_02",
          "tone": "neutral",
          "message": "מה הבנת טוב יותר עכשיו לעומת ההתחלה?"
        },
        {
          "id": "ref_03",
          "tone": "challenging",
          "message": "איך היית ניגש למשימה דומה בפעם הבאה?"
        }
      ]
    }
  }
};

export const getPedagogicalPrompt = (contextId, tone = null) => {
    const context = PEDAGOGICAL_LIBRARY.contexts[contextId];
    if (!context) return null;

    let prompts = context.prompts;
    if (tone) {
        prompts = prompts.filter(p => p.tone === tone);
    }
    
    if (prompts.length === 0) return null;
    
    // Return random prompt from matching
    return prompts[Math.floor(Math.random() * prompts.length)];
};