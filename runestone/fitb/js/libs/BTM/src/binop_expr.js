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
* Define the Binary Expression -- defined by an operator and two inputs.
* *************************************************** */

import { BTM, opPrec, exprType, exprValue } from "./BTM_root.js"
import { expression } from "./expression.js"
import { scalar_expr } from "./scalar_expr.js"
import { unop_expr } from "./unop_expr.js"

export class binop_expr extends expression {
    constructor(btm, op, inputA, inputB) {
        super(btm);
        this.type = exprType.binop;
        this.op = op;
        if (typeof inputA == 'undefined')
            inputA = new expression(this.btm);
        if (typeof inputB == 'undefined')
            inputB = new expression(this.btm);
        this.inputs = [inputA, inputB];
            inputA.parent = this;
            inputB.parent = this;

        switch (op) {
            case '+':
            case '-':
                this.prec = opPrec.addsub;
                break;
            case '*':
            case '/':
                this.prec = opPrec.multdiv;
                break;
            case '^':
                this.prec = opPrec.power;
                break;
            case '&':
                this.prec = opPrec.conj;
                this.valueType = exprValue.bool;
                break;
            case '$':
                this.prec = opPrec.disj;
                this.valueType = exprValue.bool;
                break;
            case '=':
                this.prec = opPrec.equal;
                this.valueType = exprValue.bool;
                break;
            default:
                console.log("Unknown binary operator: '"+op+"'.");
                break;
        }
    }

    toString() {
        var theStr;
        var opAStr, opBStr;
        var isError = false;

        if (typeof this.inputs[0] == 'undefined') {
            opAStr = '?';
            isError = true;
        } else {
            opAStr = this.inputs[0].toString();
            if ((this.inputs[0].type >= exprType.unop
                    && this.inputs[0].prec < this.prec)
                || (this.inputs[0].type == exprType.number
                    && opAStr.indexOf("/") >= 0
                    && opPrec.multdiv <= this.prec)
                ) 
            {
                opAStr = '(' + opAStr + ')';
            }
        }
        if (typeof this.inputs[1] == 'undefined') {
            opBStr = '?';
            isError = true;
        } else {
            opBStr = this.inputs[1].toString();
            if ((this.inputs[1].type >= exprType.unop
                    && this.inputs[1].prec <= this.prec)
                || (this.inputs[1].type == exprType.number
                    && opBStr.indexOf("/") >= 0
                    && opPrec.multdiv <= this.prec)
                ) 
            {
                opBStr = '(' + opBStr + ')';
            }
        }

        var theOp = this.op;
        if (theOp == '|') {
            theOp = ' $ ';
        }

        theStr = opAStr + theOp + opBStr;
        return(theStr);
    }

    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        var allInputsA = this.inputs[0].allStringEquivs(),
            allInputsB = this.inputs[1].allStringEquivs();

        var retValue = [];

        var theOp = this.op;
        if (theOp == '|') {
            theOp = ' $ ';
        }

        for (var i in allInputsA) {
            for (var j in allInputsB) {
                opAStr = allInputsA[i];
                if (this.inputs[0].type >= exprType.unop && this.inputs[0].prec < this.prec) {
                    opAStr = '(' + opAStr + ')';
                }
                opBStr = allInputsB[j];
                if (this.inputs[1].type >= exprType.unop && this.inputs[1].prec <= this.prec) {
                    opBStr = '(' + opBStr + ')';
                }

                retValue.push(opAStr + theOp + opBStr);

                if (this.op == '+' || this.op == '*' || this.op == '&' || this.op == '$') {
                    opBStr = allInputsB[j];
                    if (this.inputs[1].type >= exprType.unop && this.inputs[1].prec < this.prec) {
                        opBStr = '(' + opBStr + ')';
                    }
                    opAStr = allInputsA[i];
                    if (this.inputs[0].type >= exprType.unop && this.inputs[0].prec <= this.prec) {
                        opAStr = '(' + opAStr + ')';
                    }
                    retValue.push(opBStr + theOp + opAStr);
                }
            }
        }

        return(retValue);
    }

    toTeX(showSelect) {
        var theStr;
        var theOp;
        var opAStr, opBStr;

        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }

        if (typeof this.inputs[0] == 'undefined') {
            opAStr = '?';
        } else {
            opAStr = this.inputs[0].toTeX(showSelect);
        }
        if (typeof this.inputs[1] == 'undefined') {
            opBStr = '?';
        } else {
            opBStr = this.inputs[1].toTeX(showSelect);
        }
        theOp = this.op;
        if (showSelect && this.select) {
            switch (theOp) {
                case '*':
                    theOp = '\\cdot ';
                    break;
                case '/':
                    theOp = '\\div ';
                    break;
                case '^':
                    theOp = '\\wedge ';
                    break;
                case '|':
                    theOp = '\\hbox{ or }';
                    break;
                case '$':
                    theOp = '\\hbox{ or }';
                    break;
                case '&':
                    theOp = '\\hbox{ and }';
                    break;
            }
        } else {
            switch (theOp) {
                case '*':
                    if (this.inputs[1] && this.inputs[1].type == exprType.number) {
                        theOp = '\\cdot ';
                    } else if (this.inputs[1] && this.inputs[1].type == exprType.binop
                                && this.inputs[1].op=='^' && this.inputs[1].inputs[0].type==exprType.number) {
                        theOp = '\\cdot ';
                    } else {
                        theOp = ' ';
                    }
                    break;
                case '|':
                    theOp = '\\hbox{ or }';
                    break;
                case '$':
                    theOp = '\\hbox{ or }';
                    break;
                case '&':
                    theOp = '\\hbox{ and }';
                    break;
            }
        }
        if (theOp == '/') {
            theStr = '\\frac{' + opAStr + '}{' + opBStr + '}';
        } else if (theOp == '^') {
            if (this.inputs[0] && this.inputs[0].type >= exprType.fcn) {
                theStr = '\\left(' + opAStr + '\\right)';
            } else {
                theStr = opAStr;
            }
            theStr += theOp + '{' + opBStr + '}';
        } else {
            var argStrL='', argStrR='', opStrL='', opStrR='';

            if (showSelect && this.select) {
                argStrL = '{\\color{blue}';
                argStrR = '}';
                opStrL = '{\\color{red}';
                opStrR = '}';
            }
            if (this.inputs[0] && this.inputs[0].type >= exprType.unop && this.inputs[0].prec < this.prec) {
                theStr = '\\left(' + argStrL + opAStr + argStrR + '\\right)';
            } else {
                theStr = argStrL + opAStr + argStrR;
            }
            theStr += opStrL + theOp + opStrR;
            if (this.inputs[1] && this.inputs[1].type >= exprType.unop && this.inputs[1].prec <= this.prec) {
                theStr += '\\left(' + argStrL + opBStr + argStrR + '\\right)';
            } else {
                theStr += argStrL + opBStr + argStrR;
            }
        }
        if (showSelect && this.select) {
          theStr = "{\\color{red}\\boxed{" + theStr + "}}";
        }
        theStr = theStr.replace(/\+-/g, '-');
        return(theStr);
    }

    toMathML() {
        var theStr;
        var theOp;
        var opAStr, opBStr;

        if (typeof this.inputs[0] == 'undefined') {
            opAStr = '?';
        } else {
            opAStr = this.inputs[0].toMathML();
        }
        if (typeof this.inputs[1] == 'undefined') {
            opBStr = '?';
        } else {
            opBStr = this.inputs[1].toMathML();
        }
        switch (this.op) {
            case '+':
                theOp = "<plus/>"
                break;
            case '-':
                theOp = "<minus/>"
                break;
            case '*':
                theOp = "<times/>"
                break;
            case '/':
                theOp = "<divide/>"
                break;
            case '^':
                theOp = "<power/>"
                break;
        }
        theStr = "<apply>" + theOp + opAStr + opBStr + "</apply>";

        return(theStr);
    }

    operateToTeX() {
        var opString = this.op;

        switch (opString) {
            case '*':
                opString = '\\times ';
                break;
            case '/':
                opString = '\\div ';
                break;
            case '^':
                opString = '\\wedge ';
                break;
            case '|':
                opString = '\\hbox{ or }';
                break;
            case '$':
                opString = '\\hbox{ or }';
                break;
            case '&':
                opString = '\\hbox{ and }';
                break;
        }

        return(opString);
    }

    isCommutative() {
        var commutes = false;
        if (this.op === '+' || this.op === '*') {
            commutes = true;
        }
        return(commutes);
    }

    evaluate(bindings) {
        var inputAVal = this.inputs[0].evaluate(bindings);
        var inputBVal = this.inputs[1].evaluate(bindings);

        if (inputAVal == undefined || inputBVal == undefined) {
            return(undefined);
        }

        var retVal = undefined;
        switch (this.op) {
            case '+':
                retVal = inputAVal + inputBVal;
                break;
            case '-':
                retVal = inputAVal - inputBVal;
                break;
            case '*':
                retVal = inputAVal * inputBVal;
                break;
            case '/':
                retVal = inputAVal / inputBVal;
                break;
            case '^':
                if (!this.inputs[1].isConstant()) {
                    retVal = Math.exp(inputBVal * Math.log(inputAVal));
                } else {
                    if (inputAVal >= 0 || (inputBVal % 1 == 0)) {
                        retVal = Math.pow(inputAVal,inputBVal);
                    } else {
                        retVal = Math.exp(inputBVal * Math.log(inputAVal));
                    }
                }
                break;
            case '=':
                retVal = (Math.abs(inputAVal - inputBVal) < this.btm.options.absTol);
                break;
            case '&':
                retVal = inputAVal && inputBVal;
                break;
            case '|':
            case '$':
                retVal = inputAVal || inputBVal;
                break;
            default:
                console.log("The binary operator '" + this.op + "' is not defined.");
                retVal = undefined;
                break;
        }
        return(retVal);
    }

    // See if this operator is now redundant.
    // Return the resulting expression.
    reduce() {
        var newExpr = this;
        if (this.inputs.length <= 1) {
            if (this.inputs.length == 0) {
                // Sum with no elements = 0
                // Product with no elements = 1
                newExpr = new scalar_expr(this.btm, this.op == '+' ? 0 : 1);
            } else {
                // Sum or product with one element *is* that element.
                newExpr = this.inputs[0].reduce();
            }
            newExpr.parent = this.parent;
            if (this.parent !== null) {
                this.parent.inputSubst(this, newExpr);
            }
        }
        return(newExpr);
    }

    simplifyConstants() {
        var retVal = this;
        this.inputs[0] = this.inputs[0].simplifyConstants();
        this.inputs[0].parent = this;
        this.inputs[1] = this.inputs[1].simplifyConstants();
        this.inputs[1].parent = this;
        if ((this.inputs[0].type == exprType.number
                || (this.inputs[0].type == exprType.unop && this.inputs[0].inputs[0].type == exprType.number)
            ) &&
            (this.inputs[1].type == exprType.number
                || (this.inputs[1].type == exprType.unop && this.inputs[1].inputs[0].type == exprType.number)
            ))
        {
            var numA, numB, theNumber;
            if (this.inputs[0].type == exprType.number) {
                numA = this.inputs[0].number;
            } else {
                switch (this.inputs[0].op) {
                    case '-':
                        numA = this.inputs[0].inputs[0].number.addInverse();
                        break;
                    case '/':
                        numA = this.inputs[0].inputs[0].number.multInverse();
                        break;
                }
            }
            if (this.inputs[1].type == exprType.number) {
                numB = this.inputs[1].number;
            } else {
                switch (this.inputs[1].op) {
                    case '-':
                        numB = this.inputs[1].inputs[0].number.addInverse();
                        break;
                    case '/':
                        numB = this.inputs[1].inputs[0].number.multInverse();
                        break;
                }
            }
            switch (this.op) {
                case '+':
                    theNumber = numA.add(numB);
                    break;
                case '-':
                    theNumber = numA.subtract(numB);
                    break;
                case '*':
                    theNumber = numA.multiply(numB);
                    break;
                case '/':
                    theNumber = numA.divide(numB);
                    break;
                case '^':
                    // Integer powers of a rational number can be represented exactly.
                    if (numA instanceof rational_number && numB instanceof rational_number
                            && numB.q == 1 && numB.p % 1 == 0 && numB.p > 0) {
                        theNumber = new rational_number(Math.pow(numA.p, numB.p), Math.pow(numA.q, numB.p));
                    }
                    break;
            }
            if (theNumber !== undefined) {
                if (!this.btm.options.negativeNumbers && theNumber.p < 0) {
                    retVal = new unop_expr(this.btm, '-', new scalar_expr(this.btm, theNumber.multiply(-1)));
                } else {
                    retVal = new scalar_expr(this.btm, theNumber);
                }
            }
        } else {
            switch (this.op) {
                case '+':
                    // Simplify 0+a
                    if (this.inputs[0].type == exprType.number
                            && this.inputs[0].number.value()==0) {
                        retVal = this.inputs[1];
                    }
                    // Simplify a+0
                    else if (this.inputs[1].type == exprType.number
                            && this.inputs[1].number.value() == 0) {
                        retVal = this.inputs[0];
                    }
                    break;
                case '-':
                    // Simplify 0-a
                    if (this.inputs[0].type == exprType.number
                            && this.inputs[0].number.value()==0) {
                        retVal = new unop_expr(this.btm, "-", this.inputs[1]);
                    }
                    // Simplify a-0
                    else if (this.inputs[1].type == exprType.number
                            && this.inputs[1].number.value() == 0) {
                        retVal = this.inputs[0];
                    }
                    break;
                case '*':
                    // Simplify 1*a
                    if (this.inputs[0].type == exprType.number
                            && this.inputs[0].number.value()==1) {
                        retVal = this.inputs[1];
                    }
                    // Simplify a*1
                    else if (this.inputs[1].type == exprType.number
                            && this.inputs[1].number.value() == 1) {
                        retVal = this.inputs[0];
                    }
                    break;
                case '/':
                    // Simplify 1/a to unary operator of multiplicative inverse.
                    if (this.inputs[0].type == exprType.number
                            && this.inputs[0].number.value()==1) {
                        retVal = new unop_expr(this.btm, "/", this.inputs[1]);
                    }
                    // Simplify a/1
                    else if (this.inputs[1].type == exprType.number
                            && this.inputs[1].number.value() == 1) {
                        retVal = this.inputs[0];
                    }
                    break;
                case '^':
                    // Simplify 0^p
                    if (this.inputs[0].type == exprType.number
                            && this.inputs[0].number.value()==0) {
                        retVal = new scalar_expr(this.btm, 0);
                    }
                    // Simplify 1^p
                    else if (this.inputs[0].type == exprType.number
                            && this.inputs[0].number.value() == 1) {
                        retVal = new scalar_expr(this.btm, 1);
                    }
                    // Simplify p^1
                    else if (this.inputs[1].type == exprType.number
                            && this.inputs[1].number.value() == 1) {
                        retVal = this.inputs[0];
                    }
                    break;
            }
        }
        return(retVal);
    }

    flatten() {
        var inA = this.inputs[0].flatten();
        var inB = this.inputs[1].flatten();

        var retVal;
        switch (this.op) {
            case '+':
            case '-':
                var inputs = [];
                if ((inA.type == exprType.multiop || inA.type == exprType.binop)
                    && (inA.op == '+' || inA.op == '-')) 
                {
                    var newInput = inA.flatten();
                    for (var i in newInput.inputs) {
                        inputs.push(newInput.inputs[i]);
                    }
                } else {
                    inputs.push(inA);
                }
                if ((inB.type == exprType.multiop || inB.type == exprType.binop)
                    && (inB.op == '+' || inB.op == '-')) 
                {
                    var newInput = inB.flatten();
                    for (var i in newInput.inputs) {
                        inputs.push(newInput.inputs[i]);
                    }
                } else {
                    if (this.op == '-') {
                        if ((inB.type == exprType.multiop || inB.type == exprType.binop)
                            && (inB.op == '+' || inB.op == '-')) 
                        {
                            var newInput = inB.flatten();
                            for (var i in newInput.inputs) {
                                inputs.push(new unop_expr(this.btm, '-',newInput.inputs[i]));
                            }
                        } else {
                            inputs.push(new unop_expr(this.btm, '-',inB));
                        }
                    } else {
                        inputs.push(inB);
                    }
                }
                retVal = new multiop_expr(this.btm, '+', inputs);
                break;
            case '*':
            case '/':
                var inputs = [];
                if ((inA.type == exprType.multiop || inA.type == exprType.binop)
                    && (inA.op == '*' || inA.op == '/')) 
                {
                    var newInput = inA.flatten();
                    for (var i in newInput.inputs) {
                        inputs.push(newInput.inputs[i]);
                    }
                } else {
                    inputs.push(inA);
                }
                if ((inB.type == exprType.multiop || inB.type == exprType.binop)
                    && (inB.op == '*' || inB.op == '/'))
                {
                    var newInput = inB.flatten();
                    for (var i in newInput.inputs) {
                        inputs.push(newInput.inputs[i]);
                    }
                } else {
                    if (this.op == '/') {
                        if ((inB.type == exprType.multiop || inB.type == exprType.binop)
                            && (inB.op == '*' || inB.op == '/')) 
                        {
                            var newInput = inB.flatten();
                            for (var i in newInput.inputs) {
                                inputs.push(new unop_expr(this.btm, '/',newInput.inputs[i]));
                            }
                        } else {
                            inputs.push(new unop_expr(this.btm, '/',inB));
                        }
                    } else {
                        inputs.push(inB);
                    }
                }
                retVal = new multiop_expr(this.btm, '*', inputs);
                break;
            default:
                retVal = new binop_expr(this.btm, this.op, inA, inB);
        }
        return(retVal);
    }

    copy() {
      var inA = this.inputs[0].copy();
      var inB = this.inputs[1].copy();
      return (new binop_expr(this.btm, this.op, inA, inB));
    }

    compose(bindings) {
        var inA = this.inputs[0].compose(bindings);
        var inB = this.inputs[1].compose(bindings);

        var retVal;
        retVal = new binop_expr(this.btm, this.op, inA, inB);
        if (inA.type == exprType.number && inB.type == exprType.number) {
            switch (this.op) {
                case '+':
                    retVal = new scalar_expr(this.btm, inA.number.add(inB.number));
                    break;
                case '-':
                    retVal = new scalar_expr(this.btm, inA.number.subtract(inB.number));
                    break;
                case '*':
                    retVal = new scalar_expr(this.btm, inA.number.multiply(inB.number));
                    break;
                case '/':
                    retVal = new scalar_expr(this.btm, inA.number.divide(inB.number));
                    break;
            }
        }
        return(retVal);
    }

    derivative(ivar, varList) {
        var uConst = this.inputs[0].isConstant();
        var vConst = this.inputs[1].isConstant();

        var theDeriv;
        if (uConst && vConst) {
            theDeriv = new scalar_expr(this.btm, 0);
        } else {
            var dudx, dvdx;

            if (uConst) {
                dudx = new scalar_expr(this.btm, 0);
            } else {
                dudx = this.inputs[0].derivative(ivar, varList);
            }
            if (vConst) {
                dvdx = new scalar_expr(this.btm, 0);
            } else {
                dvdx = this.inputs[1].derivative(ivar, varList);
            }
            switch (this.op) {
                case '+':
                    theDeriv = new binop_expr(this.btm, '+', dudx, dvdx);
                    break;
                case '-':
                    theDeriv = new binop_expr(this.btm, '-', dudx, dvdx);
                    break;
                case '*':
                    var udv = new binop_expr(this.btm, '*', this.inputs[0], dvdx)
                    var vdu = new binop_expr(this.btm, '*', dudx, this.inputs[1])
                    if (uConst) {
                        theDeriv = udv;
                    } else if (vConst) {
                        theDeriv = vdu;
                    } else {
                        theDeriv = new binop_expr(this.btm, '+', vdu, udv);
                    }
                    break;
                case '/':
                    if (vConst) {
                        theDeriv = new binop_expr(this.btm, '/', dudx, this.inputs[1]);
                    } else if (uConst) {
                        var numer = new unop_expr(this.btm, '-', new binop_expr(this.btm, '*', this.inputs[0], dvdx));
                        var denom = new binop_expr(this.btm, '^', this.inputs[1], new scalar_expr(this.btm, 2));
                        theDeriv = new binop_expr(this.btm, '/', numer, denom);
                    } else {
                        var udv = new binop_expr(this.btm, '*', this.inputs[0], dvdx)
                        var vdu = new binop_expr(this.btm, '*', dudx, this.inputs[1])
                        var numer = new binop_expr(this.btm, '-', vdu, udv);
                        var denom = new binop_expr(this.btm, '^', this.inputs[1], new scalar_expr(this.btm, 2));
                        theDeriv = new binop_expr(this.btm, '/', numer, denom);
                    }
                    break;
                case '^':
                    var powDep = this.inputs[1].dependencies();
                    var ivarName = (typeof ivar == 'string') ? ivar : ivar.name;
                    // See if the power depends on the variable
                    if (powDep.length > 0 && powDep.indexOf(ivarName) >= 0) {
                        var theArg = new binop_expr(this.btm, '*', this.inputs[1], new function_expr(this.btm, 'log', this.inputs[0]));
                        var theFcn = new function_expr(this.btm, 'exp', theArg);
                        theDeriv = theFcn.derivative(ivar, varList);
                    // Otherwise this is a simple application of the power rule
                    } else if (!uConst) {
                        var newPow = new binop_expr(this.btm, '-', this.inputs[1], new scalar_expr(this.btm, 1));
                        var dydu = new binop_expr(this.btm, '*', this.inputs[1], new binop_expr(this.btm, '^', this.inputs[0], newPow));
                        if (this.inputs[0].type == exprType.variable
                                && this.inputs[0].name == ivarName) {
                            theDeriv = dydu;
                        } else {
                            var dudx = this.inputs[0].derivative(ivar, varList);
                            theDeriv = new binop_expr(this.btm, '*', dydu, dudx);
                        }
                    } else {
                        theDeriv = new scalar_expr(this.btm, 0);
                    }
                    break;
                default:
                    console.log("The binary operator '" + this.op + "' is not defined.");
                    theDeriv = undefined;
                    break;
            }
        }
        return(theDeriv);
    }
}
