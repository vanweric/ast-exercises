def Calculator(input):
  '''
  Takes a string representation of a math equation and returns the calculated result.
  Raises SyntaxError if the input string is not a valid equation.
  '''
  tree = ast.parse(input)
  # Examine the AST Tree and decide whether to execute the next line or raise an exception.
  return eval(input)