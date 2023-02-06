/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

import { BTM, exprValue } from "./BTM_root.js"
import { findMatchRules } from "./reductions.js"

export class MathObject {
    constructor(btm) {
        this.btm = btm;
        if (!(btm instanceof BTM)) {
            throw "MathObject constructed with invalid environment";
        }
        this.select = false;
        this.parent = null;
        this.inputs = [];
        this.valueType = exprValue.undef;
        this.context = undefined;
    }
    
    // Method to *evaluate* the object.
    // - Return undefined
    value(bindings) {
    }
    
    // Update context setting
    setContext(context) {
        this.context = context;
        // Update context on inputs.
        for (var i in this.inputs) {
            this.inputs[i].setContext(context);
        }
    }

    // When the parser throws an error, need to record it.
    setParsingError(errorString) {
        this.parseError = errorString;
    }

    // Errors from parsing. Check all possible children (recursively)
    hasParsingError() {
        var retValue = false,
            i = 0;
        if (this.parseError) {
            retValue = true;
        }

        while (!retValue && i < this.inputs.length) {
            // Check for reductions on inputs.
            retValue = this.inputs[i].hasParsingError();
            i++;
        }
        return retValue;
    }
    
    // Errors from parsing. Find the *first* error in the parsing process.
    getParsingError() {
        var errString = this.parseError;
        var i=0;
        while (!errString && i < this.inputs.length) {
            errString = this.inputs[i].getParsingError();
        }
        return (errString);
    }
    
    // Method to generate the expression as input-style string.
    toString(elementOnly) {
        if (typeof elementOnly == 'undefined') {
            elementOnly = false;
        }
        var theStr = '';
        return(theStr);
    }
    
    // Method to generate the expression using presentation-style (LaTeX)
    // - showSelect is so that part of the expression can be highlighted
    toTeX(showSelect) {
        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }
        return(this.toString());
    }

    // Method to represent the expression using MathML
    toMathML() {
        return("<mi>" + this.toString() + "</mi>");
    }
    
    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        return([]);
    }
    
    // To convert binary tree structure to n-ary tree for supported operations (+ and *)
    // Most things can't flatten. Return a copy.
    flatten() {
        return this.copy();
    }
    
    // Test if the expression evaluates to a constant.
    isConstant() {
        var retValue = false;
        return(retValue);
    }
    
    // Test if the expression evaluates to a constant.
    isExpression() {
        var retValue = false;
        return(retValue);
    }

}

export class expression extends MathObject {
  constructor(btm) {
        if (!(btm instanceof BTM)) {
            throw "expression constructed with invalid environment";
        }
        super(btm);
        this.select = false;
        this.parent = null;
        this.inputs = [];
        this.valueType = exprValue.numeric;
    }

    // Method to *evaluate* the value of the expression using given symbol bindings.
    // - Return native Number value
    value(bindings) {
        return(this.evaluate(bindings));
    }

    // When the parser throws an error, need to record it.
    setParsingError(errorString) {
        this.parseError = errorString;
    }

    // Errors from parsing. Check all possible children (recursively)
    hasParsingError() {
        var retValue = false,
            i = 0;
        if (this.parseError) {
            retValue = true;
        }

        while (!retValue && i < this.inputs.length) {
            // Check for reductions on inputs.
            retValue = this.inputs[i].hasParsingError();
            i++;
        }
        return retValue;
    }

    // Errors from parsing. Find the *first* error in the parsing process.
    getParsingError() {
        var errString = this.parseError;
        var i=0;
        while (!errString && i < this.inputs.length) {
            errString = this.inputs[i].getParsingError();
        }
        return (errString);
    }

    // Method to generate the expression as input-style string.
    toString(elementOnly) {
        if (typeof elementOnly == 'undefined') {
            elementOnly = false;
        }
        var theStr = '';
        return(theStr);
    }

    // Method to generate the expression using presentation-style (LaTeX)
    // - showSelect is so that part of the expression can be highlighted
    toTeX(showSelect) {
        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }
        return(this.toString());
    }

    // Method to represent the expression using MathML
    toMathML() {
        return("<mi>" + this.toString() + "</mi>");
    }

    operateToTeX() {
        return(this.toTeX());
    }

    treeToTeX(expand) {
        var retStruct = {};
        
        retStruct.parent = (typeof this.parent === 'undefined' || this.parent === null) ? null : this.parent.operateToTeX();
        if (typeof expand === 'undefined' || !expand) {
            retStruct.current = this.toTeX();
            retStruct.inputs = null;
        } else {
            retStruct.current = this.operateToTeX();
            retStruct.inputs = [];
            for (var i in this.inputs) {
                retStruct.inputs[i] = this.inputs[i].toTeX();
            }
        }
        return(retStruct);
    }


    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        return([]);
    }

    // To convert binary tree structure to n-ary tree for supported operations (+ and *)
    // Most things can't flatten. Return a copy.
    flatten() {
        return this.copy();
    }

    // Create a new expression that is a copy.
    copy() {
        var myCopy = new expression(this.btm);
        return myCopy;
    }

    // When subtree only involves constants, simplify the formula to a value.
    // Default: Look at all descendants (inputs) and simplify there.
    simplifyConstants() {
        for (var i in this.inputs) {
            this.inputs[i] = this.inputs[i].simplifyConstants();
            this.inputs[i].parent = this;
        }
        return(this);
    }

    // Find all dependencies (symbols) required to evaluate expression.
    dependencies(forced) {
        var inDeps;
        var i, j;
        var depArray = new Array();

        var master = {};
        if (forced != undefined) {
            for (var i=0; i<forced.length; i++) {
                depArray.push(forced[i]);
                master[forced[i]] = true;
            }
        }
        for (i in this.inputs) {
            inDeps = this.inputs[i].dependencies();
            for (j in inDeps) {
                if (typeof master[inDeps[j]] == "undefined") {
                    depArray.push(inDeps[j]);
                    master[inDeps[j]] = true;
                }
            }
        }

        return(depArray);
    }

    // Method to return input at given index.
    getInput(whichInput) {
        var inputExpr = null;
        if (whichInput < 0 || whichInput >= this.inputs.length) {
            throw 'Attempt to get an undefined input expression.';
        } else {
            inputExpr = this.inputs[whichInput];
        }
        return(inputExpr);
    }

    // Test if the expression evaluates to a constant.
    isConstant() {
        var retValue = true;
        for (var i in this.inputs) {
            retValue = retValue & this.inputs[i].isConstant();
        }
        return(retValue);
    }

    // Evaluate the expression given the bindings to symbols.
    evaluate(bindings) {
        return(0);
    }

    // Create a *new* expression where a symbol is *replaced* by a bound expression
    compose(bindings) {
        return(new expression(this.btm));
    }

    // Compare *this* expression to a given *testExpr*.
    // *options* gives options associated with testing (e.g., relative tolerance)
    // but also supports fixing certain bindings.
    // Supports abstract input matching against variables using *matchInputs*
    compare(testExpr, options, matchInputs) {
        var isEqual = true;
        var i, n;

        if (matchInputs == undefined) {
            matchInputs = false;
        }
        if (options == undefined) {
            options = {};
        }
        var knownBindings = Object.keys(options);
        var unknownBindings = [];

        var rTol = 1e-8;
        if (typeof options.rTol !== 'undefined') {
            rTol = options.rTol;
            i = knownBindings.indexOf('rTol');
            knownBindings.splice(i, 1);
        }

        var dependA = this.dependencies();
        var dependB = testExpr.dependencies();

        for (i=0; i<dependA.length; i++) {
            if (knownBindings.indexOf(dependA[i]) < 0
                && unknownBindings.indexOf(dependA[i]) < 0)
            {
                unknownBindings.push(dependA[i]);
            }
        }
        for (i=0; i<dependB.length; i++) {
            if (knownBindings.indexOf(dependB[i]) < 0
                && unknownBindings.indexOf(dependB[i]) < 0)
            {
                unknownBindings.push(dependB[i]);
            }
        }

        // Create the arrays of test points.
        var variableList = [];
        var testPointList = [];
        var x, xOpt, xMin, xMax, dx, n, testPoints;
        n = 10;
        for (i=0; i<knownBindings.length; i++) {
            x = knownBindings[i];
            xOpt = options[x];
            xMin = xOpt.min;
            xMax = xOpt.max;
            dx = (xMax-xMin)/n;
            testPoints = [];
            for (var j=0; j<n; j++) {
                testPoints[j] = xMin+j*dx;
            }
            testPoints[n] = xMax;

            // Add this to the list of testing arrays.
            variableList.push(x);
            testPointList.push(testPoints);
        }
        for (i=0; i<unknownBindings.length; i++) {
            x = unknownBindings[i];
            xMin = -2;
            xMax = 2;
            dx = (xMax-xMin)/n;
            testPoints = [];
            for (var j=0; j<n; j++) {
                testPoints[j] = xMin+j*dx;
            }
            testPoints[n] = xMax;

            // Add this to the list of testing arrays.
            variableList.push(x);
            testPointList.push(testPoints);
        }

        // Now we will proceed through all possible points.
        // Analogy: Each variable is like one "digit" on an odometer.
        // Go through full cycle of a variable's options and then advance the next variable.
        // Use an odometer-like array that references which point from
        // each list is being used. When the last entry reaches the end,
        // the odometer rolls over until all entries are done.
        var odometer = [];
        for (i=0; i<variableList.length; i++)
            odometer[i]=0;
        var done = false;
        while (!done && isEqual) {
            var y1, y2;
            var bindings = {};
            for (i=0; i<variableList.length; i++) {
                x = variableList[i];
                bindings[x] = testPointList[i][odometer[i]];
            }
            y1 = this.evaluate(bindings);
            y2 = testExpr.evaluate(bindings);
            // Both finite? Check for relative error.
            if (isFinite(y1) && isFinite(y2)) {
                if (!(Math.abs(y1)<1e-12 && Math.abs(y2)<1e-12)
                    && Math.abs(y1-y2)/Math.abs(y1)>rTol) {
                    isEqual = false;
                }
                // If one is finite, other must be NaN
                } else if ( (isFinite(y1) && !isNaN(y2))
                            || (isFinite(y2) && !isNaN(y1)) ) {
                    isEqual = false;
                }

                // Advance the odometer.
                var j=0;
                done = true; // This will only persist when the odometer is done.
                while (j < variableList.length) {
                    odometer[j]++;
                    if (odometer[j] >= testPointList[j].length) {
                        odometer[j] = 0;
                        j++;
                    } else {
                        done = false;
                        break;
                    }
                }
            }
            if (matchInputs && isEqual) {
                var matchOp;
                if (this.op == '+' || this.op == '-') {
                    matchOp = '+';
                } else if (this.op == '*' || this.op == '/') {
                    matchOp = '*';
                }
                if ((matchOp=='+' && testExpr.op != '+' && testExpr.op != '-')
                    || (matchOp=='*' && testExpr.op != '*' && testExpr.op != '/')) {
                    isEqual = false;
                }
                if (isEqual) {
                    var flatA, flatB;
                    flatA = this.flatten();
                    flatB = testExpr.flatten();
                    if (flatA.inputs.length == flatB.inputs.length) {
                    var inputMatched = [];
                    for (i=0; i<flatA.inputs.length; i++) {
                        inputMatched[i] = false;
                    }
                    // Go through each input of testExpr and see if it matches on of this inputs.
                    for (i=0; i<flatB.inputs.length && isEqual; i++) {
                        var matchFound = false;
                        for (j=0; j<flatA.inputs.length && !matchFound; j++) {
                            if (!inputMatched[j] && flatA.inputs[j].compare(flatB.inputs[i])) {
                                inputMatched[j] = true;
                                matchFound = true;
                            }
                        }
                        if (!matchFound) {
                            isEqual = false;
                        }
                    }
                } else {
                    isEqual = false;
                }
            }
        }
        return(isEqual);
    }

    // Apply reduction rules to create a reduced expression
    reduce() {
        var workExpr = this.simplifyConstants();
        var matchRules;

        // Check for reductions on inputs.
        for (var i in workExpr.inputs) {
            workExpr.inputs[i] = workExpr.inputs[i].reduce();
        }
        matchRules = findMatchRules(this.btm.reduceRules, workExpr, true);
        while (matchRules.length > 0) {
            workExpr = this.btm.parse(matchRules[0].subStr, this.context);
            matchRules = findMatchRules(this.btm.reduceRules, workExpr, true);
        }
        return workExpr;
    }

    
    derivative(ivar, varList) {
        return(new scalar_expr(this.btm, 0));
    }

    /*
        The match method is designed to compare "this" expression
        to the given "expr" expression and see if it is consistent with
        the current bindings. The bindings will be an object where
        variables in "this" are assigned to strings representing expressions.
        If there is a mismatch, return "null" and the matching process should terminate.

        Overrides:
            - numbers, to deal with scalar formula that simplify
            - variables, which can match arbitrary expressions.
            - indexed expressions might need a special method.
            - multiop, where should see if a variable can match a subcollection of inputs.
    */
    match(expr, bindings) {
        var retValue = null;
        if (this.type == expr.type && this.operateToTeX() == expr.operateToTeX()) {
            retValue = bindings;
            for (var i=0; i<this.inputs.length; i++) {
                if (retValue !== null) {
                    retValue = this.inputs[i].match(expr.inputs[i], retValue);
                }
            }
        }
        return(retValue);
    }

    inputSubst(origExpr, subExpr) {
        var i = this.inputs.indexOf(origExpr);
        if (i >= 0) {
            this.inputs[i] = subExpr;
            if (subExpr !== undefined) {
                subExpr.parent = this;
            }
        }
    }
}