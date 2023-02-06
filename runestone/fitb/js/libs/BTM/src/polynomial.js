/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

/* ****************************************************
   *    A class for dealing with polynomials with rational coefficients
   *    in a convenient way.
   * **************************************************** */

import rational_number from "./rational_number.js";


class monomial {
    constructor(coef, power) {
        this.coef = (coef instanceof rational_number) ? coef : new rational_number(coef);
        this.power = (power instanceof rational_number) ? power : new rational_number(power);
    }

    toString(leadSign, showZero) {
        var str, coefValue, powerValue, powerString;
    
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
        if (typeof showZero == 'undefined') {
            showZero = false;
        }
        coefValue = this.coef.value();
    
        if (coefValue == 0) {
            if (showZero) {
                str = "0";
            } else {
                str = "";
            }
        } else {
            powerValue = this.power.value();
    
            if (powerValue != 0 && coefValue == 1) {
                str = leadSign ? '+' : '';
            } else if (powerValue != 0 && coefValue == -1) {
                str = '-';
            } else {
                str = this.coef.toString(leadSign);
            }
    
            powerString = this.power.toString();
            if (powerValue != 0) {
                str = str + 'x' + ((powerValue == 1) ? '' : ('^(' + powerString + ')'));
            }
        }
        return(str);
    }
    
    toPosPowerString(leadSign) {
        var str, powerValue, powerString;
    
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
    
        powerValue = this.power.value();
        if (powerValue < 0) {
            var denom, denomStr;
            denom = new monomial(this.coef.q, this.power.multiply(-1));
            denomStr = denom.toString();
            str = (leadSign && this.coef.p >= 0 ? '+' : '') + this.coef.p + '/(' + denomStr + ')';
        } else {
            str = this.toString();
        }
        return(str);
    }
    
    toTeX(leadSign) {
        var str, coefValue, powerValue, powerString;
    
        if (leadSign == undefined) {
            leadSign = false;
        }
        coefValue = this.coef.value();
        powerValue = this.power.value();
    
        if (powerValue != 0 && coefValue == 1) {
            str = leadSign ? '+' : '';
        } else if (powerValue != 0 && coefValue == -1) {
            str = '-';
        } else {
            str = this.coef.toTeX(leadSign);
        }
    
        powerString = this.power.toString();
        if (powerValue != 0) {
            str = str + 'x' + ((powerValue == 1) ? '' : ('^{' + powerString + '}'));
        }
    
        return(str);
    }
    
    toPosPowerTeX(leadSign) {
        var str, powerValue, powerString;
    
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
    
        powerValue = this.power.value();
        if (powerValue < 0) {
            var denom, denomStr;
            denom = new monomial(this.coef.q, this.power.multiply(-1));
            denomStr = denom.toTeX();
            str = ((this.coef.p < 0) ? '-' : (leadSign ? '+' : ''))
                + '\\frac{' + this.coef.p + '}{' + denomStr + '}';
        } else {
            str = this.toString();
        }
        return(str);
    }    
}



export function polyTeX(coefs) {
    var n = coefs.length;
    var i,p = n-1;
    var term = new monomial(coefs[0], p);
    var str = term.toTeX(false);
    for (i=1; i<n; i++) {
        term = new monomial(coefs[i], p-i);
        str = str + term.toTeX(true);
    }
    return(str);
}

export function polyString(coefs) {
    var n = coefs.length;
    var i,p = n-1;
    var term = new monomial(coefs[0], p);
    var str = term.toString(false);
    for (i=1; i<n; i++) {
        term = new monomial(coefs[i], p-i);
        str = str + term.toString(true);
    }
    return(str);
}
