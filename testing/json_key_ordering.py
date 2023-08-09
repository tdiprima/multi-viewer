# Custom script
import json

with open('data.json', 'r') as f:
    data = json.load(f)

sorted_data = json.dumps(data, indent=4, sort_keys=True)

with open('output.json', 'w') as f:
    f.write(sorted_data)
