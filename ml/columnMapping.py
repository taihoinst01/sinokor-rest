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

#url = 'https://ussouthcentral.services.azureml.net/workspaces/df3c2edb78144329b9b5e02a6b6b39ff/services/ed0dab8c1b7849a5ad2ab18f8eb110ff/execute?api-version=2.0&format=swagger' #free
url = 'https://ussouthcentral.services.azureml.net/workspaces/70851972a88440bfb9e055f56add06b5/services/eaf3bd61058049a180641f2ff24c24ce/execute?api-version=2.0&format=swagger'
#api_key = '1Eb4Xlt/hEHMLP0rCU87K7bVZg5Hep3RjNxleM6VViyzURt8SoJ4oMVNaW86IzIZ9/dY7R88jCDhwox9sNn07w==' #free
api_key = 'wvwb+6ObJmhsNaLQIuKPf/IVViSitHTn1fOZDqK5JHOC1rFxVXviPt5BEYqyTpnsX6G/PzhyFYyvexkL67qVVg=='
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