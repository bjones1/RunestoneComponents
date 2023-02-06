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
* Define the Unary Expression -- defined by an operator and an input.
* *************************************************** */

import { expression } from "./expression.js"
import { scalar_expr } from "./scalar_expr.js"
import { binop_expr } from "./binop_expr.js"
import { exprType, opPrec } from "./BTM_root.js"

export class unop_expr extends expression {
    constructor(btm, op, input) {
        super(btm);
        this.type = exprType.unop;
        this.op = op;
        if (typeof input == 'undefined')
            input = new expression();
        this.inputs = [input];
            input.parent = this;
        switch (op) {
            case '+':
                this.prec = opPrec.multdiv;
                break;
            case '-':
                this.prec = opPrec.multdiv;
                break;
            case '/':
                this.prec = opPrec.power;
                break;
            default:
                alert("Unknown unary operator: '"+op+"'.");
                break;
        }
    }

    toString() {
        var theStr;
        var opStr;

        if (typeof this.inputs[0] == 'undefined') {
            opStr = '?';
        } else {
            opStr = this.inputs[0].toString();
        }
        if ((this.inputs[0].type >= exprType.unop
                && this.inputs[0].prec < this.prec)
            || (this.inputs[0].type == exprType.number
                && opStr.indexOf('/') >= 0
                && opPrec.multdiv <= this.prec)
            ) 
        {
            theStr = this.op + '(' + opStr + ')';
        } else {
            theStr = this.op + opStr;
        }

        return(theStr);
    }

    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        var allInputs = this.inputs[0].allStringEquivs();
        var retValue = [];

        for (var i in allInputs) {
            if (this.inputs[0].type >= exprType.unop && this.inputs[0].prec <= this.prec) {
                retValue[i] = this.op + '(' + allInputs[i] + ')';
            } else {
                retValue[i] = this.op + allInputs[i];
            }
        }

        return(retValue);
    }

    toTeX(showSelect) {
        var theStr;
        var opStr, theOp;

        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }

        if (typeof this.inputs[0] == 'undefined') {
            opStr = '?';
        } else {
            opStr = this.inputs[0].toTeX(showSelect);
        }

        theOp = this.op;
        if (theOp == '/') {
            theOp = '\\div ';
            if (showSelect && this.select) {
                theStr = "{\\color{red}" + this.op + "}"
                                + '\\left({\\color{blue}' + opStr + '}\\right)';
            } else {
                theStr = '\\frac{1}{' + opStr + '}';
            }
        } else {
            if (showSelect && this.select) {
                theStr = "{\\color{red}" + this.op + "}"
                                + '\\left({\\color{blue}' + opStr + '}\\right)';
            } else if (this.inputs[0].type >= exprType.unop && this.inputs[0].prec <= this.prec
                && (this.inputs[0].type != exprType.unop || this.op != '-' || this.inputs[0].op != '/')) {
                theStr = theOp + '\\left(' + opStr + '\\right)';
            } else {
                theStr = theOp + opStr;
            }
        }
        return(theStr);
    }

    toMathML() {
        var theStr;
        var opStr;

        if (typeof this.inputs[0] == 'undefined') {
            opStr = '?';
        } else {
            opStr = this.inputs[0].toMathML();
        }
        switch (this.op) {
            case '+':
                theStr = opStr;
                break;
            case '-':
                theStr = "<apply><minus/>" + opStr + "</apply>";
                break;
            case '/':
                theStr = "<apply><divide/><cn>1</cn>" + opStr + "</apply>";
                break;
        }

        return(theStr);
    }

    operateToTeX() {
        var opString = this.op;

        if (opString === '/') {
            opString = '\\div';
        }

        return(opString);
    }

    evaluate(bindings) {
        var inputVal = this.inputs[0].evaluate(bindings);

        var retVal;
        if (inputVal == undefined) {
            return(undefined);
        }
        switch (this.op) {
            case '+':
                retVal = inputVal;
                break;
            case '-':
                retVal = -1*inputVal;
                break;
            case '/':
                // Even when divide by zero, we want to use this, since in the exception
                // we want the value to be Infinite and not undefined.
                retVal = 1/inputVal;
                break;
            default:
                alert("The unary operator '" + this.op + "' is not defined.");
                retVal = undefined;
                break;
        }
        return(retVal);
    }

    simplifyConstants() {
        var retVal;

        this.inputs[0] = this.inputs[0].simplifyConstants();
        this.inputs[0].parent = this;
        if (this.inputs[0].type == exprType.number) {
            var theNumber = this.inputs[0].number;
            switch (this.op) {
                case '-':
                    if (options.negativeNumbers) {
                    retVal = new scalar_expr(this.btm, theNumber.addInverse());
                    } else {
                    retVal = this;
                    }
                    break;
                case '/':
                    retVal = new scalar_expr(this.btm, theNumber.multInverse());
                    break;
            }
        } else {
            retVal = this;
        }
        return(retVal);
    }

    flatten() {
      return(new unop_expr(this.btm, this.op, this.inputs[0].flatten()));
    }

    copy() {
      return(new unop_expr(this.btm, this.op, this.inputs[0].copy()));
    }

    compose(bindings) {
        return(new unop_expr(this.btm, this.op, this.inputs[0].compose(bindings)));
    }

    derivative(ivar, varList) {
        var theDeriv;

        var uConst = this.inputs[0].isConstant();
        if (uConst) {
            theDeriv = new scalar_expr(this.btm, 0);
        } else {
            switch (this.op) {
                case '+':
                    theDeriv = this.inputs[0].derivative(ivar, varList);
                    break;
                case '-':
                    theDeriv = new unop_expr(this.btm, '-', this.inputs[0].derivative(ivar, varList));
                    break;
                case '/':
                    var denom = new binop_expr(this.btm, '*', this.inputs[0], this.inputs[0]);
                    theDeriv = new unop_expr(this.btm, '-', new binop_expr(this.btm, '/', this.inputs[0].derivative(ivar, varList), denom));
                    break;
                default:
                    console.log("The derivative of the unary operator '" + this.op + "' is not defined.");
                    theDeriv = undefined;
                    break;
            }
        }
        return(theDeriv);
    }

    match(expr, bindings) {
        var retValue = null;

        // Special named constants can not match expressions.
        if (this.isConstant() && expr.isConstant()) {
            var newExpr = expr.simplifyConstants(),
                newThis = this.simplifyConstants();

            if (newExpr.toString() === newThis.toString()
                || newExpr.type == exprType.number && newThis.type == exprType.number
                    && newThis.number.equal(newExpr.number)) {
                retValue = bindings;
            }
        } else {
            retValue = expression.prototype.match.call(this, expr, bindings);
        }

        return(retValue);
    }
}
