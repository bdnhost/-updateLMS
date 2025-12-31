import requests
import json
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }
    if method.upper() == 'GET':
        response = requests.request(method, url, headers=headers, params=data)
    else:
        response = requests.request(method, url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

# מדריכים בקטגוריות - ממדריכים.md
GUIDES = {
    "terminal": "https://bdnhost.net/Resources/guides/digital-basics/terminal_guide.html",
    "github": "https://bdnhost.net/Resources/guides/digital-basics/github_guide.html",
    "file_management": "https://bdnhost.net/Resources/guides/digital-basics/file-management.html",
    "internet_basics": "https://bdnhost.net/Resources/guides/digital-basics/internet_basics.html",
    "algorithmic_thinking": "https://bdnhost.net/Resources/guides/digital-basics/algorithmic_thinking.html",
    "digital_literacy": "https://bdnhost.net/Resources/guides/digital-basics/digital_literacy_basics_guide.html",
    "cv_guide": "https://bdnhost.net/Resources/guides/digital-basics/cv_guide.html",
    "python": "https://bdnhost.net/Resources/guides/ai-automation/python_guide.html",
    "chatgpt": "https://bdnhost.net/Resources/guides/ai-automation/chatgpt_guide.html",
    "prompt_engineering": "https://bdnhost.net/Resources/guides/ai-automation/prompt-engineering-guide.html",
    "llm": "https://bdnhost.net/Resources/guides/ai-automation/understanding-llms-how-it-works.html",
    "web_scraping": "https://bdnhost.net/Resources/guides/ai-automation/web_scraping_guide.html",
    "react": "https://bdnhost.net/Resources/guides/ai-automation/react-pro-guide.html",
    "agentic_ai": "https://bdnhost.net/Resources/guides/ai-automation/agentic-ai-for-managers.html",
    "ai_basics": "https://bdnhost.net/Resources/guides/ai-automation/ai_basics.html",
    "ai_ethics": "https://bdnhost.net/Resources/guides/ai-automation/ai_ethics.html",
    "ai_for_educators": "https://bdnhost.net/Resources/guides/ai-automation/guide-comprehensive-ai-applications-for-educators.html",
    "sql": "https://bdnhost.net/Resources/guides/data-business/sql_guide.html",
    "data_analysis": "https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html",
    "excel": "https://bdnhost.net/Resources/guides/data-business/excel_student.html",
    "powerbi": "https://bdnhost.net/Resources/guides/data-business/powerbi_guide.html",
    "marketing": "https://bdnhost.net/Resources/guides/data-business/marketing_guide.html",
    "video_marketing": "https://bdnhost.net/Resources/guides/data-business/short-video-marketing-strategy.html",
    "canva": "https://bdnhost.net/Resources/guides/creative-studio/canva_guide.html",
    "ui_ux": "https://bdnhost.net/Resources/guides/creative-studio/ui_ux_guide.html",
    "video_editing": "https://bdnhost.net/Resources/guides/creative-studio/video_editing_guide.html",
    "mechanical_design": "https://bdnhost.net/Resources/guides/creative-studio/mechanical_design_guide.html",
    "midjourney": "https://bdnhost.net/Resources/guides/creative-studio/midjourney-for-marketing-visuals.html",
    "microbit": "https://bdnhost.net/Resources/guides/creative-studio/creative-coding-for-kids-microbit.html",
    "learning_skills": "https://bdnhost.net/Resources/guides/creative-studio/ai-tools-and-applications-guide-for-education-professionals.html",
    "docker": "https://bdnhost.net/Resources/guides/technology/docker-usage-guide.html",
    "iot": "https://bdnhost.net/Resources/guides/technology/iot_guide.html",
    "automotive": "https://bdnhost.net/Resources/guides/technology/automotive_guide.html",
    "career_prep": "https://bdnhost.net/Resources/guides/career/career_prep.html",
    "portfolio": "https://bdnhost.net/Resources/guides/career/building-impressive-digital-portfolio.html",
    "presentation": "https://bdnhost.net/Resources/guides/career/presentation_skills.html",
}

def get_relevant_guides(material_title, material_type, material_topic):
    """חלץ קישורים רלוונטיים לפי תוכן החומר"""
    relevant = []
    title_lower = (material_title or "").lower()
    
    # Terminal
    if any(word in title_lower for word in ["terminal", "command", "cli", "shell"]):
        relevant.extend([GUIDES["terminal"], GUIDES["file_management"]])
    
    # Python
    elif any(word in title_lower for word in ["python", "coding", "code"]):
        relevant.extend([GUIDES["python"], GUIDES["algorithmic_thinking"]])
    
    # Data
    elif any(word in title_lower for word in ["data", "sql", "excel"]):
        relevant.extend([GUIDES["data_analysis"], GUIDES["sql"]])
    
    # AI
    elif any(word in title_lower for word in ["ai", "chatgpt", "prompt", "llm"]):
        relevant.extend([GUIDES["ai_basics"], GUIDES["prompt_engineering"], GUIDES["llm"]])
    
    # GitHub
    elif any(word in title_lower for word in ["git", "github"]):
        relevant.append(GUIDES["github"])
    
    # Design/UI
    elif any(word in title_lower for word in ["ui", "ux", "design", "hmi"]):
        relevant.extend([GUIDES["ui_ux"], GUIDES["canva"]])
    
    # Mechanical/PLC
    elif any(word in title_lower for word in ["plc", "mechanical", "ladder", "automation"]):
        relevant.extend([GUIDES["mechanical_design"], GUIDES["iot"], GUIDES["docker"]])
    
    # Video
    elif any(word in title_lower for word in ["video", "presentation"]):
        relevant.extend([GUIDES["video_editing"], GUIDES["presentation"]])
    
    # Career
    elif any(word in title_lower for word in ["career", "cv", "portfolio"]):
        relevant.extend([GUIDES["portfolio"], GUIDES["presentation"]])
    
    # Default
    if not relevant:
        relevant.extend([GUIDES["terminal"], GUIDES["python"], GUIDES["data_analysis"]])
    
    return list(dict.fromkeys(relevant))  # Remove duplicates

print("=" * 100)
print("🔄 עדכון כל חומרי הלימוד עם קישורים רלוונטיים")
print("=" * 100)

try:
    # קבל את כל החומרים
    materials = make_api_request(f'apps/{APP_ID}/entities/Material')
    
    if isinstance(materials, list):
        materials_list = materials
    else:
        materials_list = materials.get('data', []) if isinstance(materials, dict) else []
    
    print(f"\n📊 התחלנו עדכון {len(materials_list)} חומרים...")
    
    successful = 0
    failed = 0
    
    for i, material in enumerate(materials_list, 1):
        mat_id = material.get('id')
        title = material.get('title', 'ללא כותרת')
        mat_type = material.get('type', 'document')
        topic = material.get('topic', '')
        
        try:
            # קבל קישורים רלוונטיים
            relevant_guides = get_relevant_guides(title, mat_type, topic)
            
            # הכן נתונים לעדכון
            update_data = {
                "resource_links": relevant_guides if hasattr(material, 'resource_links') or True else []
            }
            
            # בצע עדכון
            response = make_api_request(
                f'apps/{APP_ID}/entities/Material/{mat_id}',
                method='PUT',
                data=update_data
            )
            
            successful += 1
            
            # הדפס פיד-בק כל 10 חומרים
            if i % 10 == 0:
                print(f"✅ עדכנו {i}/{len(materials_list)} חומרים...")
            
            # נקיבות לאפליקציה
            time.sleep(0.1)
            
        except Exception as e:
            failed += 1
            print(f"❌ Material {i} ({title}): {str(e)[:50]}")
    
    print(f"\n" + "=" * 100)
    print(f"✅ סיום עדכון!")
    print(f"=" * 100)
    print(f"✨ הצלחה: {successful}/{len(materials_list)}")
    print(f"❌ כשלונות: {failed}/{len(materials_list)}")
    print(f"📊 אחוז הצלחה: {(successful/len(materials_list)*100):.1f}%")
    
except Exception as e:
    print(f"❌ שגיאה בתהליך: {e}")

print("\n" + "=" * 100)
