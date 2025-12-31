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
print("🎓 הוספת מושגים מפתח (key_concepts) בפורמט נכון")
print("=" * 100)

# Concepts with proper structure {term, definition}
assignments_concepts = {
    "69414e2c8702d6c582aa5422": [
        {"term": "ChatGPT", "definition": "Chat interface for Large Language Models"},
        {"term": "Prompt Basics", "definition": "Writing effective instructions to AI"},
        {"term": "AI Tools Comparison", "definition": "Understanding ChatGPT vs Claude vs Gemini"},
        {"term": "Natural Language Processing", "definition": "How AI understands human language"}
    ],
    
    "69414e2dca46bee8e4a7041b": [
        {"term": "Prompt Engineering", "definition": "Crafting effective prompts for better results"},
        {"term": "Context Window", "definition": "How much information AI can remember"},
        {"term": "Temperature and Parameters", "definition": "Controlling randomness and creativity of responses"},
        {"term": "Few-shot Learning", "definition": "Teaching AI by providing examples"},
        {"term": "Chain of Thought", "definition": "Breaking complex problems into steps for AI"}
    ],
    
    "69414e2dbf32c5df194d2b9e": [
        {"term": "Prompt Repository", "definition": "Building a collection of reusable prompts"},
        {"term": "Domain-Specific Prompts", "definition": "Engineering and mechanical applications"},
        {"term": "Prompt Versioning", "definition": "Tracking improvements and variations"},
        {"term": "Prompt Testing", "definition": "Evaluating prompt effectiveness"},
        {"term": "Prompt Documentation", "definition": "Recording context and usage of prompts"}
    ],
    
    "69414e2d5954bae78fd16299": [
        {"term": "Variables and Data Types", "definition": "int, float, string, boolean - basic data types"},
        {"term": "Operators", "definition": "Arithmetic, comparison, logical operations"},
        {"term": "Loops and Conditionals", "definition": "Control flow in Python (for, while, if)"},
        {"term": "Functions", "definition": "Writing reusable code blocks"},
        {"term": "Comments and Best Practices", "definition": "Writing clean, readable code"}
    ],
    
    "69414e2d5481295f3723d0cb": [
        {"term": "Engineering Formulas", "definition": "Torque, Force, Work calculations"},
        {"term": "Function Design", "definition": "Organizing calculations efficiently"},
        {"term": "Input Validation", "definition": "Handling user errors gracefully"},
        {"term": "Output Formatting", "definition": "Presenting results clearly"},
        {"term": "Testing and Debugging", "definition": "Verifying code correctness"}
    ],
    
    "69414e2d6d64028218b1d452": [
        {"term": "OEE Formula", "definition": "Availability × Performance × Quality"},
        {"term": "Data Input Methods", "definition": "Reading from files and user input"},
        {"term": "Calculation Logic", "definition": "Implementing OEE formula in Python"},
        {"term": "Result Formatting", "definition": "Presenting OEE reports clearly"},
        {"term": "Data Validation", "definition": "Ensuring calculation accuracy"}
    ],
    
    "69414e2d0fb0b15ddcf12cd0": [
        {"term": "Pandas DataFrames", "definition": "Core data structure for data analysis"},
        {"term": "Data Loading", "definition": "Reading CSV, Excel, and other formats"},
        {"term": "Data Manipulation", "definition": "Filtering, sorting, and transforming data"},
        {"term": "Aggregation Functions", "definition": "sum(), mean(), count(), groupby()"},
        {"term": "Data Visualization", "definition": "Plotting with matplotlib and seaborn"}
    ],
    
    "69414e2ee86391f37fe09c01": [
        {"term": "Manufacturing Data", "definition": "Production logs and sensor readings"},
        {"term": "Exploratory Data Analysis", "definition": "Understanding data patterns"},
        {"term": "Outlier Detection", "definition": "Finding anomalies in manufacturing"},
        {"term": "Statistical Analysis", "definition": "Mean, std, quartiles of data"},
        {"term": "Report Generation", "definition": "Summarizing findings for stakeholders"}
    ],
    
    "69414e2e9e084e06df769232": [
        {"term": "OEE Automation", "definition": "Calculating OEE from raw data automatically"},
        {"term": "Time Series Analysis", "definition": "Tracking OEE over time"},
        {"term": "Visualization Dashboards", "definition": "Creating graphs and charts"},
        {"term": "Export Formats", "definition": "Saving reports to CSV, PDF, Excel"},
        {"term": "Scheduling", "definition": "Automating regular report generation"}
    ],
    
    "69414e2e11647469b8858d9a": [
        {"term": "OpenAI API Authentication", "definition": "Setting up API keys and credentials"},
        {"term": "HTTP Requests", "definition": "Making API calls with proper formatting"},
        {"term": "Model Selection", "definition": "Choosing GPT-3.5, GPT-4 for different tasks"},
        {"term": "Prompt Design for API", "definition": "Formatting prompts for API consumption"},
        {"term": "Response Handling", "definition": "Parsing and processing API responses"}
    ],
    
    "69414e2e4e55179b0c0a147a": [
        {"term": "Request Structure", "definition": "Composing proper API requests"},
        {"term": "Model Parameters", "definition": "temperature, max_tokens, top_p settings"},
        {"term": "Error Handling", "definition": "Catching and managing API errors"},
        {"term": "Response Parsing", "definition": "Extracting useful data from responses"},
        {"term": "Cost Optimization", "definition": "Managing API usage and tokens"}
    ],
    
    "69414e2eac7de303344f223e": [
        {"term": "System Architecture", "definition": "Components of monitoring systems"},
        {"term": "Data Collection", "definition": "Sensors and data acquisition"},
        {"term": "Real-time Processing", "definition": "Handling continuous data streams"},
        {"term": "Alerting Mechanisms", "definition": "Triggering notifications on events"},
        {"term": "AI Integration", "definition": "Using ML for anomaly detection"}
    ],
    
    "69414e2f3b729f24f11b1489": [
        {"term": "Sensor Simulation", "definition": "Generating realistic sensor data"},
        {"term": "Time Series Data", "definition": "Creating temporal sequences"},
        {"term": "Random Variations", "definition": "Adding realistic noise and variations"},
        {"term": "File Output", "definition": "Saving simulated data to CSV format"},
        {"term": "Testing Data", "definition": "Validating simulator produces correct data"}
    ],
    
    "69414e2f892480c1aa2002c8": [
        {"term": "Anomaly Definition", "definition": "What constitutes abnormal behavior"},
        {"term": "Statistical Methods", "definition": "Using standard deviation for detection"},
        {"term": "Threshold Setting", "definition": "Choosing appropriate alert thresholds"},
        {"term": "Algorithm Implementation", "definition": "Coding detection logic"},
        {"term": "Performance Metrics", "definition": "Evaluating false positives vs negatives"}
    ],
    
    "69414e2fba2b03400a97cc88": [
        {"term": "Predictive Maintenance", "definition": "Preventing failures before they occur"},
        {"term": "Failure Patterns", "definition": "Historical data patterns indicating problems"},
        {"term": "Maintenance Scheduling", "definition": "Optimizing when to perform maintenance"},
        {"term": "Cost-Benefit Analysis", "definition": "Weighing prevention vs repair costs"},
        {"term": "Implementation Challenges", "definition": "Real-world deployment issues"}
    ],
    
    "69414e2f3ee762a6a5f26703": [
        {"term": "Terminal/Shell Basics", "definition": "Command navigation and operations"},
        {"term": "File Management", "definition": "Creating, moving, deleting files and folders"},
        {"term": "Python Execution", "definition": "Running Python scripts from command line"},
        {"term": "Environment Variables", "definition": "Understanding PATH and PYTHONPATH"},
        {"term": "Error Messages", "definition": "Interpreting and fixing command-line errors"}
    ],
    
    "69414e2f86e3de310ffdacc0": [
        {"term": "Machine Learning Basics", "definition": "Training and testing models"},
        {"term": "Feature Selection", "definition": "Choosing relevant data for prediction"},
        {"term": "Model Training", "definition": "Fitting a model to historical data"},
        {"term": "Prediction Testing", "definition": "Evaluating model accuracy"},
        {"term": "Deployment", "definition": "Using trained models for predictions"}
    ],
    
    "69414e2f5ddaa8bd7f7157f0": [
        {"term": "Alert System Design", "definition": "Architecture for automated alerts"},
        {"term": "Threshold Logic", "definition": "Setting alert conditions"},
        {"term": "Notification Methods", "definition": "Email, SMS, dashboard alerts"},
        {"term": "Alert Prioritization", "definition": "Critical vs warning vs info levels"},
        {"term": "Testing Alerts", "definition": "Verifying alert system works correctly"}
    ],
    
    "69414e30c50be93f69425301": [
        {"term": "Chatbot Architecture", "definition": "Components and design patterns"},
        {"term": "Conversational Flow", "definition": "Managing multi-turn conversations"},
        {"term": "Intent Recognition", "definition": "Understanding user goals"},
        {"term": "Response Generation", "definition": "Creating contextually relevant answers"},
        {"term": "Platform Integration", "definition": "Deploying chatbots to different channels"}
    ],
    
    "69414e308026cf3066af95b1": [
        {"term": "OpenAI Chat API", "definition": "Using GPT for conversational AI"},
        {"term": "Message History", "definition": "Managing conversation context"},
        {"term": "System Prompts", "definition": "Defining chatbot personality and rules"},
        {"term": "User Input Handling", "definition": "Processing and validating user messages"},
        {"term": "Response Optimization", "definition": "Generating helpful technical responses"}
    ],
    
    "69414e3011647469b8858d9b": [
        {"term": "Presentation Structure", "definition": "Organizing content logically"},
        {"term": "Technical Demonstrations", "definition": "Live demos of working systems"},
        {"term": "Stakeholder Communication", "definition": "Explaining to different audiences"},
        {"term": "Q&A Preparation", "definition": "Anticipating common questions"},
        {"term": "Visual Aids", "definition": "Using slides and diagrams effectively"}
    ],
    
    "69414e31eb6133042ca18c9d": [
        {"term": "Project Documentation", "definition": "Comprehensive technical writing"},
        {"term": "Problem Statement", "definition": "Clearly defining the challenge"},
        {"term": "Solution Architecture", "definition": "Describing the approach"},
        {"term": "Code Documentation", "definition": "Documenting functions and modules"},
        {"term": "Results and Conclusions", "definition": "Summarizing findings and learning"}
    ],
    
    "69414e317ef4032d7adc306e": [
        {"term": "Full-Stack Development", "definition": "Frontend, backend, and database"},
        {"term": "System Design", "definition": "Architecting the complete monitoring system"},
        {"term": "Data Pipeline", "definition": "Collection, processing, and storage"},
        {"term": "Machine Learning Integration", "definition": "Building predictive models"},
        {"term": "Deployment and Testing", "definition": "Making system production-ready"},
        {"term": "User Interface", "definition": "Creating dashboards and reports"},
        {"term": "Performance Optimization", "definition": "Ensuring system efficiency"}
    ],
    
    "69414e30a30ebe20d4d72548": [
        {"term": "AI and Machine Learning", "definition": "Understanding AI capabilities"},
        {"term": "Python Programming", "definition": "Hands-on coding knowledge"},
        {"term": "Data Analysis", "definition": "Working with real-world data"},
        {"term": "Manufacturing Applications", "definition": "Practical industry use cases"},
        {"term": "Ethical AI", "definition": "Understanding limitations and responsible use"},
        {"term": "System Integration", "definition": "Bringing components together"}
    ]
}

print(f"\n📝 הוספת מושגים לכל המטלות...")
print("-" * 100)

updated = 0
failed = 0

for assignment_id, concepts in assignments_concepts.items():
    try:
        response = make_api_request(
            f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
            method='PUT',
            data={'key_concepts': concepts}
        )
        updated += 1
        print(f"✅ {len(concepts)} מושגים")
        time.sleep(0.1)
    except Exception as e:
        failed += 1
        print(f"❌ {assignment_id[:16]}: {str(e)[:40]}")

print("\n" + "=" * 100)
print(f"✅ הוספת מושגים הושלמה!")
print("=" * 100)
print(f"\n📊 תוצאות:")
print(f"   ✅ מטלות עודכנו: {updated}")
print(f"   ❌ נכשלו: {failed}")
print(f"   📋 סה״כ: {len(assignments_concepts)}")
print(f"   💡 מושגים הוספו: {sum(len(v) for v in assignments_concepts.values())}")
print(f"\n🎯 כל מטלה כעת עם 4-7 מושגים מפתח!")
