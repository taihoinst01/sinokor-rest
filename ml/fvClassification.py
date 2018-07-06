import urllib.request
import json
import sys

param =[]
for item in sys.argv[1:]:
    param.append({'x' : item.split('::')[0], 'y': item.split('::')[1], 'text' : item.split('::')[2], 'isFixed' : 'false'})

data = {
        "Inputs": {
                "input1": param
        },
    "GlobalParameters":  {
    }
}

body = str.encode(json.dumps(data))

url = 'https://ussouthcentral.services.azureml.net/workspaces/40d09a0901e34fd1a176fb9af1e349a5/services/d6f5d5a684cf4ef9baebd421f1948ca7/execute?api-version=2.0&format=swagger'
api_key = 'NhhxvPxkI1caxC76KiuZPKJXV3uZiB2oeFCpr7d6TmB+5Pc1yaLZrzVc64nuGKLQ94g0bLf99/jg7WotxXVfLQ=='
headers = {'Content-Type':'application/json', 'Authorization':('Bearer '+ api_key)}

req = urllib.request.Request(url, body, headers)

try:
    response = urllib.request.urlopen(req)

    result = response.read()
    print(json.dumps(result.decode("utf8", 'ignore')))
except urllib.error.HTTPError as error:
    # print("The request failed with status code: " + str(error.code))

    # print(error.info())
    print(json.loads(error.read().decode("utf8", 'ignore')))