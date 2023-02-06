/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

/* ***********************
** Evaluating expressions occurs in the context of a BTM environment.
************************* */

import { defaultReductions, defaultSumReductions, defaultProductReductions, disableRule, newRule, findMatchRules } from "./reductions.js"
import { scalar_expr } from "./scalar_expr.js";
import { variable_expr, index_expr } from "./variable_expr.js";
import { unop_expr } from "./unop_expr.js";
import { binop_expr } from "./binop_expr.js";
import { multiop_expr } from "./multiop_expr.js";
import { function_expr } from "./function_expr.js";
import { deriv_expr } from "./deriv_expr.js";
import { RNG } from "./random.js"
import { expression } from "./expression.js";

export const opPrec = {
    disj: 0,
    conj: 1,
    equal: 2,
    addsub: 3,
    multdiv: 4,
    power: 5,
    fcn: 6,
    fop: 7
};

export const exprType = {
    number: 0,
    variable: 1,
    fcn: 2,
    unop: 3,
    binop: 4,
    multiop: 5,
    operator: 6,
    array: 7,
    matrix: 8
};

export const exprValue = { undef: -1, bool : 0, numeric : 1 };

export function toTeX(expr) {
    return typeof expr.toTeX === "function" ? expr.toTeX() : expr;
}

export class BTM {
    constructor(settings) {
        if (settings === undefined) {
            settings = {};
            settings.seed = '1234';
        }
        // Each instance of BTM environment needs bindings across all expressions.
        this.randomBindings = {};
        this.bindings = {};
        this.data = {};
        this.data.allValues = {};
        this.data.params = {};
        this.data.variables = {};
        this.data.expressions = {};
        this.opPrec = opPrec;
        this.exprType = exprType;
        this.exprValue = exprValue;
        this.options = {
            negativeNumbers: true,
            absTol: 1e-8,
            relTol: 1e-4,
            useRelErr: true,
            doFlatten: false
        };
        this.setReductionRules();
        this.multiop_expr = multiop_expr;
        this.binop_expr = binop_expr;

        // Generate a random generator. We might be passed either a pre-seeded `rand` function or a seed for our own.
        let rngOptions = {};
        if (typeof settings.rand !== 'undefined') {
            rngOptions.rand = settings.rand;
        }
        if (typeof settings.seed !== 'undefined') {
            rngOptions.seed = settings.seed;
        }
        this.rng = new RNG(rngOptions);
    }

    // Perform approximate comparison tests using environment settings
    // a < b: -1
    // a ~= b: 0
    // a > b: 1
    numberCmp(a,b,override) {
        // Work with actual values.
        var valA, valB, cmpResult;
        var useRelErr = this.options.useRelErr,
            relTol = this.options.relTol,
            absTol = this.options.absTol;

        if (typeof a === 'number' || typeof a === 'Number') {
            valA = a;
        } else {
            valA = a.value();
        }
        if (typeof b === 'number' || typeof b === 'Number') {
            valB = b;
        } else {
            valB = b.value();
        }

        // Pull out the options.
        if (typeof override !== 'undefined') {
            if (typeof override.useRelErr !== 'undefined') {
                useRelErr = override.useRelErr;
            }
            if (typeof override.relTol !== 'undefined') {
                relTol = override.relTol;
            }
            if (typeof override.absTol !== 'undefined') {
                absTol = override.absTol;
            }
        }

        if (!useRelErr || Math.abs(valA) < absTol) {
            if (Math.abs(valB-valA) < absTol) {
                cmpResult = 0;
            } else if (valA < valB) {
                cmpResult = -1;
            } else {
                cmpResult = 1;
            }
        } else {
            if (Math.abs(valB-valA)/Math.abs(valA) < relTol) {
                cmpResult = 0;
            } else if (valA < valB) {
                cmpResult = -1;
            } else {
                cmpResult = 1;
            }
        }
        return cmpResult;
    }

    /* Block of methods to deal with reduction rules in context */
    setReductionRules() {
        this.reduceRules = defaultReductions(this);
    }

    addReductionRule(equation, description, useOneWay) {
        newRule(this, this.reduceRules, equation, description, true, useOneWay);
    }

    disableReductionRule(equation) {
        disableRule(this, this.reduceRules, equation);
    }

    addRule(ruleList, equation, description, useOneWay){
        newRule(this, ruleList, equation, description, true, useOneWay);
    }

    findMatchRules(reductionList, testExpr, doValidate) {
        return findMatchRules(reductionList, testExpr, doValidate);
    }

    addMathObject(name, context, newObject) {
        switch(context) {
            case 'number':
                if (newObject.isConstant()) {
                    this.data.params[name] = newObject;
                    this.data.allValues[name] = newObject;
                } else {
                    throw `Attempt to add math object '${name}' with context '${context}' that does not match.`;
                }
                break;
            case 'formula':
                this.data.allValues[name] = newObject;
                break;
        }
        return newObject;
    }

    generateRandom(distr, options) {
        var rndVal, rndScalar;

        switch (distr) {
            case 'discrete':
                let Nvals = Math.floor((options.max-options.min) / options.by)+1;
                do {
                    rndVal = options.min + options.by * this.rng.randInt(0,Nvals-1);
                } while (options.nonzero && Math.abs(rndVal) < this.options.absTol);
                break;
        }
        rndScalar = new scalar_expr(this, rndVal);
        return rndScalar;
    }

    addParameter(name, options) {
        var newParam;
        let prec = options.prec;
        if (options.mode === 'random') {
            let distr = options.distr;
            if (typeof distr === 'undefined') {
                distr = 'discrete_range';
            }
            switch (distr) {
                case 'discrete_range':
                let Nvals = Math.floor((options.max-options.min) / options.by)+1;
                do {
                    newParam = options.min + options.by * this.rng.randInt(0,Nvals-1);
                } while (options.nonzero && Math.abs(newParam) < this.options.absTol);
                break;
            }
        } else if (options.mode == 'calculate') {
            newParam = this.parse(options.formula, "number").evaluate(this.data.params);
        } else if (options.mode == 'rational') {
            newParam = this.parse(new rational_number(options.numer,options.denom).toString(), "number");
        } else if (options.mode == 'static') {
            newParam = options.value;
        }
        if (typeof prec === 'number') {
            newParam = Math.round(newParam/prec) / Math.round(1/prec);
        }
        this.data.params[name] = newParam;
        this.data.allValues[name] = newParam;

        return newParam;
    }

    addVariable(name, options) {
        var newVar = new variable_expr(name);

        this.data.variables[name] = newVar;
        this.data.allValues[name] = newVar;

        return newVar;
    }

    evaluateMathObject(mathObject, context, bindings) {
        var theExpr, newExpr, retValue;
        // Not yet parsed
        if (typeof mathObject === 'string') {
            var formula = this.decodeFormula(mathObject);
            theExpr = this.parse(formula, "formula");
        // Already parsed
        } else if (typeof mathObject === 'object') {
            theExpr = mathObject;
        }
        retValue = theExpr.evaluate(bindings);
        newExpr = new scalar_expr(this, retValue);
        return newExpr;
    }

    parseExpression(expression, context) {
        var newExpr;
        // Not yet parsed
        if (typeof expression === 'string') {
        var formula = this.decodeFormula(expression);
        newExpr = this.parse(formula, context);
        // Already parsed
        } else if (typeof expression === 'object') {
            newExpr = expression;
        }
        return newExpr;
    }

    addExpression(name, expression) {
        var newExpr = this.parseExpression(expression, "formula");

        this.data.expressions[name] = newExpr;
        this.data.allValues[name] = newExpr;

        return newExpr;
    }

    // This routine takes the text and looks for strings in mustaches {{name}}
    // It replaces this element with the corresponding parameter, variable, or expression.
    // These should have been previously parsed and stored in this.data.
    decodeFormula(statement, displayMode) {
        // First find all of the expected substitutions.
        var substRequestList = {};
        var matchRE = /\{\{[A-Za-z]\w*\}\}/g;
        var substMatches = statement.match(matchRE);
        if (substMatches != null) {
            for (var i=0; i<substMatches.length; i++) {
                var matchName = substMatches[i];
                matchName = matchName.substr(2,matchName.length-4);
                // Now see if the name is in our substitution rules.
                if (this.data.allValues[matchName] != undefined) {
                    if (displayMode != undefined && displayMode) {
                        substRequestList[matchName] = '{'+this.data.allValues[matchName].toTeX()+'}';
                    } else {
                        substRequestList[matchName] = '('+this.data.allValues[matchName].toString()+')';
                    }
                }
            }
        }

        // We are now ready to make the substitutions.
        var retString = statement;
        for (var match in substRequestList) {
            var re = new RegExp("{{" + match + "}}", "g");
            var subst = substRequestList[match];
            retString = retString.replace(re, subst);
        }
        return retString;
    }

    compareExpressions(expr1, expr2) {
        if (typeof expr1 === 'string') {
            expr1 = this.parse(expr1, "formula")
        }
        if (typeof expr2 === 'string') {
            expr2 = this.parse(expr2, "formula")
        }
        return (expr1.compare(expr2));
    }

    getParser(context) {
        var self=this,
            parseContext=context;
        return (function(exprString){ return self.parse(exprString, parseContext); })
    }

  /* ****************************************
    btm.parse() is the workhorse.

      Take a string representing a formula, and decompose it into an appropriate
      tree structure suitable for recursive evaluation of the function.
      Returns the root element to the tree.
  ***************************************** */
  parse(formulaStr, context, bindings, options) {
    if (arguments.length < 2) {
        context = "formula";
    }
    if (arguments.length < 3) {
      bindings = {};
    }
    if (arguments.length < 4) {
      options = {};
    }

    const numberMatch = /\d|(\.\d)/;
    const nameMatch = /[a-zA-Z]/;
    const unopMatch = /[\+\-/]/;
    const opMatch = /[\+\-*/^=\$&]/;

    var charPos = 0, endPos;
    var parseError = '';

    // Strip any extraneous white space and parentheses.
    var workingStr;
    workingStr = formulaStr.trim();

    // Test if parentheses are all balanced.
    var hasExtraParens = true;
    while (hasExtraParens) {
      hasExtraParens = false;
      if (workingStr.charAt(0) == '(') {
        var endExpr = completeParenthesis(workingStr, 0);
        if (endExpr+1 >= workingStr.length) {
          hasExtraParens = true;
          workingStr = workingStr.slice(1,-1);
        }
      }
    }

    // We build the tree as it is parsed.
    // Two stacks keep track of operands (expressions) and operators
    // which we will identify as the string is parsed left to right
    // At the time an operand is parsed, we don't know to which operator
    // it ultimately belongs, so we push it onto a stack until we know.
    var operandStack = new Array();
    var operatorStack = new Array();

    // When an operator is pushed, we want to compare it to the previous operator
    // and see if we need to apply the operators to some operands.
    // This is based on operator precedence (order of operations).
    // An empty newOp means to finish resolve the rest of the stacks.
    function resolveOperator(btm, operatorStack, operandStack, newOp) {
      // Test if the operator has lower precedence.
      var oldOp = 0;
      while (operatorStack.length > 0) {
        oldOp = operatorStack.pop();
        if (newOp && (newOp.type==exprType.unop || oldOp.prec < newOp.prec)) {
            break;
        }

        // To get here, the new operator must be *binary*
        // and the operator to the left has *higher* precedence.
        // So we need to peel off the operator to the left with its operands
        // to form an expression as a new compound operand for the new operator.
        var newExpr;
        // Unary: Either negative or reciprocal require *one* operand
        if (oldOp.type == exprType.unop) {
          if (operandStack.length > 0) {
            var input = operandStack.pop();

            // Deal with negative numbers separately.
            if (btm.options.negativeNumbers && input.type == exprType.number && oldOp.op == '-') {
              newExpr = new scalar_expr(btm, input.number.multiply(-1));
            } else {
              newExpr = new unop_expr(btm, oldOp.op, input);
            }
          } else {
            newExpr = new expression(btm);
            newExpr.setParsingError("Incomplete formula: missing value for " + oldOp.op);
          }
        // Binary: Will be *two* operands.
        } else {
          if (operandStack.length > 1) {
            var inputB = operandStack.pop();
            var inputA = operandStack.pop();
            newExpr = new binop_expr(btm, oldOp.op, inputA, inputB);
          } else {
            newExpr = new expression(btm);
            newExpr.setParsingError("Incomplete formula: missing value for " + oldOp.op);
          }
        }
        operandStack.push(newExpr);
        oldOp = 0;
      }
      // The new operator is unary or has higher precedence than the previous op.
      // We need to push the old operator back on the stack to use later.
      if (oldOp != 0) {
        operatorStack.push(oldOp);
      }
      // A new operation was added to deal with later.
      if (newOp) {
        operatorStack.push(newOp);
      }
    }

    // Now we begin to process the string representing the expression.
    var lastElement = -1, newElement; // 0 for operand, 1 for operator.

    // Read string left to right.
    // Identify what type of math object starts at this character.
    // Find the other end of that object by completion.
    // Interpret that object, possibly through a recursive parsing.
    for (charPos = 0; charPos<workingStr.length; charPos++) {
      // Identify the next element in the string.
      if (workingStr.charAt(charPos) == ' ') {
        continue;

      // It might be a close parentheses that was not matched on the left.
      } else if (workingStr.charAt(charPos) == ')') {
        // Treat this like an implicit open parenthesis on the left.
        resolveOperator(this, operatorStack, operandStack);
        newElement = 0;
        lastElement = -1;

      // It could be an expression surrounded by parentheses -- use recursion
      } else if (workingStr.charAt(charPos) == '(') {
        endPos = completeParenthesis(workingStr, charPos);
        var subExprStr = workingStr.slice(charPos+1,endPos);
        var subExpr = this.parse(subExprStr, context, bindings);
        operandStack.push(subExpr);
        newElement = 0;
        charPos = endPos;

      // It could be an absolute value
      } else if (workingStr.charAt(charPos) == '|') {
        endPos = completeAbsValue(workingStr, charPos);
        var subExprStr = workingStr.slice(charPos+1,endPos);
        var subExpr = this.parse(subExprStr, context, bindings);
        var newExpr = new function_expr(this, 'abs', subExpr);
        operandStack.push(newExpr);
        newElement = 0;
        charPos = endPos;

      // It could be a number. Just read it off
      } else if (workingStr.substr(charPos).search(numberMatch) == 0) {
        endPos = completeNumber(workingStr, charPos, options);
        var newExpr = new scalar_expr(this, new Number(workingStr.slice(charPos, endPos)));
        if (options && options.noDecimals && workingStr.charAt(charPos) == '.') {
          newExpr.setParsingError("Whole numbers only. No decimal values are allowed.")
        }
        operandStack.push(newExpr);
        newElement = 0;
        charPos = endPos-1;

      // It could be a name, either a function or variable.
      } else if (workingStr.substr(charPos).search(nameMatch) == 0) {
        endPos = completeName(workingStr, charPos);
        var theName = workingStr.slice(charPos,endPos);
        // If not a known name, break it down using composite if possible.
        if (bindings[theName]=== undefined) {
          // Returns the first known name, or theName not composite.
          var testResults = TestNameIsComposite(theName, bindings);
          if (testResults.isComposite) {
            theName = testResults.name;
            endPos = charPos + theName.length;
          }
        }
        // Test if a function
        if (bindings[theName]===undefined && workingStr.charAt(endPos) == '(') {
          var endParen = completeParenthesis(workingStr, endPos);

          var fcnName = theName;
          var newExpr;
          // See if this is a derivative
          if (fcnName == 'D') {
            var expr, ivar, ivarValue;
            var entries = workingStr.slice(endPos+1,endParen).split(",");
            expr = this.parse(entries[0], context, bindings);
            if (entries.length == 1) {
              newExpr = new deriv_expr(this, expr, 'x');
            } else {
              ivar = this.parse(entries[1], context, bindings);
              // D(f(x),x,c) means f'(c)
              if (entries.length > 2) {
                ivarValue = this.parse(entries[2], context, bindings);
              }
              newExpr = new deriv_expr(this, expr, ivar, ivarValue);
            }
          } else {
            var subExpr = this.parse(workingStr.slice(endPos+1,endParen), context, bindings);
            newExpr = new function_expr(this, theName, subExpr);
          }
          operandStack.push(newExpr);
          newElement = 0;
          charPos = endParen;
        }
        // or a variable.
        else {
          // Test if needs index
          if (workingStr.charAt(endPos) == '[') {
            var endParen, hasError=false;
            try {
              endParen = completeBracket(workingStr, endPos, true);
            } catch (error) {
              parseError = error;
              hasError = true;
              endParen = endPos+1;
            }
            var indexExpr = this.parse(workingStr.slice(endPos+1,endParen), context, bindings);
            var newExpr = new index_expr(this, theName, indexExpr);
            if (hasError) {
              newExpr.setParsingError(parseError);
              parseError = "";
            }
            operandStack.push(newExpr);
            newElement = 0;
            charPos = endParen;
          } else {
            var newExpr = new variable_expr(this, theName);
            operandStack.push(newExpr);
            newElement = 0;
            charPos = endPos-1;
          }
        }

      // It could be an operator.
      } else if (workingStr.substr(charPos).search(opMatch) == 0) {
        newElement = 1;
        var op = workingStr.charAt(charPos);
        var newOp = new operator(op);

        // Consecutive operators?    Better be sign change or reciprocal.
        if (lastElement != 0) {
          if (op == "-" || op == "/") {
            newOp.type = exprType.unop;
            newOp.prec = opPrec.multdiv;
          } else {
            // ERROR!!!
            parseError = "Error: consecutive operators";
          }
        }
        resolveOperator(this, operatorStack, operandStack, newOp);
      }

      // Two consecutive operands must have an implicit multiplication between them
      if (lastElement == 0 && newElement == 0) {
        var holdElement = operandStack.pop();

        // Push a multiplication
        var newOp = new operator('*');
        resolveOperator(this, operatorStack, operandStack, newOp);

        // Then restore the operand stack.
        operandStack.push(holdElement);
      }
      lastElement = newElement;
    }

    // Now finish up the operator stack: nothing new to include
    resolveOperator(this, operatorStack, operandStack);
    var finalExpression = operandStack.pop();
    if (parseError.length > 0) {
        finalExpression.setParsingError(parseError);
    } else {
        // Test if context is consistent
        switch (context) {
            case 'number':
                if (!finalExpression.isConstant()) {
                    //throw "The expression should be a constant but depends on variables."
                }
                finalExpression = new scalar_expr(this, finalExpression.value());
                break;
            case 'formula':
                break;
        }
        //finalExpression.setContext(context);
    }
    if (options.doFlatten) {
      finalExpression.flatten();
    }
    return finalExpression;
  }
}

// Used in parse
function operator(opStr) {
  this.op = opStr;
  switch(opStr) {
    case '+':
    case '-':
      this.prec = opPrec.addsub;
      this.type = exprType.binop;
      this.valueType = exprValue.numeric;
      break;
    case '*':
    case '/':
      this.prec = opPrec.multdiv;
      this.type = exprType.binop;
      this.valueType = exprValue.numeric;
      break;
    case '^':
      this.prec = opPrec.power;
      this.type = exprType.binop;
      this.valueType = exprValue.numeric;
      break;
    case '&':
      this.prec = opPrec.conj;
      this.type = exprType.binop;
      this.valueType = exprValue.bool;
      break;
    case '$':  // $=or since |=absolute value bar
//    this.op = '|'
      this.prec = opPrec.disj;
      this.type = exprType.binop;
      this.valueType = exprValue.bool;
      break;
    case '=':
      this.prec = opPrec.equal;
      this.type = exprType.binop;
      this.valueType = exprValue.bool;
      break;
    case ',':
      this.prec = opPrec.fop;
      this.type = exprType.array;
      this.valueType = exprValue.vector;
      break;
    default:
      this.prec = opPrec.fcn;
      this.type = exprType.fcn;
      break;
  }
}

/* An absolute value can be complicated because also a function.
May not be clear if nested: |2|x-3|- 5|.
Is that 2x-15 or abs(2|x-3|-5)?
Resolve by requiring explicit operations: |2*|x-3|-5| or |2|*x-3*|-5|
*/
function completeAbsValue(formulaStr, startPos) {
  var pLevel = 1;
  var charPos = startPos;
  var wasOp = true; // open absolute value implicitly has previous operation.

  while (pLevel > 0 && charPos < formulaStr.length) {
    charPos++;
    // We encounter another absolute value.
    if (formulaStr.charAt(charPos) == '|') {
      if (wasOp) { // Must be opening a new absolute value.
        pLevel++;
        // wasOp is still true since can't close immediately
      } else {  // Assume closing absolute value. If not wanted, need operator.
        pLevel--;
        // wasOp is still false since just closed a value.
      }
    // Keep track of whether just had operator or not.
    } else if ("+-*/([".search(formulaStr.charAt(charPos)) >= 0) {
      wasOp = true;
    } else if (formulaStr.charAt(charPos) != ' ') {
      wasOp = false;
    }
  }
  return(charPos);
}

// Find the balancing closing parenthesis.
function completeParenthesis(formulaStr, startPos) {
  var pLevel = 1;
  var charPos = startPos;

  while (pLevel > 0 && charPos < formulaStr.length) {
    charPos++;
    if (formulaStr.charAt(charPos) == ')') {
      pLevel--;
    } else if (formulaStr.charAt(charPos) == '(') {
      pLevel++;
    }
  }
  return(charPos);
}

// Brackets are used for sequence indexing, not regular grouping.
function completeBracket(formulaStr, startPos, asSubscript) {
  var pLevel = 1;
  var charPos = startPos;
  var fail = false;

  while (pLevel > 0 && charPos < formulaStr.length) {
    charPos++;
    if (formulaStr.charAt(charPos) == ']') {
        pLevel--;
    } else if (formulaStr.charAt(charPos) == '[') {
        if (asSubscript) {
          fail = true;
        }
        pLevel++;
    }
  }
  if (asSubscript && fail) {
    throw "Nested brackets used for subscripts are not supported.";
  }
  return(charPos);
}

/* Given a string and a starting position of a name, identify the entire name. */
/* Require start with letter, then any sequence of *word* character */
/* Also allow primes for derivatives at the end. */
function completeName(formulaStr, startPos) {
  var matchRule = /[A-Za-z]\w*'*/;
  var match = formulaStr.substr(startPos).match(matchRule);
  return(startPos + match[0].length);
}

/* Given a string and a starting position of a number, identify the entire number. */
function completeNumber(formulaStr, startPos, options) {
  var matchRule;
  if (options && options.noDecimals) {
    matchRule = /[0-9]*/;
  } else {
    matchRule = /[0-9]*(\.[0-9]*)?(e-?[0-9]+)?/;
  }
  var match = formulaStr.substr(startPos).match(matchRule);
  return(startPos + match[0].length);
}

/* Tests a string to see if it can be constructed as a concatentation of known names. */
/* For example, abc could be a name or could be a*b*c */
/* Pass in the bindings giving the known names and see if we can build this name */
/* Return the *first* name that is part of the whole. */
function TestNameIsComposite(text, bindings) {
  var retStruct = new Object();
  retStruct.isComposite = false;

  if (bindings !== undefined) {
    var remain, nextName;
    if (bindings[text] !== undefined) {
      retStruct.isComposite = true;
      retStruct.name = text;
    } else {
      // See if the text *starts* with a known name
      var knownNames = Object.keys(bindings);
      for (var ikey in knownNames) {
        nextName = knownNames[ikey];
        // If *this* name is the start of the text, see if the rest from known names.
        if (text.search(nextName)==0) {
          remain = TestNameIsComposite(text.slice(nextName.length), bindings);
          if (remain.isComposite) {
            retStruct.isComposite = true;
            retStruct.name = nextName;
            break;
          }
        }
      }
    }
  }
  return retStruct;
}
