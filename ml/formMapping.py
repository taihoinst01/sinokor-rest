import urllib.request
import json
import sys

data = {
        "Inputs": {
                "input1": json.loads(sys.argv[1]),
        },
    "GlobalParameters":  {
    }
}

body = str.encode(json.dumps(data))

url = 'https://ussouthcentral.services.azureml.net/workspaces/df3c2edb78144329b9b5e02a6b6b39ff/services/86009564b5024566b4e920eaab9e8c0b/execute?api-version=2.0&format=swagger'
api_key = 'pTUOjsoNwYEdtPaJfLYslYwMEfu6PL4ME6PhlFKa5H1pipLVLz2A2Qne/AJb94ecx9V1Fjb7FREb+PlTBgM3WQ=='
headers = {'Content-Type':'application/json', 'Authorization':('Bearer '+ api_key)}

req = urllib.request.Request(url, body, headers)

try:
    response = urllib.request.urlopen(req)

    result = response.read()
    print(json.dumps(result.decode("utf8", 'ignore')))

except urllib.error.HTTPError as error:
    #print("The request failed with status code: " + str(error.code))

    # Print the headers - they include the requert ID and the timestamp, which are useful for debugging the failure
    #print(error.info())
    print(json.loads(error.read().decode("utf8", 'ignore')))