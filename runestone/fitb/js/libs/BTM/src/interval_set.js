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
** Define a class to work with sets using intervals and point sets
******************************* */

import { MathObject } from "./expression.js"
import { exprType, BTM } from "./BTM_root.js"
import { scalar_expr } from "./scalar_expr";

export class math_set extends MathObject {
}

export class real_interval extends math_set {
    constructor(btm, a, b, interval_type) {
        if (!(btm instanceof BTM)) {
            throw "real_interval constructed with invalid environment";
        }
        super(btm);
        if (typeof a === 'number' || a instanceof Number || 
            typeof a == "object" &&
            (a.constructor.name === "rational_number" || a.constructor.name === "real_number")
        )) {
            a = new scalar_expr(btm, a);
        }
        if (typeof b === 'number' || b instanceof Number || 
            typeof b == "object" &&
            (b.constructor.name === "rational_number" || b.constructor.name === "real_number")
        )) {
            b = new scalar_expr(btm, b);
        }
        this.min = a;
        this.max = b;
        this.interval_type = interval_type;
        this.isEmpty = true;
        if (a.value() < b.value() || a.value() == b.value() && interval_type === '[]') {
            this.isEmpty = false;
        } else {
            this.min = undefined;
            this.max = undefined;
        }
    }

    equal(other) {
      if (typeof other === 'number') {
        other = new real_number(other);
      }
        return (this.value()==other.value());
    }

    // Add numbers.
    add(other) {
      if (typeof other === 'number') {
        other = new real_number(other);
      }
        var sum = new real_number(this.number + other.value());
        return(sum);
    }

    // Subtract this - other
    subtract(other) {
      if (typeof other === 'number') {
        other = new real_number(other);
      }
        var sum = new real_number(this.number - other.value());
        return(sum);
    }

    // Multiply this rational by another rational number and create new object.
    multiply(other) {
      if (typeof other === 'number') {
        other = new real_number(other);
      }
        var product = new real_number(this.number * other.value());
        return(product);
    }

    // Divide this rational by another rational number and create new object.
    divide(other) {
      if (typeof other === 'number') {
        other = new real_number(other);
      }
        var product;
        if (other.value != 0) {
            product = new real_number(this.number / other.value());
        } else {
            product = new real_number(NaN);
        }
        return(product);
    }

    // Additive Inverse
    addInverse() {
        var inverse = new real_number(-this.number);
        return(inverse);
    }

    // Multiplicative Inverse
    multInverse() {
        var inverse;
        if (this.number != 0) {
            inverse = new real_number(this.number);
        } else {
            inverse = new real_number(NaN);
        }
        return(inverse);
    }

    toString(leadSign) {
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
        var str = (leadSign && this.number>0) ? '+' : '';
        if (isNaN(this.number)) {
            str = 'NaN';
        } else {
            str = str + Number(this.number.toFixed(10));
        }
  
        return(str);
    }
  
    // Format the rational number as TeX string.
    toTeX(leadSign) {
        if (typeof leadSign == 'undefined') {
            leadSign = false;
        }
        var str = (leadSign && this.number>0) ? '+' : '';
        if (isNaN(this.number)) {
            str = '\\mathrm{NaN}';
        } else {
            str = str + Number(this.toString(leadSign));
        }
        return(str);
    }

    // Format as a root MathML element.
    toMathML(leadSign) {
        return("<cn>" + this.toString() + "</cn>");
    }
}





 



