


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


imports = '''
import ast
'''

def runtests(usercode, inputjson):
    function = None
    functionName = inputjson['functionName']

    try:
        codeobject = compile(usercode, '<string>', 'exec')
        globes = {}
        exec(imports, globes)
        exec(codeobject, globes)
        
    except Exception as e:
        print("An Error Occurred while processing the input function:")
        print(e)
        return json.dumps({'success': False})

    if functionName in globes:
         function = globes[functionName]
    else:
        print("Function Not Found")
        print("globals", globals())
        return json.dumps({'success':False})
    
    results=[]
    for test in inputjson['tests']:
        result = {}
        result['name'] = test['name']
        result['expectedResponse'] = test['expectedResult']
        try:
            output = function(test['input'])
        except Exception as e:
            print("An Exception was raised during the tests: ")
            print(e)
            output = str(type(e))
        result['input'] = test['input']
        result['receivedResponse'] = output
        result['success'] = output == test['expectedResult']

        results.append(result)



    return json.dumps({'success':True, 'results': results})