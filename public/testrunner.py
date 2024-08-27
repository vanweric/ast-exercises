


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
    print("func", func)
    try:
        exec(func)
    except Exception as e:
        print(e)
        return json.dumps({success: False})
    print("OH YEAH")
    print("inputjson", inputjson)
    print("func", func)
    return json.dumps({success:True, results: []})