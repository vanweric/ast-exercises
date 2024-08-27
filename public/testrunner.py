


'''
input format
{
"function": "functionname to invoke",
"tests": [
    {
        "expectedResult": "string representation of result"
        "match": (Enum) "exact" (default), "unordered",
        "help": "help string to render"
    },
    ...
  ]
}
'''

'''
output format
'''
import json



def runtests(func, inputjson):
    try:
        exec(func)
    except Exception as e:
        print("An Error Occurred while processing the input function:")
        print(e)
        return json.dumps({'success': False})

    if inputjson['functionName'] in locals():
         functor = locals()[inputjson['functionName']]
    else:
        print("Function Not Found")
        return json.dumps({'success':False})
    
    results=[]
    for test in inputjson['tests']:
        result = {}
        result['name'] = test['name']
        result['expectedResponse'] = test['expectedResult']
        try:
            output = functor(test['input'])
        except Exception as e:
            output = str(type(e))
        result['input'] = test['input']
        result['receivedResponse'] = output
        result['success'] = output == test['expectedResult']

        results.append(result)



    return json.dumps({'success':True, 'results': results})