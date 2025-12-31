# Python Example: Reading Entities
# Filterable fields: organization_id, teacher_id, name, code, institution, semester, year, start_date, weekly_hours, total_sessions, total_hours, day_of_week, start_time, end_time, room, status, description, attendance_threshold, color, whatsapp_group_link, whatsapp_chat_id, logo_url, voice_id, audio_url, audio_script, media_url, media_prompt, media_gen_id, stability, allow_self_registration, is_public, auto_create_zoom
import requests

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': 'c0ce546b5661436dacb7a2060b10c9a5',
        'Content-Type': 'application/json'
    }
    if method.upper() == 'GET':
        response = requests.request(method, url, headers=headers, params=data)
    else:
        response = requests.request(method, url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

entities = make_api_request(f'apps/693824c5c1ad33c1f114ebd2/entities/Course')
print(entities)

# Python Example: Updating an Entity
# Filterable fields: organization_id, teacher_id, name, code, institution, semester, year, start_date, weekly_hours, total_sessions, total_hours, day_of_week, start_time, end_time, room, status, description, attendance_threshold, color, whatsapp_group_link, whatsapp_chat_id, logo_url, voice_id, audio_url, audio_script, media_url, media_prompt, media_gen_id, stability, allow_self_registration, is_public, auto_create_zoom
def update_entity(entity_id, update_data):
    response = requests.put(
        f'https://app.base44.com/api/apps/693824c5c1ad33c1f114ebd2/entities/Course/{entity_id}',
        headers={
            'api_key': 'c0ce546b5661436dacb7a2060b10c9a5',
            'Content-Type': 'application/json'
        },
        json=update_data
    )
    response.raise_for_status()
    return response.json()