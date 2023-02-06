/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

/* ***************************************************
   * Define the Function Expression -- defined by a function name and input expression
   * *************************************************** */

import { expression } from "./expression.js"
import { scalar_expr } from "./scalar_expr.js"
import { variable_expr } from "./variable_expr.js"
import { unop_expr } from "./unop_expr.js"
import { binop_expr } from "./binop_expr.js"
import { exprType } from "./BTM_root.js"

export class function_expr extends expression {
    constructor(btm, name, inputExpr, restrictDomain) {
        super(btm);
        this.type = exprType.fcn;
        // Count how many derivatives.
        var primePos = name.indexOf("'");
        this.derivs = 0;
        if (primePos > 0) {
            this.name = name.slice(0,primePos);
            this.derivs = name.slice(primePos).length;
        } else {
            this.name = name;
        }
        if (typeof inputExpr == 'undefined')
            inputExpr = new expression(this.btm);
        this.inputs = [inputExpr];
        inputExpr.parent = this;
        this.domain = restrictDomain;

        this.alternate = null;
        this.builtin = true;
        switch(this.name) {
            case 'asin':
            case 'acos':
            case 'atan':
            case 'asec':
            case 'acsc':
            case 'acot':
                this.name = 'arc'+this.name.slice(1,4);
                break;
            case 'log':
                this.name = 'ln';
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'csc':
            case 'sec':
            case 'cot':
            case 'arcsin':
            case 'arccos':
            case 'arctan':
            case 'arcsec':
            case 'arccsc':
            case 'arccot':
            case 'sqrt':
            case 'root':
            case 'abs':
            case 'exp':
            case 'expb':
            case 'ln':
            case 'log10':
                break;
            default:
                this.builtin = false;
                // When using a custom function for the first time, we need to create
                // a random dummy function for work when not bound to definition.
                // See if we have already used this function.
                // For consistency, we should keep it the same.
                var functionEntry = this.btm.randomBindings[this.name];
                // If never used previously, generate a random function.
                // This will allow valid comparisons to occur.
                if (functionEntry == undefined) {
                    functionEntry = {};
                    functionEntry["input"] = "x";
                    var formula = new scalar_expr(this.btm, this.btm.rng.randRational([-20,20],[1,15]));
                    var newTerm, varTerm;
                    for (var i=1; i<=6; i++) {
                        newTerm = this.btm.parse("sin("+i+"*x)", "formula");
                        newTerm = new binop_expr(this.btm, "*",
                                        new scalar_expr(this.btm, this.btm.rng.randRational([-20,20],[1,10])),
                                        newTerm);
                        formula = new binop_expr(this.btm, "+", formula, newTerm);
                    }
                    functionEntry["value"] = [ formula ];
                    this.btm.randomBindings[this.name] = functionEntry;
                }
                if (this.derivs > 0) {
                    var xvar = new variable_expr(this.btm, "x");
                    for (var i=functionEntry["value"].length; i<=this.derivs; i++) {
                        functionEntry["value"][i] = functionEntry["value"][i-1].derivative(xvar, {"x":0});
                    }
                }
                break;
        }
        // If using a derivative of a known function, then we should compute that in advance.
        if (this.builtin && this.derivs > 0) {
            var xvar = new variable_expr(this.btm, "x");
            var deriv = new function_expr(this.btm, this.name, xvar);
            for (var i=0; i<this.derivs; i++) {
                deriv = deriv.derivative(xvar, {"x":0});
            }
            var binding = {};
            binding["x"] = inputExpr;
            this.alternate = deriv.compose(binding);
        }
    }

    getName() {
        return (this.name + "'".repeat(this.derivs));
    }

    toString(elementOnly) {
        var fcnString, retString;
        if (typeof elementOnly == 'undefined') {
            elementOnly = false;
        }
        fcnString = this.getName();
        if (elementOnly) {
            retString = fcnString;
        } else {
            var argStrings = [];
            if (this.inputs.length == 0 || typeof this.inputs[0] == 'undefined') {
                argStrings.push('?');
            } else {
                for (var i in this.inputs) {
                    argStrings.push(this.inputs[i].toString());
                }
            }
            retString = fcnString + '(' + argStrings.join(',') + ')';
        }
        return(retString);
    }

    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        var allInputs = [], inputOptions = [];
        for (var i in this.inputs) {
            inputOptions.push(this.inputs[i].allStringEquivs());
        }
        var retValue = [];
        var fcnString = this.getName();
        // Want to create a list of all possible input representations.
        function generateArgs(left, rightOptions) {
            if (rightOptions.length==0) {
                allInputs.push(left);
            } else {
                var N = left.length;
                var newLeft = [];
                for (var k in left) {
                    newLeft.push(left[k]);
                }
                for (var k in rightOptions[0]) {
                    newLeft[N] = rightOptions[0][k];
                    generateArgs(newLeft, rightOptions.slice(1));
                }
            }
        }
        generateArgs([], inputOptions);
        for (var i in allInputs) {
            retValue[i] = fcnString+'(' + allInputs[i].join('+') + ')';
        }

        return(retValue);
    }

    toTeX(showSelect) {
        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }
        var texString = '';
        var fcnString;
        var argStrings = [];
        if (typeof this.inputs[0] == 'undefined') {
            argStrings.push('?');
        } else {
            for (var i in this.inputs) {
                argStrings.push(this.inputs[i].toTeX(showSelect));
                if (showSelect && this.select) {
                    argStrings[i] = "{\\color{blue}" + argStrings[i] + "}";
                }
            }
        }

        switch(this.name) {
            case 'sin':
                fcnString = '\\sin';
                break;
            case 'cos':
                fcnString = '\\cos';
                break;
            case 'tan':
                fcnString = '\\tan';
                break;
            case 'csc':
                fcnString = '\\csc';
                break;
            case 'sec':
                fcnString = '\\sec';
                break;
            case 'cot':
                fcnString = '\\cot';
                break;
            case 'arcsin':
                fcnString = '\\sin^{-1}';
                break;
            case 'arccos':
                fcnString = '\\cos^{-1}';
                break;
            case 'arctan':
                fcnString = '\\tan^{-1}';
                break;
            case 'arccsc':
                fcnString = '\\csc^{-1}';
                break;
            case 'arcsec':
                fcnString = '\\sec^{-1}';
                break;
            case 'arccot':
                fcnString = '\\cot^{-1}';
                break;
            case 'sqrt':
                fcnString = '\\mathrm{sqrt}';
                texString = '\\sqrt{' + argStrings[0] + '}';
                break;
            case 'root':
                fcnString = '\\mathrm{root}';
                texString = '\\sqrt[' + argStrings[1] +']{' + argStrings[0] + '}';
                break;
            case 'abs':
                fcnString = '\\abs';
                texString = '\\left|' + argStrings[0] + '\\right|';
                break;
            case 'exp':
                fcnString = 'e^';
                texString = 'e^{' + argStrings[0] + '}';
                break;
            case 'expb':
                fcnString = '\\exp';
                break;
            case 'ln':
                fcnString = '\\ln'
                break;
            case 'log10':
                fcnString = '\\log_{10}'
                break;
            default:
                if (this.name.length > 1) {
                    fcnString = '\\mathrm{' + this.name + '}';
                } else {
                    fcnString = this.name;
                }
                break;
        }
        if (this.derivs > 0) {
            if (this.derivs <= 3) {
                fcnString = fcnString + "'".repeat(this.derivs);
            } else {
                fcnString = fcnString + "^{("+this.derivs+")}";
            }
        }

        if (showSelect && this.select) {
            fcnString = "\\color{red}{" + fcnString + "}";
            texString = '';
        }
        if (texString == '') {
            texString = fcnString + ' \\mathopen{}\\left(' + argStrings.join(',') + '\\right)\\mathclose{}';
        }
        return(texString);
    }

    toMathML() {
        var texString;
        var argString;
        if (typeof this.inputs[0] == 'undefined') {
            argString = '?';
        } else {
            argString = this.inputs[0].toMathML();
        }
        switch(this.name) {
            case 'sin':
            case 'cos':
            case 'tan':
            case 'csc':
            case 'sec':
            case 'cot':
            case 'arcsin':
            case 'arccos':
            case 'arctan':
            case 'exp':
            case 'expb':
            case 'ln':
            case 'abs':
                texString = '<apply><' + this.name + '/>' + argString + '</apply>';
                break;
            case 'sqrt':
                texString = '<apply><root/>' + argString + '</apply>';
                break;
            case 'log10':
                texString = '<apply><log/><logbase><cn>10</cn></logbase>' + argString + '</apply>';
                break;
            default:
                texString = '<apply><ci>' + name + '</ci>' + argString + '</apply>';
                break;
        }
        return(texString);
    }

    operateToTeX() {
        var fcnString;
        switch(this.name) {
            case 'sin':
                fcnString = '\\sin';
                break;
            case 'cos':
                fcnString = '\\cos';
                break;
            case 'tan':
                fcnString = '\\tan';
                break;
            case 'csc':
                fcnString = '\\csc';
                break;
            case 'sec':
                fcnString = '\\sec';
                break;
            case 'cot':
                fcnString = '\\cot';
                break;
            case 'arcsin':
                fcnString = '\\sin^{-1}';
                break;
            case 'arccos':
                fcnString = '\\cos^{-1}';
                break;
            case 'arctan':
                fcnString = '\\tan^{-1}';
                break;
            case 'arccsc':
                fcnString = '\\csc^{-1}';
                break;
            case 'arcsec':
                fcnString = '\\sec^{-1}';
                break;
            case 'arccot':
                fcnString = '\\cot^{-1}';
                break;
            case 'sqrt':
                fcnString = '\\mathrm{sqrt}';
                break;
            case 'abs':
                fcnString = '\\abs';
                break;
            case 'exp':
            case 'expb':
                fcnString = '\\exp';
                break;
            case 'ln':
                fcnString = '\\ln'
                break;
            case 'log10':
                fcnString = '\\log_{10}'
                break;
            default:
                if (this.name.length > 1) {
                    fcnString = '\\mathrm{' + this.name + '}';
                } else {
                    fcnString = this.name;
                }
                break;
        }
        if (this.derivs > 0) {
            if (this.derivs <= 3) {
                fcnString = fcnString + "'".repeat(this.derivs);
            } else {
                fcnString = fcnString + "^{("+this.derivs+")}";
            }
        }

        return(fcnString+"(\\Box)");
    }

    evaluate(bindings) {
        var inputVal = this.inputs[0].evaluate(bindings);
        var retVal = undefined;

        if (inputVal == undefined) {
            return(undefined);
        }

        // Built-in functions with derivatives have computed derivative earlier.
        if (this.builtin && this.derivs > 0) {
            if (this.alternate != undefined) {
                retVal = this.alternate.evaluate(bindings);
            } else {
                console.log("Error: Built-in function called with unspecified derivative formula.");
            }
        } else {
            if (bindings[this.name] == undefined) {
                // Check the list of common mathematical functions.
                switch(this.name) {
                    case 'sin':
                        retVal = Math.sin(inputVal);
                        break;
                    case 'cos':
                        retVal = Math.cos(inputVal);
                        break;
                    case 'tan':
                        retVal = Math.tan(inputVal);
                        break;
                    case 'csc':
                        retVal = 1/Math.sin(inputVal);
                        break;
                    case 'sec':
                        retVal = 1/Math.cos(inputVal);
                        break;
                    case 'cot':
                        retVal = 1/Math.tan(inputVal);
                        break;
                    case 'arcsin':
                        if (Math.abs(inputVal) <= 1) {
                            retVal = Math.asin(inputVal);
                        }
                        break;
                    case 'arccos':
                        if (Math.abs(inputVal) <= 1) {
                            retVal = Math.acos(inputVal);
                        }
                        break;
                    case 'arctan':
                        retVal = Math.atan(inputVal);
                        break;
                    case 'arccsc':
                        if (Math.abs(inputVal) >= 1) {
                            retVal = Math.asin(1/inputVal);
                        }
                        break;
                    case 'arcsec':
                        if (Math.abs(inputVal) >= 1) {
                            retVal = Math.acos(1/inputVal);
                        }
                        break;
                    case 'arccot':
                        if (inputVal == 0) {
                            retVal = Math.PI/2;
                        } else {
                            retVal = Math.PI/2 - Math.atan(1/inputVal);
                        }
                        break;
                    case 'sqrt':
                        if (inputVal >= 0) {
                            retVal = Math.sqrt(inputVal);
                        }
                        break;
                    case 'abs':
                        retVal = Math.abs(inputVal);
                        break;
                    case 'exp':
                    case 'expb':
                        retVal = Math.exp(inputVal);
                        break;
                    case 'ln':
                        if (inputVal > 0) {
                            retVal = Math.log(inputVal);
                        }
                        break;
                    case 'log10':
                        if (inputVal > 0) {
                            retVal = Math.LOG10E * Math.log(inputVal);
                        }
                        break;
                    default:
                        // See if we have already used this function.
                        // For consistency, we should keep it the same.
                        var functionEntry = this.btm.randomBindings[this.name];
                        // If never used previously, generate a random function.
                        // This will allow valid comparisons to occur.
                        if (functionEntry == undefined) {
                            console.log("Error: A custom function never had a backend definition.");
                        }
                        // Copy the bindings.
                        var fBind = {};
                        Object.keys(bindings).forEach(function(key) {
                            fBind[ key ] = bindings[ key ];
                        });
                        // Now, use the variable of the function.
                        fBind[functionEntry["input"]] = inputVal;
                        // See if we need additional derivatives in binding
                        if (this.derivs >= functionEntry["value"].length) {
                            var ivar = new variable_expr(this.btm, functionEntry["input"]);
                            var varBind = {};
                            varBind[ivar] = 0;
                            for (var i=functionEntry["value"].length; i <= this.derivs; i++) {
                                functionEntry["value"][i] = functionEntry["value"][i-1].derivative(ivar, varBind);
                            }
                        }
                        retVal = functionEntry["value"][this.derivs].evaluate(fBind);
                        break;
                }
            } else {
                var functionEntry = bindings[this.name];
                // Copy the bindings.
                var fBind = {};
                Object.keys(bindings).forEach(function(key) {
                    fBind[ key ] = bindings[ key ];
                });
                // Now, use the variable of the function.
                fBind[functionEntry["input"]] = inputVal;
                // See if we need additional derivatives in binding
                if (this.derivs >= functionEntry["value"].length) {
                    var ivar = new variable_expr(this.btm, functionEntry["input"]);
                    var varBind = {};
                    varBind[ivar] = 0;
                    for (var i=functionEntry["value"].length; i <= this.derivs; i++) {
                        functionEntry["value"][i] = functionEntry["value"][i-1].derivative(ivar, varBind);
                    }
                }
                retVal = functionEntry["value"][this.derivs].evaluate(fBind);
            }
        }
        return(retVal);
    }

    flatten() {
        return(new function_expr(this.btm, this.getName(), this.inputs[0].flatten()));
    }

    copy() {
      return(new function_expr(this.btm, this.getName(), this.inputs[0].copy()));
    }

    compose(bindings) {
        return(new function_expr(this.btm, this.getName(), this.inputs[0].compose(bindings)));
    }

    derivative(ivar, varList) {
        var theDeriv;
        var depArray = this.inputs[0].dependencies();
        var uConst = true;
        var ivarName = (typeof ivar == 'string') ? ivar : ivar.name;
        for (var i=0; i<depArray.length; i++) {
            if (depArray[i] == ivarName) {
                uConst = false;
            }
        }

        if (uConst) {
            theDeriv = new scalar_expr(this.btm, 0);
        } else {
            var dydu;

            switch(this.name) {
                    case 'sin':
                        dydu = new function_expr(this.btm, 'cos', this.inputs[0]);
                        break;
                    case 'cos':
                        dydu = new unop_expr(this.btm, '-', new function_expr(this.btm, 'sin', this.inputs[0]));
                        break;
                    case 'tan':
                        var theSec = new function_expr(this.btm, 'sec', this.inputs[0]);
                        dydu = new binop_expr(this.btm, '^', theSec, new scalar_expr(this.btm, 2));
                        break;
                    case 'csc':
                        var theCot = new function_expr(this.btm, 'cot', this.inputs[0]);
                        dydu = new unop_expr(this.btm, '-', new binop_expr(this.btm, '*', this, theCot));
                        break;
                    case 'sec':
                        var theTan = new function_expr(this.btm, 'tan', this.inputs[0]);
                        dydu = new binop_expr(this.btm, '*', this, theTan);
                        break;
                    case 'cot':
                        var theCsc = new function_expr(this.btm, 'csc', this.inputs[0]);
                        dydu = new unop_expr(this.btm, '-', new binop_expr(this.btm, '^', theCsc, new scalar_expr(this.btm, 2)));
                        break;
                    case 'arcsin':
                        var theCos = new binop_expr(this.btm, '-', new scalar_expr(this.btm, 1), new binop_expr(this.btm, '^', this.inputs[0], new scalar_expr(this.btm, 2)));
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, 1), new function_expr(this.btm, 'sqrt', theCos));
                        break;
                    case 'arccos':
                        var theSin = new binop_expr(this.btm, '-', new scalar_expr(this.btm, 1), new binop_expr(this.btm, '^', this.inputs[0], new scalar_expr(this.btm, 2)));
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, -1), new function_expr(this.btm, 'sqrt', theSin));
                        break;
                    case 'arctan':
                        var tanSq = new binop_expr(this.btm, '^', this.inputs[0], new scalar_expr(this.btm, 2));
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, 1), new binop_expr(this.btm, '+', new scalar_expr(this.btm, 1), tanSq));
                        break;
                    case 'arcsec':
                        var theSq = new binop_expr(this.btm, '^', this.inputs[0], new scalar_expr(this.btm, 2));
                        var theRad = new binop_expr(this.btm, '-', theSq, new scalar_expr(this.btm, 1));
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, 1), new binop_expr(this.btm, '*', new function_expr(this.btm, 'abs', this.inputs[0]), new function_expr(this.btm, 'sqrt', theRad)));
                        break;
                    case 'arccsc':
                        var theSq = new binop_expr(this.btm, '^', this.inputs[0], new scalar_expr(this.btm, 2));
                        var theRad = new binop_expr(this.btm, '-', theSq, new scalar_expr(this.btm, 1));
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, -1), new binop_expr(this.btm, '*', new function_expr(this.btm, 'abs', this.inputs[0]), new function_expr(this.btm, 'sqrt', theRad)));
                        break;
                    case 'arccot':
                        var cotSq = new binop_expr(this.btm, '^', this.inputs[0], new scalar_expr(this.btm, 2));
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, -1), new binop_expr(this.btm, '+', new scalar_expr(this.btm, 1), cotSq));
                        break;
                    case 'sqrt':
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, 1), new binop_expr(this.btm, '*', new scalar_expr(this.btm, 2), this));
                        break;
                    case 'abs':
                        dydu = new binop_expr(this.btm, '/', this, this.inputs[0]);
                        break;
                    case 'exp':
                    case 'expb':
                        dydu = new function_expr(this.btm, this.name, this.inputs[0]);
                        break;
                    case 'ln':
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, 1), this.inputs[0]);
                        break;
                    case 'log10':
                        dydu = new binop_expr(this.btm, '/', new scalar_expr(this.btm, Math.LOG10E), this.inputs[0]);
                        break;
                    default:
                        dydu = new function_expr(this.btm, this.getName()+"'", this.inputs[0]);
                        break;
            }
            if (!uConst && this.inputs[0].type == exprType.variable) {
                theDeriv = dydu;
            } else {
                var dudx = this.inputs[0].derivative(ivar, varList);

                if (dudx == undefined) {
                    theDeriv = undefined;
                } else {
                    theDeriv = new binop_expr(this.btm, '*', dydu, dudx);
                }
            }
        }
        return(theDeriv);
    }
}