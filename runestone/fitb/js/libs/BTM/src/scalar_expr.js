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
* Define the Scalar Expression -- a numerical value
* *************************************************** */

import { expression } from "./expression.js"
import { real_number } from "./real_number.js"
import { rational_number } from "./rational_number.js"
import { exprType } from "./BTM_root.js"

export class scalar_expr extends expression {
    constructor(btm, number) {
        super(btm);
        this.type = exprType.number;
        if (typeof number == "object" &&
            (number.constructor.name === "rational_number"
              ||
             number.constructor.name === "real_number")
            )
        {
            this.number = number;
        } else if (Math.floor(number)==number) {
            this.number = new rational_number(number, 1);
        } else {
            this.number = new real_number(number);
        }
        this.context = "number";
    }

    // Parsed representation.
    toString(elementOnly) {
        if (typeof elementOnly == 'undefined') {
            elementOnly = false;
        }
        return(this.number.toString());
    }
    
    // Display representation.
    toTeX(showSelect) {
        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }
        var word = this.number.toTeX();
        if (showSelect && this.select) {
            word = "{\\color{red}" + word + "}";
        }
        return(word);
    }
    
    // MathML representation.
    toMathML() {
        return("<cn>" + this.toString() + "</cn>");
    }
    
    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        return([this.toString()]);
    }
    
    // Test if represents constant value.
    isConstant() {
        /*
        This could just use expression.prototype.constant, but use this
        because it ALWAYS is true for scalar_expr and does not need a check
        */
        return(true);
    }
    
    // Combine constants where possible
    simplifyConstants() {
        var retValue;
        if (!this.btm.options.negativeNumbers && this.number.p < 0) {
            var theNumber = this.number.multiply(-1);
            retValue = new unop_expr(this.btm, '-', new scalar_expr(this.btm, theNumber));
        } else {
            retValue = this;
        }
        return(retValue);
    }
    
    value() {
        return(this.number.value());
    }

    evaluate(bindings) {
        return(this.value());
    }
    
    copy() {
        return(new scalar_expr(this.btm, this.number));
    }
    
    compose(bindings) {
        return(new scalar_expr(this.btm, this.number));
    }
    
    derivative(ivar, varList) {
        return(new scalar_expr(this.btm, 0));
    }
    
    /*
        See expressions.prototype.match for explanation.
    
        A scalar might match a constant formula.
    */
    match(expr, bindings) {
        var retValue = null,
            testExpr = expr;
    
        // Special named constants can not match expressions.
        if (expr.isConstant() && expr.type != exprType.number) {
            var testExpr = this.btm.parse(expr.toString(), expr.context).simplifyConstants();
            if (this.toString() === testExpr.toString()) {
              retValue = bindings;
            }
        }
        else if (testExpr.type == exprType.number
                && this.number.equal(testExpr.number)) {
            retValue = bindings;
        }
    
        return(retValue);
    }    
}

