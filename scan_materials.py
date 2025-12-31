import requests
import json

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

# מדריכים בקטגוריות שונות - ממדריכים.md
GUIDES = {
    # Digital Basics & Terminal
    "terminal": "https://bdnhost.net/Resources/guides/digital-basics/terminal_guide.html",
    "github": "https://bdnhost.net/Resources/guides/digital-basics/github_guide.html",
    "file_management": "https://bdnhost.net/Resources/guides/digital-basics/file-management.html",
    "internet_basics": "https://bdnhost.net/Resources/guides/digital-basics/internet_basics.html",
    "algorithmic_thinking": "https://bdnhost.net/Resources/guides/digital-basics/algorithmic_thinking.html",
    "digital_literacy": "https://bdnhost.net/Resources/guides/digital-basics/digital_literacy_basics_guide.html",
    "cv_guide": "https://bdnhost.net/Resources/guides/digital-basics/cv_guide.html",
    
    # AI & Automation
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
    
    # Data & Business
    "sql": "https://bdnhost.net/Resources/guides/data-business/sql_guide.html",
    "data_analysis": "https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html",
    "excel": "https://bdnhost.net/Resources/guides/data-business/excel_student.html",
    "powerbi": "https://bdnhost.net/Resources/guides/data-business/powerbi_guide.html",
    "marketing": "https://bdnhost.net/Resources/guides/data-business/marketing_guide.html",
    "video_marketing": "https://bdnhost.net/Resources/guides/data-business/short-video-marketing-strategy.html",
    
    # Creative Studio
    "canva": "https://bdnhost.net/Resources/guides/creative-studio/canva_guide.html",
    "ui_ux": "https://bdnhost.net/Resources/guides/creative-studio/ui_ux_guide.html",
    "video_editing": "https://bdnhost.net/Resources/guides/creative-studio/video_editing_guide.html",
    "mechanical_design": "https://bdnhost.net/Resources/guides/creative-studio/mechanical_design_guide.html",
    "midjourney": "https://bdnhost.net/Resources/guides/creative-studio/midjourney-for-marketing-visuals.html",
    "microbit": "https://bdnhost.net/Resources/guides/creative-studio/creative-coding-for-kids-microbit.html",
    "learning_skills": "https://bdnhost.net/Resources/guides/creative-studio/ai-tools-and-applications-guide-for-education-professionals.html",
    
    # Technology
    "docker": "https://bdnhost.net/Resources/guides/technology/docker-usage-guide.html",
    "iot": "https://bdnhost.net/Resources/guides/technology/iot_guide.html",
    "automotive": "https://bdnhost.net/Resources/guides/technology/automotive_guide.html",
    
    # Career
    "career_prep": "https://bdnhost.net/Resources/guides/career/career_prep.html",
    "portfolio": "https://bdnhost.net/Resources/guides/career/building-impressive-digital-portfolio.html",
    "presentation": "https://bdnhost.net/Resources/guides/career/presentation_skills.html",
}

def get_relevant_guides(material_title, material_type, material_topic):
    """
    תפקיד: חלץ קישורים רלוונטיים לפי כותרת וסוג החומר
    """
    relevant = []
    title_lower = material_title.lower() if material_title else ""
    type_lower = material_type.lower() if material_type else ""
    topic_lower = material_topic.lower() if material_topic else ""
    
    # Terminal
    if any(word in title_lower for word in ["terminal", "command", "cli", "shell", "bash", "powershell"]):
        relevant.append(GUIDES["terminal"])
        relevant.append(GUIDES["file_management"])
    
    # Python
    if any(word in title_lower for word in ["python", "coding", "programming", "script"]):
        relevant.append(GUIDES["python"])
        relevant.append(GUIDES["algorithmic_thinking"])
    
    # Data
    if any(word in title_lower for word in ["data", "analysis", "sql", "database", "excel"]):
        relevant.append(GUIDES["data_analysis"])
        relevant.append(GUIDES["sql"])
        relevant.append(GUIDES["excel"])
    
    # AI
    if any(word in title_lower for word in ["ai", "artificial", "machine learning", "chatgpt", "llm"]):
        relevant.append(GUIDES["ai_basics"])
        relevant.append(GUIDES["python"])
        relevant.append(GUIDES["prompt_engineering"])
        relevant.append(GUIDES["llm"])
    
    # GitHub
    if any(word in title_lower for word in ["git", "github", "repository", "version control"]):
        relevant.append(GUIDES["github"])
    
    # Design
    if any(word in title_lower for word in ["design", "ui", "ux", "canva", "graphic"]):
        relevant.append(GUIDES["canva"])
        relevant.append(GUIDES["ui_ux"])
        relevant.append(GUIDES["video_editing"])
    
    # Mechanical
    if any(word in title_lower for word in ["mechanical", "engineering", "automotive", "plc", "machine"]):
        relevant.append(GUIDES["mechanical_design"])
        relevant.append(GUIDES["automotive"])
        relevant.append(GUIDES["iot"])
    
    # IoT & Technology
    if any(word in title_lower for word in ["iot", "internet of things", "docker", "deployment"]):
        relevant.append(GUIDES["docker"])
        relevant.append(GUIDES["iot"])
    
    # בכל מקרה הוסף קישורים בסיסיים
    if not relevant:
        relevant.extend([GUIDES["terminal"], GUIDES["python"], GUIDES["data_analysis"]])
    
    # הסר כפילויות
    return list(set(relevant))

print("=" * 100)
print("🔍 סקרון כל חומרי הלימוד (Materials) בקורס")
print("=" * 100)

try:
    materials = make_api_request(f'apps/{APP_ID}/entities/Material')
    
    if isinstance(materials, list):
        materials_list = materials
    else:
        materials_list = materials.get('data', []) if isinstance(materials, dict) else []
    
    print(f"\n✨ נמצאו {len(materials_list)} חומרים")
    
    for i, material in enumerate(materials_list, 1):
        mat_id = material.get('id')
        title = material.get('title', 'ללא כותרת')
        mat_type = material.get('type', 'unknown')
        topic = material.get('topic', '')
        
        # קבל קישורים רלוונטיים
        relevant_guides = get_relevant_guides(title, mat_type, topic)
        
        print(f"\n📄 Material {i}:")
        print(f"   ID: {mat_id}")
        print(f"   כותרת: {title}")
        print(f"   סוג: {mat_type}")
        print(f"   נושא: {topic or 'אין'}")
        print(f"   קישורים רלוונטיים: {len(relevant_guides)}")
        if relevant_guides:
            for guide in relevant_guides[:2]:  # הראה 2 ראשונים
                print(f"     • {guide[:60]}...")

except Exception as e:
    print(f"❌ שגיאה: {e}")

print("\n" + "=" * 100)
print("✅ סיום סקרון - מוכן לעדכון!")
print("=" * 100)
