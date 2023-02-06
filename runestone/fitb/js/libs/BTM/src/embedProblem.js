/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

import {BTM} from "./BTM_root.js"

export class DynamicMathProblem {
  constructor(opts) {
    this.opts = opts;
    this.btm = new BTM();
    this.rng = new RNG(opts.seed); // Use a separate RNG for problem generation.

    // Find the xml code defining this particular problem.
    this.problemCode = getProblemElement(opts.xml, opts.problemID);
    this.initialize();
  }

  // Initialize all of the dynamic quantities, including randomization.
  initialize() {
    // If the problemElement has random-choices, then we are going to choose one of those problems.
    var randomChoice;
    var problemCode = this.problemCode;
    while ((randomChoice = problemElement.getElementsByTagName("random-choices")).length > 0) {
      var probIDs = randomChoice[0].getElementsByTagName("prob-id");
      var i = this.rng.randInt(0,probIDs.length-1);
      var probID = probIDs[i].textContent;
      problemCode = getProblemElement(this.opts.xml, probID);
    }
    this.activeCode = problemCode;
  
    // At the end of the parsing, these objects will be filled with math definitions.
    this.data = {};
    this.data.allValues = {};
    this.data.params_variables = {};
  
    // Identify the parameters.
    parseParameters();
    // Identify the variables.
    parseVariables();
    // Identify the expressions, applying the given parameters.
    parseExpressions();
  }

  // Parse a simple parameter.
  parseParam = function(param, paramName, data) {
    var paramValue;

    // Test if random or static.
    var randomInfo = param.getElementsByTagName('random');
    if (randomInfo.length > 0) {
      paramValue = BTM.rndValue(randomInfo[0], data);
    } else {
      var valueInfo = param.getElementsByTagName('value');
      if (valueInfo.length > 0) {
        paramValue = Number(valueInfo[0].textContent);
      } else {
        alert("Problem definition missing value specification for parameter " + paramName);
      }
    }
    return BTM.parseExpression(""+paramValue);
  }

  // Parse a parameter representing rational number.
  parseParamRational = function(param, paramName, data) {
    var paramValue, badParam = false;
    var p,q;

    // Numerator!
    var numerInfo = param.getElementsByTagName('numer');
    if (numerInfo.length > 0) {  // Test if random or static.
      var randomInfo = numerInfo[0].getElementsByTagName('random');
      if (randomInfo.length > 0) {
        p = BTM.rndValue(randomInfo[0], data);
      } else {
        var valueInfo = numerInfo[0].getElementsByTagName('value');
        if (valueInfo.length > 0) {
          p = Number(valueInfo[0].textContent);
        } else {
          alert("Problem definition missing value specification for numerator of rational parameter " + paramName);
        }
      }
    } else {
      badParam = true;
    }
    // Denominator!
    var denomInfo = param.getElementsByTagName('denom');
    if (denomInfo.length > 0) {  // Test if random or static.
      var randomInfo = denomInfo[0].getElementsByTagName('random');
      if (randomInfo.length > 0) {
        q = BTM.rndValue(randomInfo[0], data);
      } else {
        var valueInfo = denomInfo[0].getElementsByTagName('value');
        if (valueInfo.length > 0) {
          q = Number(valueInfo[0].textContent);
        } else {
          alert("Problem definition missing value specification for denominator of rational parameter " + paramName);
        }
      }
    } else {
      badParam = true;
    }

    var value;
    if (!badParam) {
      value = BTM.parseExpression(new rational_number(p,q).toString());
    } else {
      alert("Problem definition missing value specification for denominator of rational parameter " + paramName);
    }
    return value;
  }

  // Parse a parameter that is calculated from earlier parameters.
  parseParamCalculated = function(param, paramName, data) {
    var paramValue;
    var otherParams = data.params;

    var valueInfo = param.getElementsByTagName('formula');
    if (valueInfo.length > 0) {
      paramValue = BTM.parseExpression(valueInfo[0].textContent, otherParams).compose(otherParams).reduce();
    } else {
      alert("Problem definition missing formula for calculated parameter " + paramName);
    }

    return paramValue;
  }


  // Go through all of the parameters and perform the needed computations.
  parseParameters() {
    this.data.params = {};
    var paramEntries = this.activeCode.getElementsByTagName('parameters');
    if (paramEntries.length > 0) {
      // Work through each of the standard parameter types.
      for (var param = paramEntries[0].firstElementChild, i=0; i<paramEntries[0].childElementCount; i++) {
        var paramType = param.tagName;
        var paramName = param.getElementsByTagName("name")[0].textContent;
        if (paramType == "param") {
          this.data.params[paramName] = parseParam(param, paramName, this.data);
        } else if (paramType == "param-rational") {
          this.data.params[paramName] = parseParamRational(param, paramName, this.data);
        } else if (paramType == "param-calculated") {
          this.data.params[paramName] = parseParamCalculated(param, paramName, this.data);
        }
        this.data.params_variables[paramName] = this.data.params[paramName];
        this.data.allValues[paramName] = this.data.params[paramName];
        param = param.nextElementSibling;
      }
    }
  }

  /*
  *  In addition to the numerical parameters, we need to define the variables
  *  and expressions that are based on those values.
  */

  // Expressions will depend on variables. This allows the problem to define which variables are used.
  parseVariables() {
    this.data.variables = {};
    var varEntries = this.activeCode.getElementsByTagName('variables');
    if (varEntries.length > 0) {
      // Work through each of the standard parameter types.
      for (var probVar = varEntries[0].firstElementChild, i=0; i<varEntries[0].childElementCount; i++) {
        var varTag = probVar.tagName;
        if (varTag == "variable") {
          varName = probVar.textContent;
          this.data.variables[varName] = new variable_expr(varName);
          this.data.params_variables[varName] = this.data.variables[varName];
          this.data.allValues[varName] = this.data.variables[varName];
        }
        probVar = probVar.nextElementSibling;
      }
    // If no variables are provided, use x as the default.
    } else {
      this.data.variables["x"] = new variable_expr("x");
    }
  }


  // A problem typically will have formulas to use in the problem,
  // including for stating the problem and for checking the answer.
  parseExpressions() {
    this.data.expressions = {};

    var exprEntries = this.activeCode.getElementsByTagName('expressions');
    if (exprEntries.length > 0) {
      // Work through each of the standard parameter types.
      for (var probExpr=exprEntries[0].firstElementChild, i=0; i<exprEntries[0].childElementCount; i++) {
        var exprTag = probExpr.tagName;
        var exprName = probExpr.getElementsByTagName("name")[0].textContent;
        if (exprTag == "expression") {
          var formulaStr = probExpr.getElementsByTagName("formula")[0].textContent;
          var reductions = probExpr.getElementsByTagName("reduction");

          var formulaExpr;
          formulaExpr = this.btm.parse(decodeEntries(formulaStr), this.data.params_variables);
          // Now we substitute parameters with their values.
          formulaExpr = formulaExpr.compose(this.data.params);
          // If we want to apply reductions, do that now.
          if (reductions.length > 0) {
            formulaExpr = formulaExpr.reduce();
          }

          this.data.expressions[exprName] = formulaExpr;
          this.data.allValues[exprName] = this.data.expressions[exprName];
        } else if (exprTag == "substitution") {
          var formulaStr = probExpr.getElementsByTagName("formula")[0].textContent;
          var reductions = probExpr.getElementsByTagName("reduction");

          var formulaExpr;
          formulaExpr = this.btm.parse(decodeEntries(formulaStr), this.data.params_variables);
          // Now we substitute parameters with their values.
          formulaExpr = formulaExpr.compose(this.data.params);

          // Now apply the provided substitutions.
          var substitutions = probExpr.getElementsByTagName("substitute");
          var j;
          for (var sub=substitutions[0], j=0; j<substitutions.length; j++) {
            var whichVar = sub.getElementsByTagName("variable")[0].textContent;
            var whatValueStr = sub.getElementsByTagName("to")[0].textContent;
            var whatValueExpr = this.btm.parse(decodeEntries(whatValueStr), this.data.params_variables);
            whatValueExpr = whatValueExpr.compose(this.data.params);
            var bindings = {};
            bindings[whichVar] = whatValueExpr;
            formulaExpr = formulaExpr.compose(bindings).reduce();
          }

          this.data.expressions[exprName] = formulaExpr;
          this.data.allValues[exprName] = this.data.expressions[exprName];
        }
        probExpr = probExpr.nextElementSibling;
      }
    }
  }

  // This routine takes the text and looks for strings in ticks `name`
  // It replaces this element with the corresponding parameter, variable, or expression.
  // These should have been previously parsed and stored in this.data.
  decodeEntries = function(statement, displayMode) {
    // First find all of the expected substitutions.
    var substRequestList = {};
    var matchRE = /`([A-Za-z]\w*)`/g;
    var substMatches = statement.match(matchRE);
    if (substMatches != null) {
      for (var i=0; i<substMatches.length; i++) {
        var matchName = substMatches[i];
        matchName = matchName.substr(1,matchName.length-2);
        // Now see if the name is in our substitution rules.
        if (this.data.allValues[matchName] != undefined) {
          if (displayMode != undefined && displayMode) {
            substRequestList[matchName] = this.data.allValues[matchName].toTeX();
          } else {
            substRequestList[matchName] = this.data.allValues[matchName].toString();
          }
        }
      }
    }

    // We are now ready to make the substitutions.
    var retString = statement;
    for (var match in substRequestList) {
      var re = new RegExp("`" + match + "`", "g");
      var subst = substRequestList[match];
      retString = retString.replace(re, subst);
    }
    return retString;
  }
}

var BTMP = (function() {
  /*
  *  When defining a dynamic exercise, the problem likely includes numerical parameters.
  *  Some of these are fixed constants, others are random values, and yet others
  *  are calculated based on earlier defined parameters.
  *  This block of functions are used to generate the values.
  */



  

  prepareTestExpression = function(testElement, responseName, ) {
    var testExpression;
    var testArray = new Array();

    // Look at the children of testElement to see what needs to be tested.
    // If more than one entry, then all need to be true.
    var numTests = 0;
    for (var testResult=testElement.firstElementChild, i=0; i<testElement.childElementCount; i++) {
      var testTag = testResult.tagName;
      var answerType = testResult.getAttribute("type");
      if (answerType === null) {
        answerType="expression";
      }

      testExpression = new Object();
      testExpression.isSimple = true;
      testExpression.negate = false;
      testExpression.type = answerType;

      // See what feedback is associated with failing this test.
      var feedback = "";
      var fbElements = testResult.getElementsByTagName("feedback");
      if (fbElements.length > 0) {
        feedback = fbElements[0].textContent;
      }
      testExpression.feedback = feedback;
      var rTol = testResult.getAttribute("rtol");
      if (rTol !== null) {
        testExpression.rTol = rTol;
      }

      // See if a simple test with response.
      if (testTag == "equals") {
        testExpression.correctExpr = testResult.textContent;
        testExpression.testExpr = "`" + responseName + "`";
        testArray[numTests++] = testExpression;

      // Next alternative is to test a manipulation of the submitted response.
      } else if (testTag == "derived") {
        var equalElement = testResult.getElementsByTagName("equals");
        if (equalElement.length > 0) {
          testExpression.correctExpr = equalElement[0].textContent;
        }
        var exprElement = testResult.getElementsByTagName("expression");
        if (exprElement.length > 0) {
          testExpression.testExpr = exprElement[0].textContent;
        }
        testArray[numTests++] = testExpression;

      // Allow for multiple tests, only one of which must be true.
      } else if (testTag == "or") {
        testExpression = prepareTestExpression(testResult, responseName);
        testExpression.feedback = feedback;
        testExpression.requireAll = false;
        testArray[numTests++] = testExpression;

      // Allow for multiple tests, all of which must be true.
      } else if (testTag == "and") {
        testExpression = prepareTestExpression(testResult, responseName);
        testExpression.feedback = feedback;
        testExpression.requireAll = true;
        testArray[numTests++] = testExpression;

      // Allow for multiple tests, none of which must be true, usually for feedback purposes.
      } else if (testTag == "none") {
        testExpression = prepareTestExpression(testResult, responseName);
        testExpression.feedback = feedback;
        testExpression.requireAll = true;
        testExpression.negate = true; // negate each test.
        testArray[numTests++] = testExpression;
      }

      testResult = testResult.nextElementSibling;
    }
    if (numTests > 1) {
      // Default return is "and".
      testExpression = new Object();
      testExpression.isSimple = false;
      testExpression.negate = false;
      testExpression.requireAll = true;
      testExpression.testArray = testArray;
    } else if (numTests == 1) {
      testExpression = testArray[0];
    } else {
      testExpression = null;
    }
    return testExpression;
  }

  testExpressionCheck = function(testExpression, data) {
    var testResult = new Object();
    testResult.isCorrect = false;

    // Simple tests only need to make single comparison.
    if (testExpression.isSimple) {
      // Identify the expected expression for a correct response.
      var correctText = decodeEntries(testExpression.correctExpr, data);
      var correctExpression = BTM.parseExpression(correctText, data.params_variables).reduce();
      var answerText = decodeEntries(testExpression.testExpr, data);
      var answerExpression = BTM.parseExpression(answerText, data.params_variables);

      var correctValue = false;
      if (testExpression.type == "expression") {
        var options = {};
        if (typeof testExpression.rTol !== 'undefined') {
          options.rTol = testExpression.rTol;
        }
        testResult.isCorrect = correctExpression.compare(answerExpression, options);

      } else if (testExpression.type == "sum" || testExpression.type == "product" || testExpression.type == "list") {
        var options = {};
        if (typeof testExpression.rTol !== 'undefined') {
          options.rTol = testExpression.rTol;
        }
        testResult.isCorrect = correctExpression.compare(answerExpression, options, true);
        correctValue = correctExpression.compare(answerExpression, options);
        if (!testResult.isCorrect && correctValue) {
          testResult.feedback = "Correct Value but Wrong Format";
        }
      } else if (testExpression.type == "polynomial") {
      }

      if (!testResult.isCorrect && (testResult.feedback === null || testResult.feedback === undefined || testResult.feedback == "")) {
        testResult.feedback = testExpression.feedback;
      }

    // Compound tests need to check all entries in an array.
    } else {
      if (testExpression.requireAll) {
        testResult.isCorrect = true;
      }
      var argResult, subTest;
      for (var i=0; i < testExpression.testArray.length; i++) {
        subTest = testExpression.testArray[i];
        argResult = testExpressionCheck(subTest, data);
        if (subTest.negate) {
          argResult.isCorrect = !argResult.isCorrect;
        }
        if (testExpression.requireAll) { // "and"
          if (testResult.isCorrect && !argResult.isCorrect) {
            testResult.isCorrect = false;
            testResult.feedback = subTest.feedback;
          }
        } else { // "or"
          testResult.isCorrect |= argResult.isCorrect;
        }
      }
      if (!testExpression.requireAll && !testResult.isCorrect) {
        testResult.feedback = testExpression.feedback;
      }
    }

    return testResult;
  }

  problem = function(container, xml, problem, seed) {

    if (!seed) {
      seed = 1234;
    }

    var rng = new BTM.rng(seed);

    return {
      parentDiv : container,
      xml : xml,
      problemCode: problem,
      rng: rng
    }
  }
})();



BTM.resetProblem = function() {
  BTM.setProblem(BTM.problems.problem, BTM.problems.parentDiv);
}

BTM.showProblemAnswer = function() {
}


BTM.checkAnswer = function(evt) {
  // From the check button, determine which answer blank is being tested.
  var probID = evt.target.value;
  var answerType = BTM.problems.answers[probID].getAttribute("type");
  if (answerType === null) {
    answerType="expression";
  }
  var feedback = document.getElementById("BTMP-Feedback-"+probID);

  switch (answerType) {
    case "true-false":
      var buttons = document.getElementsByName("BTMP-Answer-"+probID);
      var answerResponse;

      for(var i = 0; i < buttons.length; i++) {
         if(buttons[i].checked)
             answerResponse = buttons[i].value;
       }
      var actualResult = BTM.problems.answers[probID].textContent;
      var isCorrect = (answerResponse == actualResult);
      if (isCorrect) {
        feedback.innerHTML = "Correct";
        feedback.className = "BTMP-Feedback-Correct";
      } else {
        feedback.innerHTML = "Try Again";
        feedback.className = "BTMP-Feedback-Incorrect";
      }
      break;
    default:
      // Pull out the actual answer that was submitted.
      var answerResponse = document.getElementById("BTMP-Answer-"+probID).value;
      var answerExpression = BTM.parseExpression(answerResponse, BTM.problems.data.params_variables);

      feedback.innerHTML = "";
      var previewP = document.createElement("span");
      previewP.innerHTML = "\\(\\displaystyle " + answerExpression.toTeX() + "\\)";
      feedback.appendChild(previewP);

      var feedbackResult = document.createElement("span");
      if (answerExpression == undefined) {
          feedbackResult.innerHTML = "Not a Valid Expression";
          feedbackResult.className = "BTMP-Feedback-Incorrect";
      } else {
        // Push this response as the response expression.
        BTM.problems.data.allValues[BTM.problems.responseNames[probID]] = answerExpression;
        var testResult = BTM.testExpressionCheck(BTM.problems.testExpression[probID], BTM.problems.data);
        if (testResult.isCorrect) {
          feedbackResult.innerHTML = "Correct";
          feedbackResult.className = "BTMP-Feedback-Correct";
        } else {
          if (testResult.feedback === null || testResult.feedback === undefined || testResult.feedback == "") {
            feedbackResult.innerHTML = "Try Again";
          } else {
            feedbackResult.innerHTML = testResult.feedback;
          }
          feedbackResult.className = "BTMP-Feedback-Incorrect";
        }
      }
      feedback.appendChild(feedbackResult);

    // Format the new information.
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "BTMP-Problem-Panel"]);
  }
}

// After XML is loaded, assign the designated problem to the associated
// HTML container. Problems are indexed by the container name.
BTM.attachProblem = function(xml, problem, container) {
  // Store information about the problem.
  var newProblem = {};
  newProblem.parentDiv = container;
  newProblem.xml = xml;
  newProblem.problemCode = BTM.getProblemElement(xml, problem);

  BTM.problems[problem] = newProblem;
  BTM.initializeProblem(newProblem);
}

BTM.initializeProblem = function(problem) {
  var problemElement = problem.problemCode;

  // If the problemElement has random-choices, then we are going to choose one of those problems.
  var randomChoice;
  while ((randomChoice = problemElement.getElementsByTagName("random-choices")).length > 0) {
    var probIDs = randomChoice[0].getElementsByTagName("prob-id");
    var i = randInt(0,probIDs.length-1);
    var probID = probIDs[i].textContent;
    problemElement = BTM.getProblemElement(probID);
  }
  problem.activeCode = problemElement;

  problem.data = {};
  problem.data.allValues = {};
  problem.data.params_variables = {};

  // Identify the parameters.
  BTM.parseProblemParameters(problemElement, BTM.problems.data);
  // Identify the variables.
  BTM.parseProblemVariables(problemElement, BTM.problems.data);
  // Identify the expressions, applying the given parameters.
  BTM.parseProblemExpressions(problemElement, BTM.problems.data);

  // With calculations all defined, we are ready to setup the problem statement.
  var problemPanel = document.getElementById(problem.parentDiv);
  if (problemPanel == null) {
    problemPanel = document.createElement("div");
    problemPanel.id = problem.parentDiv;
    problemPanel.classList.add("BTMP-Problem");
    document.body.appendChild(problemPanel);
  }
  problemPanel.innerHTML = "";

  // Add corner buttons
  var closeButton = document.createElement("button");
  closeButton.className = "BTMP-Corner-Button";
  closeButton.innerHTML = "&#x2715;";
  closeButton.onclick = BTM.closeProblem;
  problemPanel.appendChild(closeButton);

  var answerButton = document.createElement("button");
  answerButton.className = "BTMP-Corner-Button";
  answerButton.innerHTML = "&#10227;";
  answerButton.onclick = BTM.resetProblem;
  problemPanel.appendChild(answerButton);

  // Start content with any statements for the problem.
  var statementPanel = document.createElement("div");
  var statementElement = problemElement.getElementsByTagName("statement");
  if (statementElement.length > 0) {
    for (var i=0; i<statementElement.length; i++) {
      var nextStatement = statementElement[i].innerHTML;
      statementPanel.innerHTML += BTM.decodeEntries(nextStatement, BTM.problems.data, true);
    }
  }
  problemPanel.appendChild(statementPanel);

  // Next, setup the answer blanks.
  BTM.problems.answers = new Array();
  BTM.problems.responseNames = new Array();
  BTM.problems.testExpression = new Array();

  var responseElements = problemElement.getElementsByTagName("response");
  if (responseElements.length > 0) {
    var responsePanel = document.createElement("div");
    for (var i=0; i<responseElements.length; i++) {
      var nextPrompt = responseElements[i];
      var promptDiv = document.createElement("div");

      // Add the prelude to the prompt first.
      var prelude = nextPrompt.getElementsByTagName("prelude");
      if (prelude.length > 0) {
        var preludeP = document.createElement("p");
        preludeP.innerHTML = BTM.decodeEntries(prelude[0].textContent, BTM.problems.data, true);
        promptDiv.appendChild(preludeP);
      }

      // Then add any prompt information.
      var prompt = nextPrompt.getElementsByTagName("prompt");
      if (prompt.length > 0) {
        var promptSpan = document.createElement("span");
        promptSpan.innerHTML = BTM.decodeEntries(prompt[0].textContent, BTM.problems.data, true);
        promptDiv.appendChild(promptSpan);
      }

      // Record the expression name to be used for the response.
      var responseName = nextPrompt.getElementsByTagName("name");
      if (responseName.length > 0) {
        BTM.problems.responseNames[i] = responseName[0].textContent;
      } else {
        BTM.problems.responseNames[i] = "response"+i;
      }

      // Type of response determines how responses are provided
      var answerType = nextPrompt.getAttribute("type");
      if (answerType !== null) {
        switch (answerType) {
          case "true-false":
            var trueDiv = document.createElement("div");

            var trueButton = document.createElement("input");
            trueButton.setAttribute("type","radio");
            trueButton.id = "BTMP-AnswerTrue-" + i;
            trueButton.value = "true";
            trueButton.setAttribute("name", "BTMP-Answer-" + i);
            trueDiv.appendChild(trueButton);

            var span = document.createElement("span");
            span.innerHTML = "True";
            trueDiv.appendChild(span);
            promptDiv.appendChild(trueDiv);

            var falseDiv = document.createElement("div");

            var falseButton = document.createElement("input");
            falseButton.setAttribute("type","radio");
            falseButton.id = "BTMP-AnswerFalse-" + i;
            falseButton.value = "false";
            falseButton.setAttribute("name", "BTMP-Answer-" + i);
            falseDiv.appendChild(falseButton);

            var span = document.createElement("span");
            span.innerHTML = "False";
            falseDiv.appendChild(span);
            promptDiv.appendChild(falseDiv);

            var answerElement = nextPrompt.getElementsByTagName("equals");
            if (answerElement.length > 0) {
              BTM.problems.answers[i] = answerElement[0];
            }
            break;

          case "multiple-choice":
            var trueDiv = document.createElement("div");

            var trueButton = document.createElement("input");
            trueButton.setAttribute("type","radio");
            trueButton.id = "BTMP-AnswerTrue-" + i;
            trueButton.value = "true";
            trueButton.setAttribute("name", "BTMP-Answer-" + i);
            trueDiv.appendChild(trueButton);

            var span = document.createElement("span");
            span.innerHTML = "True";
            trueDiv.appendChild(span);
            promptDiv.appendChild(trueDiv);

            var falseDiv = document.createElement("div");

            var falseButton = document.createElement("input");
            falseButton.setAttribute("type","radio");
            falseButton.id = "BTMP-AnswerFalse-" + i;
            falseButton.value = "false";
            falseButton.setAttribute("name", "BTMP-Answer-" + i);
            falseDiv.appendChild(falseButton);

            var span = document.createElement("span");
            span.innerHTML = "False";
            falseDiv.appendChild(span);
            promptDiv.appendChild(falseDiv);
            break;
        }
      } else {
        // Default: add answer blanks.
        var answerBlank = document.createElement("input");
        answerBlank.setAttribute("type", "text");
        answerBlank.setAttribute("autocapitalize", "none");
        answerBlank.className = "BTMP-AnswerBlank";
        answerBlank.id = "BTMP-Answer-" + i;
        // See if a size is provided.
        var sizeInfo = prompt[0].getAttribute("size");
        if (sizeInfo.length > 0) {
          answerBlank.setAttribute("size", sizeInfo);
        }
        promptDiv.appendChild(answerBlank);
        var answerElement = nextPrompt.getElementsByTagName("equals");
        if (answerElement.length > 0) {
          BTM.problems.answers[i] = answerElement[0];
        }
      }

      // Prepare structure for how to test the response.
      var testElement = nextPrompt.getElementsByTagName("test");
      if (testElement.length > 0) {
        BTM.problems.testExpression[i] = BTM.prepareTestExpression(testElement[0], BTM.problems.responseNames[i]);
      }

      // Followed by a check button.
      var checkButton = document.createElement("button");
      checkButton.innerHTML = "&checkmark;";
      checkButton.value = i;
      checkButton.onclick = BTM.checkAnswer;
      promptDiv.appendChild(checkButton);

      // Followed by empty response field.
      var feedback = document.createElement("p");
      feedback.id = "BTMP-Feedback-" + i;
      promptDiv.appendChild(feedback);

      responsePanel.appendChild(promptDiv);
    }
    problemPanel.appendChild(responsePanel);
  }

  // Format the new information.
  MathJax.Hub.Queue(["Typeset",MathJax.Hub, "BTMP-Problem-Panel"]);
}

BTM.closeProblem = function() {
  var problemPanel = document.getElementById("BTMP-Problem-Panel");
  problemPanel.parentNode.removeChild(problemPanel);
}


BTM.startProblem = function(evt) {
  var codeName = evt.target.getAttribute("code");
  var problemElement = BTM.getProblemElement(codeName);
  if (problemElement !== undefined) {
    BTM.setProblem(problemElement);
  } else {
    BTM.problems.pendingID = codeName;
  }
}


// Stub to access stored data, whether eventually used for database or local storage
function getUserData(containerID) {
  // In principle, do a look-up based on the containerID and see what is stored.
  // At present, nothing is found.
  theData = {};
  return(theData);
}

// See what data comes from the problem definition.
function getDefaultData(problemElement) {
  theData = {};
  // Look for a randomize element. Extract the seed attribute.
  var randomizeElements = problemElement.getElementsByTagName("randomize");
  let seed;
  if (randomizeElements.length > 0) {
    seed = randomizeElements[0].getAttribute('seed');
    if (seed != null && seed !='') {
      theData.seed = seed;
    }
  }
  return(theData);
}

// Create a new problem entity based on XML definition assigned to container.
var masterProblemList = new Array();
attachProblem = function(xml, problemID, container)
{
  // If there was a way to store data about the student, such as last seed and submitted answers,
  // we could pull that in here.
  archiveData = getUserData(container);
  defaultData = getDefaultData(problemElement);

  opts = {
    xml: xml,
    problemID: problemID,
    container: container,
    seed: (typeof archiveData.seed == 'undefined') ? oldData.seed : defaultData.seed
  };
  
  var problem = new DynamicMathProblem(opts);
  masterProblemList.append(problem);
}

// Search through XML for the problem with the given problemID.
// Return the XML subtree based on that node.
getProblemElement = function(xmlDoc, probID) {
  var problemElement;

  if (xmlDoc != null) {
    // Search for the problem matching the code.
    var problemList = xmlDoc.getElementsByTagName('problem');
    for (var i=0; i<problemList.length; i++) {
      // Test if this problem matches the code.
      var problem = problemList[i];
      var probIDs = problem.getElementsByTagName("prob-id");
      if (probIDs.length >= 1) {
        if (probIDs[0].textContent == probID) {
          problemElement = problem;
        }
      }
    }
  }

  return problemElement;
}


// Facilitate loading the XML file containing the problem definitions.
// Uses a cache system in case there are multiple problems using the
// same XML file.
xmlFileCache = {};
retrieveProblem = function(xmlFileRef, problemID, container)
{
  if (typeof xmlFileCache[xmlFileRef] != 'undefined') {
    let problemElement = getProblemElement(xmlFileCache[xmlFileRef], problemID);
    attachProblem(xmlFileCache[xmlFileRef], problemID, container);
  } else {
    fetch(xmlFileRef)
    .then( response => response.text() )
    .then( str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then( xml => {
        xmlFileCache[xmlFileRef] = xml;
        attachProblem(xml, problemID, container);
        });
  }
}

