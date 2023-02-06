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
* Define the Derivative of an Expression
* *************************************************** */

import { expression } from "./expression.js"
import { variable_expr } from "./variable_expr.js"
import { exprType } from "./BTM_root.js"

export class deriv_expr extends expression {
    constructor(btm, formula, variable, atValue) {
        super(btm);
        this.type = exprType.operator;
        this.op = "D";
        if (typeof formula == 'undefined')
            formula = new expression(this.btm);
        if (typeof variable == 'undefined') {
            variable = new variable_expr(this.btm, 'x');
        } else if (typeof variable == 'string') {
            variable = new variable_expr(this.btm, variable);
        }
        this.ivar = variable;
        this.ivarValue = atValue;
        this.inputs = [formula];
        this.isRate = false;
        formula.parent = this;
    }

    toString() {
        var theStr;
        var exprStr, varStr, valStr;

        varStr = this.ivar.toString();
        exprStr = this.inputs[0].toString();
        if (typeof this.ivarValue != 'undefined') {
            valStr = this.ivarValue.toString();
            theStr = "D("+exprStr+","+varStr+","+valStr+")";
        } else {
            theStr = "D("+exprStr+","+varStr+")";
        }
        return(theStr);
    }

    toTeX(showSelect) {
        var theStr;
        var opStr, varStr, exprStr, valStr;

        varStr = this.ivar.toTeX();
        exprStr = this.inputs[0].toTeX();
        if (this.isRate && this.inputs[0].type == exprType.variable) {
            if (typeof this.ivarValue != 'undefined') {
                valStr = this.ivarValue.toTeX();
                theStr = "\\left. \\frac{d" + exprStr + "}{d"+varStr+"} \\right|_{"
                    + varStr + "=" + valStr + "}";
            } else {
                theStr = "\\frac{d" + exprStr +"}{d"+varStr+"}";
            }
        } else {
            if (typeof this.ivarValue != 'undefined') {
                valStr = this.ivarValue.toTeX();
                opStr = "\\left. \\frac{d}{d"+varStr+"} \\right|_{"
                    + varStr + "=" + valStr + "}";
            } else {
                opStr = "\\frac{d}{d"+varStr+"}";
            }
            theStr = opStr + "\\Big[" + exprStr + "\\Big]";
        }
        return(theStr);
    }

    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        var allInputs = this.inputs[0].allStringEquivs();
        var varStr, valStr;
        var retValue = [];

        varStr = this.ivar.toString();
        if (typeof this.ivarValue != 'undefined') {
            valStr = this.ivarValue.toString();
        }
        for (var i in allInputs) {
            if (typeof this.ivarValue != 'undefined') {
                retValue[i] = "D("+allInputs[i]+","+varStr+","+valStr+")";
            } else {
                retValue[i] = "D("+allInputs[i]+","+varStr+")";
            }
        }

        return(allInputs);
    }

    toMathML() {
        var theStr;
        var exprStr;

        if (typeof this.inputs[0] == 'undefined') {
            exprStr = '?';
        } else {
            exprStr = this.inputs[0].toMathML();
        }
        theStr = "<apply><derivative/>" + exprStr + "</apply>";

        return(theStr);
    }

    evaluate(bindings) {
        var retVal;
        var derivExpr;
        var dbind = {};

        if (typeof this.ivarValue != 'undefined') {
            dbind[this.ivar.name] = this.ivarValue;
        }
        // Compute the derivative of the expression, then evaluate at binding
        derivExpr = this.inputs[0].derivative(this.ivar, bindings);
        derivExpr = derivExpr.compose(dbind);
        retVal = derivExpr.evaluate(bindings);
        return(retVal);
    }

    simplifyConstants() {
        return(this);
    }

    flatten() {
      return (new deriv_expr(this.btm, this.inputs[0].flatten(), this.ivar, this.ivarValue));
    }

    copy() {
      return (new deriv_expr(this.btm, this.inputs[0].copy(), this.ivar, this.ivarValue));
    }


    compose(bindings) {
    }

    derivative(ivar, varList) {
        var dbind = {};

        if (typeof this.ivarValue != 'undefined') {
            dbind[this.ivar] = this.ivarValue;
        }
        // Evaluate the main expression using original binding
        var firstDeriv = this.inputs[0].derivative(this.ivar, varList);
        firstDeriv.compose(dbind);

        // Now differentiate that expression using new binding.
        return firstDeriv.derivative(ivar, varList);
    }
}
