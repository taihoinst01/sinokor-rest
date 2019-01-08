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

#url = 'https://ussouthcentral.services.azureml.net/workspaces/df3c2edb78144329b9b5e02a6b6b39ff/services/cd98a4c8de5b4ea4969df86b76a13a76/execute?api-version=2.0&format=swagger' #free
url = 'https://ussouthcentral.services.azureml.net/workspaces/42c22f7e4cbb4185bdc018321a7a4ef3/services/2737ef6ba4a74d519325b896da8bb081/execute?api-version=2.0&format=swagger'
#api_key = 'ETCFNhoYaiUgILSFvrGQfCbImruQq1R3ALcQZGanW9p9mYjSbU+JwvnmTlBEJfYt8sbyKxUysMnure54KitCig==' #free
api_key = 'pQYNcOlaIpNhQ21+4/iWrizziNFG/c9HKQYII0z7eJ6Ge5O76U8qbcOMBpqebg09OFQ2BSxIwh12a36nBdmc9Q=='
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