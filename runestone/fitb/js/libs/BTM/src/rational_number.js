/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

/* *******************************
** Define a class to work with rational numbers
******************************* */

import { real_number } from "./real_number.js";

/* Private utility commands. */
  
function isInt(x) {
    var retValue = false;
    if (Number.isInteger === undefined) {
    retValue = (x == Math.floor(x));
    } else {
    retValue = Number.isInteger(x);
    }
    return retValue;
}


 // Implement Euclid's algorithm.
 export function findGCD(a,b) {
    var c;
    a = Math.abs(a);
    b = Math.abs(b);
    if (a < b) {
        c=a; a=b; b=c;
    }

    if (b == 0)
        return 0;

    // In this loop, we always have a > b.
    while (b > 0) {
        c = a % b;
        a = b;
        b = c;
    }
    return a;
}

export class rational_number extends real_number {
    constructor(p,q) {
        if (q == undefined) {
            super(p);
            this.p = p;
            this.q = 1;
        } else {
            super(p/q);
            if (q == 0) {
                this.p = Math.sqrt(-1);
                this.q = 1;
            } else if (p == 0) {
                this.p = 0;
                this.q = 1;
            } else {
                if (q < 0) {
                  this.p = -p;
                  this.q = -q;
                } else {
                  this.p = p;
                  this.q = q;
                }
                this.simplify();
            }
        }
    }

    // Return a numerical value of the rational expression.
    value() {
        return (this.p/this.q);
    }
    
    // Use Euclid's algorithm to find the gcd, then reduce
    simplify() {
        var a;

        // Don't simplify if not ratio of integers.
        if (this.p % 1 != 0 || this.q % 1 != 0) {
        return;
        }
        a = findGCD(this.p, this.q);
        this.p /= a;
        this.q /= a;
    }

    equal(other) {
        if (other.constructor.name != "rational_number") {
          return (this.value()==other.value());
        } else {
          return (this.p.valueOf()==other.p.valueOf()
                    && this.q.valueOf() == other.q.valueOf());
        }
    }

    // Add to this rational another rational number and create new object.
    add(other) {
        var sum;
        if (other instanceof rational_number) {
        sum = new rational_number(this.p*other.q+other.p*this.q, this.q*other.q);
        } else if (isInt(other)) {
        sum = new rational_number(this.p+other*this.q, this.q);
        } else {
        sum = new real_number(this.value() + other);
        }
        return(sum);
    }

    // Subtract from this rational another rational number and create new object.
    subtract(other) {
        var sum;
        if (other instanceof rational_number) {
            sum = new rational_number(this.p*other.q-other.p*this.q, this.q*other.q);
        } else if (isInt(other)) {
            sum = new rational_number(this.p-other*this.q, this.q);
        } else {
            sum = new real_number(this.value() - other);
        }
        return(sum);
    }

    // Multiply this rational by another rational number and create new object.
    multiply(other) {
        var product;
        if (other instanceof rational_number) {
            product = new rational_number(this.p*other.p, this.q*other.q);
        } else if (isInt(other)) {
            product = new rational_number(this.p*other, this.q);
        } else {
            product = new real_number(this.value() * other);
        }

        return(product);
    }

    // Divide this rational by another rational number and create new object.
    divide(other) {
        var product;
        if (other instanceof rational_number) {
            product = new rational_number(this.p*other.q, this.q*other.p);
        } else if (isInt(other)) {
            product = new rational_number(this.p, this.q*other);
        } else {
            product = new real_number(this.value() / other);
        }

        return(product);
    }

    // Additive Inverse
    addInverse() {
        var inverse = new rational_number(-this.p, this.q);
        return(inverse);
    }

    // Multiplicative Inverse
    multInverse() {
        var inverse;
        if (this.p != 0) {
            inverse = new rational_number(this.q, this.p);
        } else {
            inverse = new real_number(NaN);
        }
        return(inverse);
    }

    // Format the rational number as string.
    toString(leadSign) {
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
        var str = (leadSign && this.p>0) ? '+' : '';
        if (isNaN(this.p)) {
            str = 'NaN';
        } else if (this.q == 1) {
            str = str + this.p;
        } else {
            str = str + this.p + '/' + this.q;
        }

        return(str);
    }

    // Format the rational number as TeX string.
    toTeX(leadSign) {
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
        var str = (leadSign && this.p>0) ? '+' : '';
        if (isNaN(this.p)) {
            str = '\\mathrm{NaN}';
        } else if (this.q == 1) {
            str = str + this.p;
        } else {
            if (this.p < 0) {
                str = '-\\frac{' + -this.p + '}{' + this.q + '}';
            } else {
                str = str + '\\frac{' + this.p + '}{' + this.q + '}';
            }
        }

        return(str);
    }

    toMathML() {
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
        var opAStr = "<cn>" + this.p + "</cn>",
            opBStr = "<cn>" + this.q + "</cn>";

        return("<cn>" + this.toString() + "</cn>");

        if (isNaN(this.p)) {
            str = "<cn>?</cn>";
        } else if (this.q == 1) {
            str = opAStr;
        } else {
            str = "<apply><divide/>"+opAStr+opBStr+"</apply>";
        }
    }
}





 



