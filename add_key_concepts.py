import requests
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

print("=" * 100)
print("🎓 הוספת מושגים מפתח (Key Concepts) לכל מטלה")
print("=" * 100)

# Define assignments with key concepts (4+ per assignment)
concepts_by_assignment = {
    "69414e2c8702d6c582aa5422": {
        "key_concepts": [
            "ChatGPT - Chat with Large Language Models",
            "Prompt Basics - Writing effective instructions",
            "AI Tools Comparison - ChatGPT vs Claude vs Gemini",
            "Natural Language Processing - NLP fundamentals"
        ],
        "related_competencies": ["Use AI tools", "ChatGPT", "AI Basics", "Communication"]
    },
    
    "69414e2dca46bee8e4a7041b": {
        "key_concepts": [
            "Prompt Engineering - Crafting effective prompts",
            "Context Window - How AI remembers information",
            "Temperature and Parameters - Controlling AI behavior",
            "Few-shot Learning - Teaching AI by example",
            "Chain of Thought - Breaking complex problems down"
        ],
        "related_competencies": ["Prompt Engineering", "Advanced AI Usage", "Problem Solving", "Communication"]
    },
    
    "69414e2dbf32c5df194d2b9e": {
        "key_concepts": [
            "Prompt Repository - Building a collection of reusable prompts",
            "Domain-Specific Prompts - Engineering and mechanical applications",
            "Prompt Versioning - Tracking improvements and variations",
            "Prompt Testing - Evaluating prompt effectiveness",
            "Prompt Documentation - Recording context and usage"
        ],
        "related_competencies": ["Prompt Engineering", "Organization", "Documentation", "Knowledge Management"]
    },
    
    "69414e2d5954bae78fd16299": {
        "key_concepts": [
            "Variables and Data Types - int, float, string, boolean",
            "Operators - Arithmetic, comparison, logical operations",
            "Loops and Conditionals - Control flow in Python",
            "Functions - Writing reusable code blocks",
            "Comments and Best Practices - Writing clean code"
        ],
        "related_competencies": ["Python Programming", "Logic", "Code Quality", "Problem Decomposition"]
    },
    
    "69414e2d5481295f3723d0cb": {
        "key_concepts": [
            "Engineering Formulas - Torque, Force, Work calculations",
            "Function Design - Organizing calculations efficiently",
            "Input Validation - Handling user errors gracefully",
            "Output Formatting - Presenting results clearly",
            "Testing and Debugging - Verifying correctness"
        ],
        "related_competencies": ["Python Programming", "Engineering Mathematics", "Problem Solving", "Testing"]
    },
    
    "69414e2d6d64028218b1d452": {
        "key_concepts": [
            "OEE Formula - Availability × Performance × Quality",
            "Data Input Methods - Reading from files and user input",
            "Calculation Logic - Implementing OEE formula in Python",
            "Result Formatting - Presenting OEE reports clearly",
            "Data Validation - Ensuring calculation accuracy"
        ],
        "related_competencies": ["Python", "Manufacturing", "Data Analysis", "Quality Metrics"]
    },
    
    "69414e2d0fb0b15ddcf12cd0": {
        "key_concepts": [
            "Pandas DataFrames - Core data structure for analysis",
            "Data Loading - Reading CSV, Excel, and other formats",
            "Data Manipulation - Filtering, sorting, and transforming",
            "Aggregation Functions - sum(), mean(), count(), groupby()",
            "Data Visualization - Plotting with matplotlib and seaborn"
        ],
        "related_competencies": ["Pandas", "Data Analysis", "Python", "Statistical Thinking"]
    },
    
    "69414e2ee86391f37fe09c01": {
        "key_concepts": [
            "Manufacturing Data - Production logs and sensor readings",
            "Exploratory Data Analysis - Understanding data patterns",
            "Outlier Detection - Finding anomalies in manufacturing",
            "Statistical Analysis - Mean, std, quartiles of production data",
            "Report Generation - Summarizing findings for stakeholders"
        ],
        "related_competencies": ["Data Analysis", "Manufacturing", "Python", "Quality Assurance"]
    },
    
    "69414e2e9e084e06df769232": {
        "key_concepts": [
            "OEE Automation - Calculating OEE from raw data automatically",
            "Time Series Analysis - Tracking OEE over time",
            "Visualization Dashboards - Creating graphs and charts",
            "Export Formats - Saving reports to CSV, PDF, Excel",
            "Scheduling - Automating regular report generation"
        ],
        "related_competencies": ["Pandas", "Manufacturing", "Automation", "Reporting"]
    },
    
    "69414e2e11647469b8858d9a": {
        "key_concepts": [
            "OpenAI API Authentication - Setting up API keys and credentials",
            "HTTP Requests - Making API calls with proper formatting",
            "Model Selection - Choosing GPT-3.5, GPT-4 for different tasks",
            "Prompt Design for API - Formatting prompts for API consumption",
            "Response Handling - Parsing and processing API responses"
        ],
        "related_competencies": ["API Integration", "OpenAI", "HTTP", "Python"]
    },
    
    "69414e2e4e55179b0c0a147a": {
        "key_concepts": [
            "Request Structure - Composing proper API requests",
            "Model Parameters - temperature, max_tokens, top_p settings",
            "Error Handling - Catching and managing API errors",
            "Response Parsing - Extracting useful data from responses",
            "Cost Optimization - Managing API usage and tokens"
        ],
        "related_competencies": ["API Integration", "Python", "HTTP", "Error Handling"]
    },
    
    "69414e2eac7de303344f223e": {
        "key_concepts": [
            "System Architecture - Components of monitoring systems",
            "Data Collection - Sensors and data acquisition",
            "Real-time Processing - Handling continuous data streams",
            "Alerting Mechanisms - Triggering notifications on events",
            "AI Integration - Using ML for anomaly detection"
        ],
        "related_competencies": ["Monitoring Systems", "Architecture", "Real-time Data", "AI"]
    },
    
    "69414e2f3b729f24f11b1489": {
        "key_concepts": [
            "Sensor Simulation - Generating realistic sensor data",
            "Time Series Data - Creating temporal sequences",
            "Random Variations - Adding realistic noise and variations",
            "File Output - Saving simulated data to CSV format",
            "Testing Data - Validating simulator produces correct data"
        ],
        "related_competencies": ["Python", "Data Simulation", "Testing", "Manufacturing"]
    },
    
    "69414e2f892480c1aa2002c8": {
        "key_concepts": [
            "Anomaly Definition - What constitutes abnormal behavior",
            "Statistical Methods - Using standard deviation for detection",
            "Threshold Setting - Choosing appropriate alert thresholds",
            "Algorithm Implementation - Coding detection logic",
            "Performance Metrics - Evaluating false positives vs negatives"
        ],
        "related_competencies": ["Anomaly Detection", "Data Analysis", "Python", "Quality Control"]
    },
    
    "69414e2fba2b03400a97cc88": {
        "key_concepts": [
            "Predictive Maintenance Basics - Preventing failures before they occur",
            "Failure Patterns - Historical data patterns indicating problems",
            "Maintenance Scheduling - Optimizing when to perform maintenance",
            "Cost-Benefit Analysis - Weighing prevention vs repair costs",
            "Implementation Challenges - Real-world deployment issues"
        ],
        "related_competencies": ["Predictive Maintenance", "Strategy", "Manufacturing", "AI"]
    },
    
    "69414e2f3ee762a6a5f26703": {
        "key_concepts": [
            "Terminal/Shell Basics - Command navigation and operations",
            "File Management - Creating, moving, deleting files and folders",
            "Python Execution - Running Python scripts from command line",
            "Environment Variables - Understanding PATH and PYTHONPATH",
            "Error Messages - Interpreting and fixing command-line errors"
        ],
        "related_competencies": ["Terminal/Shell", "Python", "System Administration", "Troubleshooting"]
    },
    
    "69414e2f86e3de310ffdacc0": {
        "key_concepts": [
            "Machine Learning Basics - Training and testing models",
            "Feature Selection - Choosing relevant data for prediction",
            "Model Training - Fitting a model to historical data",
            "Prediction Testing - Evaluating model accuracy",
            "Deployment - Using trained models for predictions"
        ],
        "related_competencies": ["Machine Learning", "Predictive Analytics", "Python", "Data Science"]
    },
    
    "69414e2f5ddaa8bd7f7157f0": {
        "key_concepts": [
            "Alert System Design - Architecture for automated alerts",
            "Threshold Logic - Setting alert conditions",
            "Notification Methods - Email, SMS, dashboard alerts",
            "Alert Prioritization - Critical vs warning vs info levels",
            "Testing Alerts - Verifying alert system works correctly"
        ],
        "related_competencies": ["Alert Systems", "Notification", "Real-time Systems", "Python"]
    },
    
    "69414e30c50be93f69425301": {
        "key_concepts": [
            "Chatbot Architecture - Components and design patterns",
            "Conversational Flow - Managing multi-turn conversations",
            "Intent Recognition - Understanding user goals",
            "Response Generation - Creating contextually relevant answers",
            "Platform Integration - Deploying chatbots to different channels"
        ],
        "related_competencies": ["Chatbots", "NLP", "AI", "User Experience"]
    },
    
    "69414e308026cf3066af95b1": {
        "key_concepts": [
            "OpenAI Chat API - Using GPT for conversational AI",
            "Message History - Managing conversation context",
            "System Prompts - Defining chatbot personality and rules",
            "User Input Handling - Processing and validating user messages",
            "Response Optimization - Generating helpful technical responses"
        ],
        "related_competencies": ["Chatbots", "OpenAI API", "Python", "Natural Language"]
    },
    
    "69414e3011647469b8858d9b": {
        "key_concepts": [
            "Presentation Structure - Organizing content logically",
            "Technical Demonstrations - Live demos of working systems",
            "Stakeholder Communication - Explaining to different audiences",
            "Q&A Preparation - Anticipating common questions",
            "Visual Aids - Using slides and diagrams effectively"
        ],
        "related_competencies": ["Presentation", "Communication", "Project Management", "Leadership"]
    },
    
    "69414e31eb6133042ca18c9d": {
        "key_concepts": [
            "Project Documentation - Comprehensive technical writing",
            "Problem Statement - Clearly defining the challenge",
            "Solution Architecture - Describing the approach",
            "Code Documentation - Documenting functions and modules",
            "Results and Conclusions - Summarizing findings and learning"
        ],
        "related_competencies": ["Documentation", "Technical Writing", "Project Management", "Reflection"]
    },
    
    "69414e317ef4032d7adc306e": {
        "key_concepts": [
            "Full-Stack Development - Frontend, backend, and database",
            "System Design - Architecting the complete monitoring system",
            "Data Pipeline - Collection, processing, and storage",
            "Machine Learning Integration - Building predictive models",
            "Deployment and Testing - Making system production-ready",
            "User Interface - Creating dashboards and reports",
            "Performance Optimization - Ensuring system efficiency"
        ],
        "related_competencies": ["Full-Stack", "Project Management", "System Design", "Integration", "Leadership"]
    },
    
    "69414e30a30ebe20d4d72548": {
        "key_concepts": [
            "AI and Machine Learning - Understanding AI capabilities",
            "Python Programming - Hands-on coding knowledge",
            "Data Analysis - Working with real-world data",
            "Manufacturing Applications - Practical industry use cases",
            "Ethical AI - Understanding limitations and responsible use",
            "System Integration - Bringing components together"
        ],
        "related_competencies": ["AI Fundamentals", "Python", "Data Science", "Manufacturing", "Critical Thinking"]
    }
}

print("\n📝 מוסיף מושגים מפתח (Key Concepts) לכל מטלה...")
print("-" * 100)

updated = 0
failed = 0

for assignment_id, data in concepts_by_assignment.items():
    try:
        response = make_api_request(
            f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
            method='PUT',
            data=data
        )
        updated += 1
        num_concepts = len(data.get('key_concepts', []))
        num_competencies = len(data.get('related_competencies', []))
        print(f"✅ {num_concepts} מושגים + {num_competencies} קומפטנסיות")
        time.sleep(0.1)
    except Exception as e:
        failed += 1
        print(f"❌ {assignment_id[:16]}: {str(e)[:60]}")

print("\n" + "=" * 100)
print(f"✅ הוספת מושגים הושלמה!")
print("=" * 100)
print(f"\n📊 תוצאות:")
print(f"   ✅ מטלות עודכנו: {updated}")
print(f"   ❌ נכשלו: {failed}")
print(f"   📋 סה״כ: {len(concepts_by_assignment)}")
print(f"\n🎯 כל מטלה כעת עם 4-7 מושגים מפתח!")
