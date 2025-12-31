# Python Example: Reading Entities
# Filterable fields: organization_id, course_id, course_ids, session_id, title, description, file_url, media_url, media_prompt, audio_url, audio_script, media_gen_id, type, topic, week_number, generated_content
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

entities = make_api_request(f'apps/693824c5c1ad33c1f114ebd2/entities/Material')
print(entities)

# Python Example: Updating an Entity
# Filterable fields: organization_id, course_id, course_ids, session_id, title, description, file_url, media_url, media_prompt, audio_url, audio_script, media_gen_id, type, topic, week_number, generated_content
def update_entity(entity_id, update_data):
    response = requests.put(
        f'https://app.base44.com/api/apps/693824c5c1ad33c1f114ebd2/entities/Material/{entity_id}',
        headers={
            'api_key': 'c0ce546b5661436dacb7a2060b10c9a5',
            'Content-Type': 'application/json'
        },
        json=update_data
    )
    response.raise_for_status()
    return response.json()