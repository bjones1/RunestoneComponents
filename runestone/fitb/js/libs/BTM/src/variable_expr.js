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
* Define the Variable Expression -- a value defined by a name
* *************************************************** */
import { expression } from "./expression.js"
import { scalar_expr } from "./scalar_expr.js"
import { exprType, exprValue } from "./BTM_root.js"

export class variable_expr extends expression {
    constructor(btm, name) {
        super(btm);
        this.type = exprType.variable;
        this.name = name;

        // Count how many derivatives.
        var primePos = name.indexOf("'");
        this.derivs = 0;
        if (primePos > 0) {
            this.derivs = name.slice(primePos).length;
        }

        this.isConst = false;
        this.isSpecial = false;
        switch(this.name) {
            case 'e':
            case 'pi':
            case 'dne':
            case 'inf':
                this.isConst = true;
                this.isSpecial = true;
                break;
        }
    }

    toString(elementOnly) {
        if (typeof elementOnly == 'undefined') {
            elementOnly = false;
        }
        return(this.name);
    }

    // Return an array containing all tested equivalent strings.
    allStringEquivs() {
        return([this.toString()]);
    }

    toTeX(showSelect) {
        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }
        var str = this.toString();

        switch (this.name) {
            case 'alpha':
            case 'beta':
            case 'gamma':
            case 'delta':
            case 'epsilon':
            case 'zeta':
            case 'eta':
            case 'theta':
            case 'kappa':
            case 'lambda':
            case 'mu':
            case 'nu':
            case 'xi':
            case 'pi':
            case 'rho':
            case 'sigma':
            case 'tau':
            case 'upsilon':
            case 'phi':
            case 'chi':
            case 'psi':
            case 'omega':
            case 'Gamma':
            case 'Delta':
            case 'Theta':
            case 'Lambda':
            case 'Xi':
            case 'Pi':
            case 'Sigma':
            case 'Upsilon':
            case 'Phi':
            case 'Psi':
            case 'Omega':
                str = '\\' + this.name;
                break;
            case 'inf':
                str = '\\infty';
                break;
            default:
                if (this.isSpecial) {
                    str = '\\mathrm{' + this.name + '}';
                }
                break;
        }
        if (this.name.indexOf("input")==0) {
            str = "\\boxed{\\dots?^{" + this.name.slice(5) + "}}";
        }

        if (showSelect && this.select) {
            str = "{\\color{red}" + str + "}";
        }
        return(str);
    }

    dependencies(forced) {
        var depArray = new Array();
        if (forced != undefined) {
            for (var i=0; i<forced.length; i++) {
                depArray.push(forced[i]);
            }
        }
        if (!this.isConst && depArray.indexOf(this.name) < 0) {
            depArray.push(this.name);
        }
        return(depArray);
    }

    /*
        A variable is constant only if referring to mathematical constants (e, pi)
    */
    isConstant() {
        return(this.isConst);
    }

    evaluate(bindings) {
        var retVal;

        if (bindings[this.name] == undefined) {
            switch(this.name) {
                case 'e':
                    retVal = Math.E;
                    break;
                case 'pi':
                    retVal = Math.PI;
                    break;
                case 'inf':
                    retVal = Infinity;
                    break;
                case 'dne':
                    retVal = Number.NaN;
                    break;
                default:
                    console.log("Variable evaluated without binding.")
                    break;
            }
        } else {
            retVal = bindings[this.name];
        }

        return(retVal);
    }

    copy() {
        return(new variable_expr(this.btm, this.name));
    }

    compose(bindings) {
        var retVal;

        if (bindings[this.name] == undefined) {
            retVal = new variable_expr(this.btm, this.name);
        } else {
            if (typeof bindings[this.name] == "string") {
                retVal = this.btm.parse(bindings[this.name], "formula");
            } else {
                retVal = bindings[this.name];
            }
        }

        return(retVal);
    }

    derivative(ivar, varList) {
        var retVal;
        var ivarName = (typeof ivar == 'string') ? ivar : ivar.name;

        if (this.name === ivarName) {
            retVal = new scalar_expr(this.btm, 1);

        // If either a constant or another independent variable, deriv=0
        } else if (this.isConst || varList && varList[this.name] != undefined) {
            retVal = new scalar_expr(this.btm, 0);

        // Presuming other variables are dependent variables.
        } else  {
            retVal = new variable_expr(this.btm, this.name+"'");
        }
        return(retVal);
    }

    /*
        See expressions.prototype.match for explanation.

        A variable can match any expression. But we need to check
        if the variable has already matched an expression. If so,
        it must be the same again.
    */
    match(expr, bindings) {
        var retValue = null;

        // Special named constants can not match expressions.
        if (this.isConst) {
            if (expr.toString() === this.name) {
                retValue = bindings;
            }

        // If never previously assigned, can match any expression.
        } else if (bindings != null && bindings[this.name] == undefined && expr.valueType == exprValue.numeric) {
            retValue = bindings;
            retValue[this.name] = expr.toString();
        } else if (bindings != null && bindings[this.name] == expr.toString()) {
            retValue = bindings;
        }

        return(retValue);
    }
}

    /* ***************************************************
    * Define the Index Expression -- a reference into a list
    * *************************************************** */

export class index_expr {
    
    constructor(btm, name, index) {
        this.btm = btm;
        if (!(btm instanceof BTM)) {
            console.log("variable_expr constructed with invalid environment")
        }
        this.type = exprType.variable;
        this.name = name;
        this.select = false;
        this.boundName = "[]"+name;
        this.parent = null;
        this.index = index;
        var depArray = index.dependencies();
        if (depArray.length > 1) {
            alert("An array reference can only have one index variable.");
        } else {
            this.k = depArray[0];
        }
    }

    toString(elementOnly) {
        if (typeof elementOnly == 'undefined') {
            elementOnly = false;
        }
        return(this.name + "[" + this.index.toString() + "]");
    }

    toTeX(showSelect) {
        if (typeof showSelect == 'undefined') {
            showSelect = false;
        }
        word = this.name + "_{" + this.index.toString() + "}";
        if (showSelect && this.select) {
            word = "{\\color{red}" + word + "}";
        }
        return(word);
    }

    toMathML() {
        return("<apply><selector/><ci type=\"vector\">" + this.name + "</ci>" + this.index.toString() + "</apply>");
    }

    dependencies(forced) {
        var depArray = new Array();
        if (forced != undefined) {
            for (var i=0; i<forced.length; i++) {
                depArray.push(forced[i]);
            }
        }
        switch(this.name) {
            default:
                depArray.push("row");
                depArray.push(this.boundName);
                break;
        }
        return(depArray);
    }

    evaluate(bindings) {
        var retVal;

        if (bindings[this.boundName] == undefined) {
            switch(this.name) {
                default:
                    retVal = undefined;
                    break;
            }
        } else {
            var tmpBind = {};
            if (this.k != undefined) {
                tmpBind[this.k] = bindings["row"];
            }
            var i = this.index.evaluate(tmpBind)-1;
            if (i >= 0 && i<bindings[this.boundName].length) {
                retVal = bindings[this.boundName][i];
            }
        }

        return(retVal);
    }
}