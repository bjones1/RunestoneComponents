/*!
 * BTM JavaScript Library v@VERSION
 * https://github.com/dbrianwalton/BTM
 *
 * Copyright D. Brian Walton
 * Released under the MIT license (https://opensource.org/licenses/MIT)
 *
 * Date: @DATE
 */

import { BTM, exprType, exprValue } from "./BTM_root.js";
import { newRule, findMatchRules } from "./reductions.js";


var myBTM = new BTM('1357');
myBTM.setReductionRules();

/* The autoIdentityList set of rules is used for drag/drop of input elements */

var autoIdentityList = [];
var ruleCounter = 0;

newRule(myBTM, autoIdentityList, 'a+0==a', 'Additive Identity', true, true);
newRule(myBTM, autoIdentityList, '0+a==a', 'Additive Identity', true, true);
newRule(myBTM, autoIdentityList, 'a*1==a', 'Multiplicative Identity', true, true);
newRule(myBTM, autoIdentityList, '1*a==a', 'Multiplicative Identity', true, true);
newRule(myBTM, autoIdentityList, 'a*0==0', 'Multiply by Zero', true, true);
newRule(myBTM, autoIdentityList, '0*a==0', 'Multiply by Zero', true, true);
newRule(myBTM, autoIdentityList, 'a-a==0', 'Additive Inverses Cancel', true, true);
newRule(myBTM, autoIdentityList, 'a+-a==0', 'Additive Inverses Cancel', true, true);
newRule(myBTM, autoIdentityList, '-a+a==0', 'Additive Inverses Cancel', true, true);
newRule(myBTM, autoIdentityList, 'a/a==1', 'Multiplicative Inverses Cancel', true, true);
newRule(myBTM, autoIdentityList, 'a*/a==1', 'Multiplicative Inverses Cancel', true, true);
newRule(myBTM, autoIdentityList, '/a*a==1', 'Multiplicative Inverses Cancel', true, true);

// Inverse Operations.
newRule(myBTM, autoIdentityList, '-(a+b)==-a+-b', "Additive Inverse", true, true);
newRule(myBTM, autoIdentityList, '-(a-b)==b-a', "Additive Inverse", true, true);
newRule(myBTM, autoIdentityList, '-(-a)==a', "Additive Inverse's Inverse", true, true);
newRule(myBTM, autoIdentityList, '-a==-1*a', "Additive Inverse's Inverse", true);
newRule(myBTM, autoIdentityList, '/(/a)==a', "Multiplicative Inverse's Inverse", true, true);
newRule(myBTM, autoIdentityList, 'ln(exp(a))==a', 'Logarithm of Exponential', true, true);
newRule(myBTM, autoIdentityList, 'exp(ln(a))==a', 'Exponential of Logarithm', true, true);
newRule(myBTM, autoIdentityList, '(sqrt(a))^2==a', 'Square of a Square Root', true, true);
newRule(myBTM, autoIdentityList, 'sqrt(a)*sqrt(a)==a', 'Square of a Square Root', true, true);
newRule(myBTM, autoIdentityList, 'sqrt(a^2)==abs(a)', 'Square Root of a Square', true, true);

newRule(myBTM, autoIdentityList, '(/a)*(/b)==/(a*b)', 'Multiplicative Inverse', true);
newRule(myBTM, autoIdentityList, 'a*a==a^2', 'Definition of Square', true);

newRule(myBTM, autoIdentityList, 'a^b*a^c==a^(b+c)', 'Algebra of Powers', true);
newRule(myBTM, autoIdentityList, 'a^b/a^c==a^(b-c)', 'Algebra of Powers', true);
newRule(myBTM, autoIdentityList, 'a^b*/(a^c)==a^(b-c)', 'Algebra of Powers', true,true);
newRule(myBTM, autoIdentityList, '/a^b*a^c==a^(c-b)', 'Algebra of Powers', true,true);
newRule(myBTM, autoIdentityList, 'a*a^c==a^(c+1)', 'Algebra of Powers', true);
newRule(myBTM, autoIdentityList, 'a^c*a==a^(c+1)', 'Algebra of Powers', true,true);
newRule(myBTM, autoIdentityList, 'a^c/a==a^(c-1)', 'Algebra of Powers', true);
newRule(myBTM, autoIdentityList, '/a*a^c==a^(c-1)', 'Algebra of Powers', true,true);
newRule(myBTM, autoIdentityList, 'a^c*/a==a^(c-1)', 'Algebra of Powers', true,true);

newRule(myBTM, autoIdentityList, '(a*b)/(a*c)==b/c', 'Cancellation in Division', true,true);
newRule(myBTM, autoIdentityList, '(a*b)/(c*a)==b/c', 'Cancellation in Division', true,true);
newRule(myBTM, autoIdentityList, '(b*a)/(a*c)==b/c', 'Cancellation in Division', true,true);
newRule(myBTM, autoIdentityList, '(b*a)/(c*a)==b/c', 'Cancellation in Division', true,true);

newRule(myBTM, autoIdentityList, '(a/b)/c==a/(b*c)', 'Division', true,true);

newRule(myBTM, autoIdentityList, '(a+b)*(c+d)==a*c+a*d+b*c+b*d', 'FOIL', true);
newRule(myBTM, autoIdentityList, '(a-b)*(c+d)==a*c+a*d+-(b*c)+-(b*d)', 'FOIL', true);
newRule(myBTM, autoIdentityList, '(a-b)*(c-d)==a*c+-(a*d)+-(b*c)+b*d', 'FOIL', true);

newRule(myBTM, autoIdentityList, 'a*b+a*c==a*(b+c)', 'Common Factor', true);
newRule(myBTM, autoIdentityList, 'a*b+c*a==a*(b+c)', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, 'b*a+a*c==a*(b+c)', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, 'b*a+c*a==a*(b+c)', 'Common Factor', true,true);

newRule(myBTM, autoIdentityList, 'a*b-a*c==a*(b-c)', 'Common Factor', true);
newRule(myBTM, autoIdentityList, 'a*b-c*a==a*(b-c)', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, 'b*a-a*c==a*(b-c)', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, 'b*a-c*a==a*(b-c)', 'Common Factor', true,true);

newRule(myBTM, autoIdentityList, 'b*a+a==(b+1)*a', 'Common Factor', true);
newRule(myBTM, autoIdentityList, 'a*b+a==(b+1)*a', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, 'a+b*a==(b+1)*a', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, 'a+a*b==(b+1)*a', 'Common Factor', true,true);

newRule(myBTM, autoIdentityList, 'a*b-a==(b-1)*a', 'Common Factor', true);
newRule(myBTM, autoIdentityList, 'b*a-a==(b-1)*a', 'Common Factor', true,true);
newRule(myBTM, autoIdentityList, '-a+a*b==(b-1)*a', 'Common Factor', true, true);
newRule(myBTM, autoIdentityList, '-a+b*a==(b-1)*a', 'Common Factor', true, true);

// Function Identities.
newRule(myBTM, autoIdentityList, 'exp(a+b)==exp(a)*exp(b)', 'Exponential of Sum', true);
newRule(myBTM, autoIdentityList, 'exp(a-b)==exp(a)/exp(b)', 'Exponential of Difference', true);
newRule(myBTM, autoIdentityList, 'exp(a)^b==exp(a*b)', 'Exponential of Product', true, true);
newRule(myBTM, autoIdentityList, 'ln(a*b)==ln(a)+ln(b)', 'Logarithm of a Product', true);
newRule(myBTM, autoIdentityList, 'ln(/a)==-ln(a)', 'Logarithm of a Quotient', true);
newRule(myBTM, autoIdentityList, 'ln(a/b)==ln(a)-ln(b)', 'Logarithm of a Quotient', true);
newRule(myBTM, autoIdentityList, 'ln(a^b)==b*ln(a)', 'Logarithm of a Power', true);

newRule(myBTM, autoIdentityList, 'sin(a+b)==sin(a)*cos(b)+cos(a)*sin(b)', 'Sine of a Sum', true);
newRule(myBTM, autoIdentityList, 'sin(a-b)==sin(a)*cos(b)-cos(a)*sin(b)', 'Sine of a Difference', true);
newRule(myBTM, autoIdentityList, 'cos(a+b)==cos(a)*cos(b)-sin(a)*sin(b)', 'Cosine of a Sum', true);
newRule(myBTM, autoIdentityList, 'cos(a-b)==cos(a)*cos(b)+sin(a)*sin(b)', 'Cosine of a Difference', true);


/* The ruleList set of rules is used for the matched list that appears */

var ruleList = [];

newRule(myBTM, ruleList, 'a*b=0==a=0$b=0', 'Product is Zero', true);

newRule(myBTM, ruleList, 'a=b==a+c=b+c', 'Equivalent Equation', true);
newRule(myBTM, ruleList, 'a=b==a*c=b*c', 'Equivalent Equation', true);
newRule(myBTM, ruleList, 'a=b==exp(a)=exp(b)', 'Equivalent Equation', true);
newRule(myBTM, ruleList, 'a=b==ln(a)=ln(b)', 'Equivalent Equation', true);

newRule(myBTM, ruleList, 'a+0==a', 'Additive Identity', true, true);
newRule(myBTM, ruleList, '0+a==a', 'Additive Identity', true, true);
newRule(myBTM, ruleList, 'a-a==0', 'Additive Inverses Cancel', true, true);
newRule(myBTM, ruleList, 'a+-a==0', 'Additive Inverses Cancel', true, true);
newRule(myBTM, ruleList, '-a+a==0', 'Additive Inverses Cancel', true, true);

newRule(myBTM, ruleList, 'a*0==0', 'Multiply by Zero', true, true);
newRule(myBTM, ruleList, '0*a==0', 'Multiply by Zero', true, true);

newRule(myBTM, ruleList, 'a*1==a', 'Multiplicative Identity', true, true);
newRule(myBTM, ruleList, '1*a==a', 'Multiplicative Identity', true, true);
newRule(myBTM, ruleList, 'a/1==a', 'Multiplicative Identity', true, true);
newRule(myBTM, ruleList, '1/a==/a', 'Multiplicative Inverse', true);
newRule(myBTM, ruleList, 'a/a==1', 'Multiplicative Inverses Cancel', true, true);
newRule(myBTM, ruleList, 'a*/a==1', 'Multiplicative Inverses Cancel', true, true);
newRule(myBTM, ruleList, '/a*a==1', 'Multiplicative Inverses Cancel', true, true);

newRule(myBTM, ruleList, '(a*b)/(a*c)==b/c', 'Cancellation in Division', true,true);
newRule(myBTM, ruleList, '(a*b)/(c*a)==b/c', 'Cancellation in Division', true,true);
newRule(myBTM, ruleList, '(b*a)/(a*c)==b/c', 'Cancellation in Division', true,true);
newRule(myBTM, ruleList, '(b*a)/(c*a)==b/c', 'Cancellation in Division', true,true);

newRule(myBTM, ruleList, 'a*(b+c)==a*b+a*c', 'Distribution', true, true);
newRule(myBTM, ruleList, '(b+c)*a==a*b+a*c', 'Distribution', true, true);
newRule(myBTM, ruleList, 'a*(b-c)==a*b-a*c', 'Distribution', true, true);
newRule(myBTM, ruleList, '(b-c)*a==a*b-a*c', 'Distribution', true, true);

newRule(myBTM, ruleList, 'a*b+a*c==a*(b+c)', 'Common Factor', true, true);
newRule(myBTM, ruleList, 'a*b+c*a==a*(b+c)', 'Common Factor', true,true);
newRule(myBTM, ruleList, 'b*a+a*c==a*(b+c)', 'Common Factor', true,true);
newRule(myBTM, ruleList, 'b*a+c*a==a*(b+c)', 'Common Factor', true,true);

newRule(myBTM, ruleList, 'a*b-a*c==a*(b-c)', 'Common Factor', true);
newRule(myBTM, ruleList, 'a*b-c*a==a*(b-c)', 'Common Factor', true,true);
newRule(myBTM, ruleList, 'b*a-a*c==a*(b-c)', 'Common Factor', true,true);
newRule(myBTM, ruleList, 'b*a-c*a==a*(b-c)', 'Common Factor', true,true);

newRule(myBTM, ruleList, 'b*a+a==(b+1)*a', 'Common Factor', true);
newRule(myBTM, ruleList, 'a*b+a==(b+1)*a', 'Common Factor', true,true);
newRule(myBTM, ruleList, 'a+b*a==(b+1)*a', 'Common Factor', true,true);
newRule(myBTM, ruleList, 'a+a*b==(b+1)*a', 'Common Factor', true,true);

newRule(myBTM, ruleList, 'a*b-a==(b-1)*a', 'Common Factor', true);
newRule(myBTM, ruleList, 'b*a-a==(b-1)*a', 'Common Factor', true,true);
newRule(myBTM, ruleList, '-a+a*b==(b-1)*a', 'Common Factor', true, true);
newRule(myBTM, ruleList, '-a+b*a==(b-1)*a', 'Common Factor', true, true);

newRule(myBTM, ruleList, 'a+a==2*a', 'Common Factor', true, true);

newRule(myBTM, ruleList, '(a+b)/c==a/c+b/c', 'Distribution', true);

newRule(myBTM, ruleList, '(a+b)*(c+d)==a*c+a*d+b*c+b*d', 'FOIL', true);
newRule(myBTM, ruleList, '(a-b)*(c+d)==a*c+a*d-b*c-b*d', 'FOIL', true);
newRule(myBTM, ruleList, '(a-b)*(c-d)==a*c-a*d-b*c+b*d', 'FOIL', true);

newRule(myBTM, ruleList, '(a+b)^2==a^2+2*a*b+b^2', 'Expand Quadratic', true, true);
newRule(myBTM, ruleList, '(a+b)^3==a^3+3*a^2*b+3*a*b^2+b^3', 'Expand Cubic', true, true);
newRule(myBTM, ruleList, '(a+b)^4==a^4+4*a^3*b+6*a^2*b^2+4*a*b^3+b^4', 'Expand Quartic', true, true);

newRule(myBTM, ruleList, 'a-b==a+-b', "Additive Inverse", true);
newRule(myBTM, ruleList, '-(a+b)==-a+-b', "Additive Inverse", true);
newRule(myBTM, ruleList, '-(a-b)==b-a', "Additive Inverse", true);
newRule(myBTM, ruleList, '-(a-b)==-a+b', "Additive Inverse", true,true);
newRule(myBTM, ruleList, '-(-a)==a', "Additive Inverse's Inverse", true, true);
newRule(myBTM, ruleList, '-a*b==-(a*b)', "Additive Inverse", true);
newRule(myBTM, ruleList, 'a*-b==-(a*b)', "Additive Inverse", true, true);
newRule(myBTM, ruleList, 'a/b==a*/b', "Multiplicative Inverse", true);
newRule(myBTM, ruleList, '/b*a==a/b', "Multiplicative Inverse", true, true);
newRule(myBTM, ruleList, '/(/a)==a', "Multiplicative Inverse's Inverse", true, true);
newRule(myBTM, ruleList, '/(a*b)==(/a)*(/b)', "Multiplicative Inverse", true);

newRule(myBTM, ruleList, '(a/b)*(c/d)==(a*c)/(b*d)', 'Multiplication of Quotients', true);
newRule(myBTM, ruleList, 'a/(b*c)==(a/b)*(1/c)', 'Multiplication of Quotients', true);
newRule(myBTM, ruleList, '(1/c)*(a/b)==a/(b*c)', 'Multiplication of Quotients', true, true);
newRule(myBTM, ruleList, 'a/(b*c)==(1/b)*(a/c)', 'Multiplication of Quotients', true, true);
newRule(myBTM, ruleList, 'a*(b/c)==(a*b)/c', 'Multiplication of Quotients', true);
newRule(myBTM, ruleList, '(a/c)*b==(a*b)/c', 'Multiplication of Quotients', true);

newRule(myBTM, ruleList, '(a/b)/c==a/(b*c)', 'Multiplication of Quotients', true);

newRule(myBTM, ruleList, '(1/b)+(1/d)==(d+b)/(b*d)', 'Common Denominator', true);
newRule(myBTM, ruleList, '(a/b)+(c/d)==(a*d+b*c)/(b*d)', 'Common Denominator', true);
newRule(myBTM, ruleList, '(1/b)-(1/d)==(d-b)/(b*d)', 'Common Denominator', true);
newRule(myBTM, ruleList, '(a/b)-(c/d)==(a*d-b*c)/(b*d)', 'Common Denominator', true);

newRule(myBTM, ruleList, '-1*a==-a', 'Additive Inverse', true);

newRule(myBTM, ruleList, 'a^0==1', 'Algebra of Powers', true, true);
newRule(myBTM, ruleList, 'a^1==a', 'Algebra of Powers', true, true);
newRule(myBTM, ruleList, 'a^-1==/a', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'sqrt(a)^2==a', 'Square Root of a Square', true, true);
newRule(myBTM, ruleList, 'sqrt(a)*sqrt(a)==a', 'Square of a Square Root', true, true);
newRule(myBTM, ruleList, 'sqrt(a^2)==abs(a)', 'Square Root of a Square', true);
newRule(myBTM, ruleList, 'sqrt(a)==a^(1/2)', 'Square Root as Power', true);
newRule(myBTM, ruleList, 'sqrt(a*b)==sqrt(a)*sqrt(b)', 'Distribute Power over Multiplication', true);

// Powers
newRule(myBTM, ruleList, 'a^b*a^c==a^(b+c)', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a*a==a^2', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a^n==a*a^(n-1)', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a*a^n==a^(n+1)', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a^n*a==a^(n+1)', 'Algebra of Powers', true, true);

newRule(myBTM, ruleList, 'a^c*b^c==(a*b)^c', 'Algebra of Powers', true);
newRule(myBTM, ruleList, '/(a^b)==a^(-b)', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a^b==/(a^(-b))', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a^b/a^c==a^(b-c)', 'Algebra of Powers', true);
newRule(myBTM, ruleList, 'a^c/b^c==(a/b)^c', 'Algebra of Powers', true);
newRule(myBTM, ruleList, '(a^b)^c==a^(b*c)', 'Algebra of Powers', true);


// Functions
newRule(myBTM, ruleList, 'e^a==exp(a)', 'Exponential Definition', true);
newRule(myBTM, ruleList, 'exp(ln(a))==a', 'Exponential of Logarithm', true);
newRule(myBTM, ruleList, 'ln(exp(a))==a', 'Logarithm of Exponential', true);

newRule(myBTM, ruleList, 'exp(a+b)==exp(a)*exp(b)', 'Exponential of Sum', true);
newRule(myBTM, ruleList, 'exp(-a)==/exp(a)', 'Exponential of Difference', true);
newRule(myBTM, ruleList, 'exp(a-b)==exp(a)/exp(b)', 'Exponential of Difference', true);
newRule(myBTM, ruleList, 'exp(a)^b==exp(a*b)', 'Exponential of Product', true);
newRule(myBTM, ruleList, 'exp(a*b)==exp(b)^a', 'Exponential of Product', true, true);
newRule(myBTM, ruleList, 'ln(a*b)==ln(a)+ln(b)', 'Logarithm of a Product', true);
newRule(myBTM, ruleList, 'ln(/a)==-ln(a)', 'Logarithm of a Quotient', true);
newRule(myBTM, ruleList, 'ln(a/b)==ln(a)-ln(b)', 'Logarithm of a Quotient', true);
newRule(myBTM, ruleList, 'ln(a^b)==b*ln(a)', 'Logarithm of a Power', true);

newRule(myBTM, ruleList, 'sin(a+b)==sin(a)*cos(b)+cos(a)*sin(b)', 'Sine of a Sum', true);
newRule(myBTM, ruleList, 'sin(a-b)==sin(a)*cos(b)-cos(a)*sin(b)', 'Sine of a Difference', true);
newRule(myBTM, ruleList, 'cos(a+b)==cos(a)*cos(b)-sin(a)*sin(b)', 'Cosine of a Sum', true);
newRule(myBTM, ruleList, 'cos(a-b)==cos(a)*cos(b)+sin(a)*sin(b)', 'Cosine of a Difference', true);

// Rules that introduce new terms
newRule(myBTM, ruleList, 'a==a+b+-b', 'Additive Identity', true, true);
newRule(myBTM, ruleList, 'a==a*(b/b)', 'Multiply by One/Cancellation', true, true);
newRule(myBTM, ruleList, 'a==b*(a/b)', 'Factor out term', true, true);
newRule(myBTM, ruleList, 'a^n==a^b*a^(n-b)', 'Factor out Powers', true,true);

newRule(myBTM, ruleList, 'a==-(-a)', "Additive Inverse's Inverse", true, true);
newRule(myBTM, ruleList, 'a==/(/a)', "Multiplicative Inverse's Inverse", true, true);
newRule(myBTM, ruleList, 'a==1*a', 'Multiplicative Identity', true, true);
newRule(myBTM, ruleList, 'a==a/1', 'Multiplicative Identity', true, true);
newRule(myBTM, ruleList, '1==a/a', 'Inverses Cancel', true, true);
newRule(myBTM, ruleList, 'a==a^1', 'Algebra of Powers', true, true);

var algebWrist = {
  theExpr : null,
  selectExpr : null,
  identityList : undefined,
  currentTree : {},
  
  // Used for dragging elements in the tree area.
  dragging : {
    curAction : null,
    lastAction : null,
  },
  
  
  // Display control parameters
  inputGap : 10,
  inputCenter : 45,
  currentCenter : 120,
  parentCenter : 180,
  
  // Interface control parameters
  clickDuration : 300, // ms
  dblClickTime : 300, // ms
  clickError : 12, // total pixels
};

window.reset = function() {
  var entryField = document.getElementById('expression_entry');
  var entryFormula = entryField.value;
  entryFormula = entryFormula.replace(/\s/g,'');

  algebWrist.theExpr = myBTM.parse(entryFormula, "formula", {});
  algebWrist.selectExpr = null;
  updateSelect(algebWrist.theExpr);

  var history = document.getElementById('history');
  history.innerHTML = ""
    + "\\( \\displaystyle " + algebWrist.theExpr.toTeX() + "\\)";
  updateVisual();
}

window.addHistory = function() {
  var history = document.getElementById('history');
  history.innerHTML += "<BR/>";
  if (algebWrist.theExpr.valueType == exprValue.bool) {
    history.innerHTML += "&emsp;&iff;&emsp;"
  } else {
    history.innerHTML += "&emsp;=&emsp;"
  }
  history.innerHTML += "\\( \\displaystyle " + algebWrist.theExpr.toTeX() + "\\)";
}


// Building the tree occurs based on a queue in order that the MathJax typesetting
// can occur prior to assigning locations based on size of the output.
// This is the portion that occurs prior to typesetting.
function setupTree() {
  var copyExpr, exprTreeTeX;
  
  // Take the expression that has been entered and identify if
  // a subexpression is already chosen on which to base the tree.
  if (algebWrist.selectExpr === null) {
    exprTreeTeX = algebWrist.theExpr.treeToTeX(false);
    exprTreeTeX.inputs = [exprTreeTeX.current];
    exprTreeTeX.current = "&target;";
  } else {
    exprTreeTeX = algebWrist.selectExpr.treeToTeX(true);
    if (exprTreeTeX.parent === null) {
      exprTreeTeX.parent = "&target;";
    }
  }
  
  // Remove the old elements in preparation for a new subtree to display
  var treeArea = document.getElementById('tree_area');
  if (typeof algebWrist.currentTree.parentElement !== 'undefined' && algebWrist.currentTree.parentElement !== null) {
    treeArea.removeChild(algebWrist.currentTree.parentElement);
  }
  if (typeof algebWrist.currentTree.activeElement !== 'undefined' && algebWrist.currentTree.activeElement !== null) {
    treeArea.removeChild(algebWrist.currentTree.activeElement);
  }
  if (typeof algebWrist.currentTree.inputElements !== 'undefined' && algebWrist.currentTree.inputElements !== null) {
    for (var i in algebWrist.currentTree.inputElements) {
      treeArea.removeChild(algebWrist.currentTree.inputElements[i]);
    }
  }
  
  // Create the new object for the subtree.
  algebWrist.currentTree = {};
  
  // The object needs to track the parent (lowest level)
  if (exprTreeTeX.parent !== null) {
    var newP = document.createElement("div");
    newP.setAttribute("id", "parent-element");
    $(newP).css("display", "none");
    newP.innerHTML = "\\(\\displaystyle " + exprTreeTeX.parent + "\\)";
    algebWrist.currentTree.parentElement = newP;
    treeArea.appendChild(newP);
  } else {
    algebWrist.currentTree.parentElement = null;
  }

  // The object needs to track the current level (middle level)
  if (exprTreeTeX.current !== null) {
    var newP = document.createElement("div");
    newP.setAttribute("id", "active-element");
    $(newP).css("display", "none");
    newP.innerHTML = "\\(\\displaystyle " + exprTreeTeX.current + "\\)";
    algebWrist.currentTree.activeElement = newP;
    treeArea.appendChild(newP);
  } else {
    algebWrist.currentTree.activeElement = null;
  }
  
  // The object needs to track the inputs (highest level)
  if (exprTreeTeX.inputs !== null) {
    algebWrist.currentTree.inputElements = [];

    for (i in exprTreeTeX.inputs) {
      var newP = document.createElement("div");
      newP.setAttribute("id", "input-element-"+i);
      $(newP).css("display", "none");
      newP.innerHTML = "\\(\\displaystyle " + exprTreeTeX.inputs[i] + "\\)";
      algebWrist.currentTree.inputElements[i] = newP;
      treeArea.appendChild(newP);
    }
  } else {
    algebWrist.currentTree.inputElements = null;
  }
}

// This function is called after the tree expressions have been typeset, so that
// we know how much space they will need. This allows us to position them properly
// over the Canvas element.
function finishTree() {
  var myElement;
  if (typeof algebWrist.currentTree.parentElement !== 'undefined' && algebWrist.currentTree.parentElement !== null) {
    myElement = $("#parent-element");
    myElement.css("display", "block");
    myElement.addClass("parent-element");
  }
  if (typeof algebWrist.currentTree.activeElement !== 'undefined' && algebWrist.currentTree.activeElement !== null) {
    myElement = $("#active-element");
    myElement.css("display", "block");
    myElement.addClass("active-element");
  }
  if (typeof algebWrist.currentTree.inputElements !== 'undefined' && algebWrist.currentTree.inputElements !== null) {
    for (var i in algebWrist.currentTree.inputElements) {
      myElement = $(algebWrist.currentTree.inputElements[i]);
      myElement.css("display", "block");
    }
    for (var i in algebWrist.currentTree.inputElements) {
      myElement = $(algebWrist.currentTree.inputElements[i]);
      myElement.addClass("input-formula");
    }
  }
  treePositions();
}

// Compute positions of inputs and report back the current target of dragInput (if present)
function inputPositions(dragInput) {
  var dragElement,
    dragLeft, dragTop,
    dragWidth, dragHeight,
    curTarget = null;

  if (typeof dragInput !== "undefined" && dragInput >= 0) {
    dragElement = algebWrist.currentTree.inputElements[dragInput];
    dragLeft = dragElement.offsetLeft;
    dragTop = dragElement.offsetTop;
    dragWidth = dragElement.clientWidth;
    dragHeight = dragElement.clientHeight;
    inputBottom = document.getElementById("active-element").offsetTop;
  } else {
    dragElement = null;
    dragInput = -1;
  }

  var myElement;
  var winWidth = document.getElementById("tree_area").clientWidth;
  var totalWidth = (algebWrist.currentTree.inputElements.length-1) * algebWrist.inputGap;
  
  for (var i in algebWrist.currentTree.inputElements) {
    myElement = algebWrist.currentTree.inputElements[i];
    $(myElement).css({
      "position" : "absolute",
    });
    totalWidth += myElement.offsetWidth;
  }
  
  var curLeft = Math.floor((winWidth-totalWidth)/2),
    curWidth, curHeight, curTop, workLeft,
    i,
    newI;
    
  // See if the dragged element should be on far left.
  if (dragInput >= 0 && dragTop + dragHeight < inputBottom) {
    if (dragLeft < curLeft) {
      curLeft += dragWidth + algebWrist.inputGap;
      curTarget = "position-0";
    } else {
      curTarget = "position-"+(algebWrist.currentTree.inputElements.length-1);
    }
  }
  newI = 0;
  for (i in algebWrist.currentTree.inputElements) {
    if (i === dragInput) {
      if (dragInput >= 0 && dragTop + dragHeight >= inputBottom) {
        curLeft += dragWidth + algebWrist.inputGap;
      }
      continue;
    }
      
    myElement = algebWrist.currentTree.inputElements[i];
    curWidth = myElement.offsetWidth;
    curHeight = myElement.offsetHeight;
    
    curTop = algebWrist.inputCenter - curHeight/2;
    
    if (dragInput >= 0
        && dragLeft >= curLeft - algebWrist.inputGap
        && dragLeft < curLeft+curWidth
        && dragTop + dragHeight < inputBottom)
    {
      
      if (dragLeft < curLeft + curWidth/5) {
        workLeft = curLeft + dragWidth + algebWrist.inputGap;
        curTarget = "position-"+newI;
      } else if (dragLeft < curLeft + 4*curWidth/5) {
        workLeft = curLeft + dragWidth / 2;
        curTarget = myElement.id;
      } else {
        workLeft = curLeft;
        curTarget = "position-"+(newI+1);
      }
      $(myElement).css({
        "left" : "" + workLeft + "px",
        "top" : curTop + "px",
      });
      curLeft += curWidth + dragWidth + 2 * algebWrist.inputGap;
    } else {
      $(myElement).css({
        "left" : "" + curLeft + "px",
        "top" : curTop + "px",
      });
      curLeft += curWidth + algebWrist.inputGap;
    }
    newI++;
  }

  return(curTarget);
}

// Report back the current target of the active operation element when dragged.
function findDropInput(x, y) {
  var dragElement,
    curTarget = -1,
    curTree = algebWrist.currentTree;

  dragElement = algebWrist.dragging.curAction.element;

  // Check the inputs for a drag onto those.
  for (var i in curTree.inputElements) {
    if (curTarget < 0 && curTree.inputElements[i] !== dragElement
        && testInElement(x,y,curTree.inputElements[i])) {
      curTarget = i;
    }
  }

  return(curTarget);
}

function treePositions() {
  var winWidth = document.getElementById("tree_area").clientWidth;
  
  if (typeof algebWrist.currentTree.parentElement !== 'undefined' && algebWrist.currentTree.parentElement !== null) {
    var myElement = document.getElementById("parent-element");
    $(myElement).css({
      "position" : "absolute",
    });
    var myWidth = myElement.offsetWidth,
      myHeight = myElement.offsetHeight;

    $(myElement).css({
      "left" : "" + Math.floor((winWidth - myWidth)/2) + "px",
      "top" : Math.floor(algebWrist.parentCenter - myHeight/2) + "px",
    });
  }
  if (typeof algebWrist.currentTree.activeElement !== 'undefined' && algebWrist.currentTree.activeElement !== null) {
    var myElement = document.getElementById("active-element");
    $(myElement).css({
      "position" : "absolute",
    });
    var myWidth = myElement.offsetWidth;
    $(myElement).css({
      "left" : "" + Math.floor((winWidth - myWidth)/2) + "px",
      "top" : Math.floor(algebWrist.currentCenter - myHeight/2) + "px",
    });
  }
  if (typeof algebWrist.currentTree.inputElements !== 'undefined' && algebWrist.currentTree.inputElements !== null) {
    inputPositions();
  }
}

function updateVisual() {
  if (typeof MathJax != "undefined") {
    var displayArea = document.getElementById('display_area');
    displayArea.innerHTML = "\\(\\displaystyle " + algebWrist.theExpr.toTeX(true) + "\\)";
    displayArea.className = "math";
    
    setupTree();
    MathJax.typesetPromise().then(() => {
      finishTree();
    });
  }
}

function updateIdentities() {
  var identityDiv = document.getElementById('identities');
  identityDiv.innerHTML = '';
  
  var idListElement = document.createElement("ul");
  
  if (algebWrist.selectExpr !== null) {
    var idList = algebWrist.identityList = findMatchRules(ruleList, algebWrist.selectExpr, true);
    for (var id in idList) {
      var idEntry = document.createElement("li");
      if (idList[id].numInputs == 0) {
        idEntry.innerHTML = "<!-- Identity " + id + " -->" 
          + "<input type='button' value='&checkmark;' onclick='doSubstitute(" 
          + id
          + ")'></input>&nbsp;"
          + '\\(\\displaystyle ' + idList[id].equation + '\\) '
          + " (" + idList[id].name + ")";
      } else {
        idEntry.innerHTML = "<!-- Identity " + id + " -->" 
          + "<span id='identity-toggle-" + id + "'>&#9658;</span>&nbsp;"
          + '\\(\\displaystyle ' + idList[id].equation + '\\) '
          + " (" + idList[id].name + ")";
        var idInputList = document.createElement("ul");
        for (var i=1; i<=idList[id].numInputs; i++) {
          var inputEntry = document.createElement("li");
          inputEntry.innerHTML = "\\(\\displaystyle \\boxed{...?^{"+i+"}} = \\)" 
            + '<input type="text" autocapitalize="off" size="50" id="identity-' + id + '-input-' + i + '">'
            + '</input>';
          if (i == idList[id].numInputs) {
            inputEntry.innerHTML += "&nbsp;<input type='button' value='&checkmark;' onclick='doSubstitute(" 
              + id + ")'></input>"
          }
          idInputList.appendChild(inputEntry);
        }
        idEntry.appendChild(idInputList);
      }
      idListElement.appendChild(idEntry);
    }
  }
  identityDiv.appendChild(idListElement);
}

function doSubstitute(id) {
  var subFormula = algebWrist.identityList[id].subStr;
  if (algebWrist.selectExpr !== null) {
    var subExpr = parseExpression(subFormula),
      n = algebWrist.identityList[id].numInputs;

    if (n > 0) {
      var bindings = {};
      for (var i=1; i<=n; i++) {
        var input = "input"+i;
        bindings[input] = document.getElementById("identity-"+id+"-input-"+i).value;
      }
      subExpr = subExpr.compose(bindings);
    }
    if (algebWrist.selectExpr.parent === null) {
      algebWrist.theExpr = subExpr;
      algebWrist.selectExpr = subExpr;
    } else {
      algebWrist.selectExpr.parent.inputSubst(algebWrist.selectExpr, subExpr);
    }
    updateSelect(subExpr, true);
    updateVisual();
  }
}

function doDoubleClick(action) {
  var myID = action.element.getAttribute("id");
  if (myID === "parent-element") {
    updateSelect(algebWrist.selectExpr.parent);
    updateVisual();
  } else if (myID.slice(0,-2) === "input-element") {
    if (algebWrist.selectExpr === null) {
      updateSelect(algebWrist.theExpr);
      updateVisual();
    } else {
      var whichInput = myID.slice(14);
      updateSelect(algebWrist.selectExpr.getInput(whichInput));
      updateVisual();
    }
  }
}

function testInElement(x, y, element) {
  if (element == null)
    return(false);
  var clientRect = element.getBoundingClientRect();
  
  return((clientRect.left<x) && (clientRect.right>x)
          && (clientRect.top<y) && (clientRect.bottom>y));
}

function clickAction(actionType, timeStamp, clientX, clientY, element, commuteInput) {
  this.action = actionType;
  this.x = clientX;
  this.y = clientY;
  this.time = timeStamp;
  this.element = element;
  this.commuteInput = commuteInput;
  this.lastDropTarget = null;
  
  this.lastX = clientX;
  this.lastY = clientY;
}

// Deal with a click down inside of the tree area.
window.doTreeAreaClickDown = function (timeStamp, clientX, clientY) {
  // See if it is inside of one of the elements of the current tree
  var draggableElement = null,
    commuteInput = -1,
    doPrevent = true;
  
  if (typeof algebWrist.currentTree.parentElement !== 'undefined' && algebWrist.currentTree.parentElement !== null
      && testInElement(clientX, clientY, algebWrist.currentTree.parentElement)) {
    draggableElement = algebWrist.currentTree.parentElement;
  } else if (typeof algebWrist.currentTree.activeElement !== 'undefined' && algebWrist.currentTree.activeElement !== null
      && testInElement(clientX, clientY, algebWrist.currentTree.activeElement)) {
    draggableElement = algebWrist.currentTree.activeElement;
  } else if (typeof algebWrist.currentTree.inputElements !== 'undefined' && algebWrist.currentTree.inputElements.length > 0) {
    for (var i in algebWrist.currentTree.inputElements) {
      if (testInElement(clientX, clientY, algebWrist.currentTree.inputElements[i])) {
        draggableElement = algebWrist.currentTree.inputElements[i];
        if (typeof algebWrist.selectExpr !== "undefined" && algebWrist.selectExpr !== null
            && (algebWrist.selectExpr.type == exprType.multiop || algebWrist.selectExpr.type == exprType.binop)
            && algebWrist.selectExpr.isCommutative())
        {
          commuteInput = i;
        }
      }
    }
  }
  
  // Prepare the event tracking system to deal with the element we found.
  if (draggableElement !== null) {
    algebWrist.dragging.lastAction = algebWrist.dragging.curAction;
    algebWrist.dragging.curAction = new clickAction("down", timeStamp, clientX, clientY, draggableElement, commuteInput);
  } else {
    algebWrist.dragging.lastAction = algebWrist.dragging.curAction;
    algebWrist.dragging.curAction = new clickAction("empty", timeStamp, clientX, clientY, null, commuteInput);
    doPrevent = false;
  }
  
  return(doPrevent);
}

// Deal with a click or touch starting inside of the tree area.
window.doTreeAreaMouseDown = function (event) {
  document.getElementById("last-event").innerHTML = "Mouse Down Event";
  if (doTreeAreaClickDown(event.timeStamp, event.clientX, event.clientY))
    event.preventDefault();
}

window.doTreeAreaTouchStart = function(event) {
  document.getElementById("last-event").innerHTML = "Touch Start Event";
  var curAction = algebWrist.dragging.curAction;

  if (event.touches.length === 1) {
    if (doTreeAreaClickDown(event.timeStamp, event.touches[0].clientX, event.touches[0].clientY))
      event.preventDefault();
  } else {
    if (curAction.action === "down" || curAction.action === "dragging") {
      doAbortClick();
    }
  }
}

window.doAbortClick = function() {
  var curAction = algebWrist.dragging.curAction;
  treePositions();
  curAction.action = "cancel";
}

// Deal with movement of click or touch inside of the tree area.
window.doTreeAreaClickMove = function(clientX, clientY) {
  var curAction = algebWrist.dragging.curAction,
    retValue = false;

  if (curAction !== null) {
    // See if we need to reclassify as a drag.
    if (curAction.action === "down"
        && (Math.abs(clientX - curAction.x) + Math.abs(clientY - curAction.y) > algebWrist.clickError))
    {
      curAction.action = "dragging";
      curAction.startLeft = curAction.element.offsetLeft;
      curAction.startTop = curAction.element.offsetTop;
      var parentNode = curAction.element.parentElement;
      parentNode.appendChild(parentNode.removeChild(curAction.element));
    }
  
    // Update the visible location, but bounding position to stay within the canvas.
    if (curAction.action === "dragging") {
      var newLeft, newTop;
      newLeft = this.lastX = curAction.startLeft + clientX - curAction.x;
      newTop = this.lastY = curAction.startTop + clientY - curAction.y;
  
      if (newLeft < 0) {
        newLeft = 0;
      }
      if (newLeft + curAction.element.clientWidth > curAction.element.parentNode.clientWidth) {
        newLeft = curAction.element.parentNode.clientWidth - curAction.element.clientWidth;
      }
      if (newTop < 0) {
        newTop = 0;
      }
      if (newTop + curAction.element.clientHeight > curAction.element.parentNode.clientHeight) {
        newTop = curAction.element.parentNode.clientHeight - curAction.element.clientHeight;
      }
      $(curAction.element).css({ "left" : newLeft, "top" : newTop });
      
      // If commutative inputs, then adjust their locations.
      if (curAction.commuteInput >= 0) {
        curAction.lastDropTarget = inputPositions(curAction.commuteInput);
      }
      
      // Otherwise, see what we are hovering over.
      else {
        var curTree = algebWrist.currentTree;

        // Check the parent element
        if (curAction.element !== curTree.parentElement 
            && testInElement(clientX, clientY, curTree.parentElement))
        {
          curAction.lastDropTarget = curTree.parentElement.id;
        }
        // Check the active element
        else if (curAction.element !== curTree.activeElement 
            && testInElement(clientX, clientY, curTree.activeElement))
        {
          curAction.lastDropTarget = curTree.activeElement.id;
        }
        // Check the inputs
        else
        {
          var onInput = findDropInput(clientX, clientY);
          if (onInput >= 0) {
            curAction.lastDropTarget = curTree.inputElements[onInput].id;
          }
        }

      }

      retValue = true;
    }
  }
  if (typeof curAction !== "undefined" && curAction !== null)
    document.getElementById("last-event").innerHTML = "Mouse Move Event (" + curAction.lastDropTarget + ")";
  return(retValue);
}

// Deal with movement of mouse inside of the tree area.
window.doTreeAreaMouseMove = function(event) {
  if (doTreeAreaClickMove(event.clientX, event.clientY))
    event.preventDefault();
}

// Deal with movement of touch inside of the tree area.
window.doTreeAreaTouchMove = function(event) {
  var curAction = algebWrist.dragging.curAction;

  if (event.touches.length > 1 
      && curAction !== null && (curAction.action === "down" || curAction.action === "dragging")) {
    doAbortClick();
  } else if (curAction !== null && (curAction.action === "down" || curAction.action === "dragging")) {
    if (doTreeAreaClickMove(event.touches[0].clientX, event.touches[0].clientY))
      event.preventDefault();
  }
}

// Deal with release of click or touch inside of the tree area.
function doOutTreeAreaMouseUp(event) {
  document.getElementById("last-event").innerHTML = "Click Up Event (Out)";

  var curAction = algebWrist.dragging.curAction;

  // See if we classify as a click.
  if (curAction.action === "dragging") {
    doAbortClick();
  }
    
  document.body.removeEventListener("mouseup", doOutTreeAreaMouseUp)
  event.preventDefault();
}

// Deal with release of click or touch inside of the tree area.
window.doTreeAreaMouseEnter = function (event) {
  document.getElementById("last-event").innerHTML = "MouseEnter";
  var curAction = algebWrist.dragging.curAction;
  if (curAction !== null && curAction.action === 'dragging') {
    document.body.removeEventListener("mouseup", doOutTreeAreaMouseUp)
  }
}

// Deal with release of click or touch inside of the tree area.
window.doTreeAreaMouseLeave = function (event) {
  document.getElementById("last-event").innerHTML = "MouseLeave";
  var curAction = algebWrist.dragging.curAction;
  if (curAction !== null && curAction.action === 'dragging') {
    document.body.addEventListener("mouseup", doOutTreeAreaMouseUp)
  }
}

function applyParentActiveRule() {
  var newInputs = [],
    selectExpr = algebWrist.selectExpr,
    testExpr = selectExpr.parent;

  if (testExpr == null)
    return;

  // See if the active element is a multiop. In that case, we need to group all other
  // elements before checking our rules.
  if (testExpr.type == exprType.multiop && testExpr.inputs.length > 2) {
    var j = testExpr.inputs.indexOf(selectExpr);
    for (var i in selectExpr.parent.inputs) {
      if (i != j) {
        newInputs.push(parseExpression(selectExpr.parent.inputs[i].toString()));
      }
      testExpr = new multiop_expr(selectExpr.parent.op, [new multiop_expr(selectExpr.parent.op, newInputs), selectExpr]);
    }
  }

  // We want to see what simplification can be done. So see what is allowed.  
  var ruleMatches = findMatchRules(autoIdentityList, testExpr, true);

  // There was a valid simplification so make the substitution.
  if (ruleMatches.length > 0) {
    var subExpr = parseExpression(ruleMatches[0].subStr).simplifyConstants();

    if (algebWrist.selectExpr.parent.parent === null) {
      algebWrist.theExpr = subExpr;
      algebWrist.selectExpr = subExpr;
    } else {
      algebWrist.selectExpr.parent.parent.inputSubst(algebWrist.selectExpr.parent, subExpr);
    }
    updateSelect(subExpr, true);
    updateVisual();
  } else {
    treePositions();
  }
}

function applyActiveInputRule(whichInput) {
  var newInputs = [],
    selectExpr = algebWrist.selectExpr,
    testExpr = selectExpr;

  // See if the active element is a multiop. In that case, we need to group all other
  // elements before checking our rules.
  if (selectExpr.type == exprType.multiop && selectExpr.inputs.length > 2) {
    for (var i in selectExpr.inputs) {
      if (i != whichInput) {
        newInputs.push(parseExpression(selectExpr.inputs[i].toString()));
      }
    }
    testExpr = new multiop_expr(selectExpr.op, [new multiop_expr(selectExpr.op, newInputs), selectExpr.inputs[whichInput]]);
    whichInput = 1;
  }

  // We want to see what simplification can be done. So see what is allowed.  
  var ruleMatches = findMatchRules(autoIdentityList, testExpr, true);

  // There was a valid simplification so make the substitution.
  if (ruleMatches.length > 0) {
    var subExpr = parseExpression(ruleMatches[0].subStr).simplifyConstants();

    if (algebWrist.selectExpr.parent === null) {
      algebWrist.theExpr = subExpr;
      algebWrist.selectExpr = subExpr;
    } else {
      algebWrist.selectExpr.parent.inputSubst(algebWrist.selectExpr, subExpr);
    }
    updateSelect(subExpr, true);
    updateVisual();
  }

  // Check if distributive property would apply.
  // This is treated specially so that can apply to all terms. If can find
  // how to implement a recursive substitution, then this could be eliminated.
  else if (testExpr.type == exprType.multiop && testExpr.op == '*'
        && testExpr.inputs[whichInput].type === exprType.multiop && testExpr.inputs[whichInput].op == '+')
  {
    var subExpr,
      factorInput = 1 - whichInput, // This relies on the earlier step that recast multiop into effective binop.
      factorStr = testExpr.inputs[factorInput].toString(),
      sumTerm = testExpr.inputs[whichInput];
    newInputs = [];
    for (var i in sumTerm.inputs) {
      newInputs[i] = new multiop_expr('*', [parseExpression(factorStr), sumTerm.inputs[i]]).simplifyConstants();
    }
    subExpr = new multiop_expr('+', newInputs);
    if (algebWrist.selectExpr.parent === null) {
      algebWrist.theExpr = subExpr;
      algebWrist.selectExpr = subExpr;
    } else {
      algebWrist.selectExpr.parent.inputSubst(algebWrist.selectExpr, subExpr);
    }
    updateSelect(subExpr, true);
    updateVisual();
  }

  else {
    treePositions();
  }
}

// Deal with release of click inside of the tree area.
window. doTreeAreaClickUp = function (timeStamp, clientX, clientY) {
  var curAction = algebWrist.dragging.curAction,
    lastAction = algebWrist.dragging.lastAction,
    curTree = algebWrist.currentTree,
    whichInput,
    doVisualUpdate=false;

  // See if we classify as a click.
  if (curAction.action === "down") {
    if ((timeStamp - curAction.time < algebWrist.clickDuration)
        && (Math.abs(clientX - curAction.x) + Math.abs(clientY - curAction.y) < algebWrist.clickError))
    {
      if (lastAction !== null && lastAction.action === "click" && (curAction.time - lastAction.time) < algebWrist.dblClickTime
          && (Math.abs(lastAction.x - curAction.x) + Math.abs(lastAction.y - curAction.y) < algebWrist.clickError))
      {
        curAction.action = "dblclick";
      } else {
        curAction.action = "click";
      }
      curAction.time = timeStamp;
    } else {
      curAction.action = "context";
    }
  
  // See if we classify the release as a drop.
  } else if (curAction.action === "dragging") {
    var selectExpr = algebWrist.selectExpr;

    curAction.action = "drag"
    
    // Nothing ultimately happened
    if (curAction.lastDropTarget === null) {
      treePositions();
    
    } 

    // Dragging an input to +/* (commutative+associative).
    // See where it dropped.
    else if (curAction.commuteInput >= 0) {
      // It was dropped in a space made available for commutativity.
      if (curAction.lastDropTarget.indexOf("position") >= 0) {
        var newIndex = +curAction.lastDropTarget.slice(9),
          oldIndex = +curAction.commuteInput;
        var moveInput = selectExpr.inputs.slice(oldIndex, oldIndex+1);
        selectExpr.inputs = selectExpr.inputs.slice(0,oldIndex)
          .concat(selectExpr.inputs.slice(oldIndex+1));
        selectExpr.inputs = selectExpr.inputs.slice(0,newIndex)
          .concat(moveInput)
          .concat(selectExpr.inputs.slice(newIndex));

        updateSelect(selectExpr.reduce(), true);
        doVisualUpdate = true;
      }
      
      // It was dropped on one of the other inputs.
      // This might mean to apply:
      // - a simplification
      // - distribute multiplication over addition
      // - associativity: just regroup some terms.
      else if (curAction.lastDropTarget.indexOf("input-element") >= 0) {
        var dropIndex = +curAction.lastDropTarget.slice(14),
          dragIndex = +curAction.commuteInput,

          newInputs = [],
          dragInput = selectExpr.inputs[dragIndex],
          dropInput = selectExpr.inputs[dropIndex];
      
        // We want to see what simplification can be done. So see what is allowed.  
        var tempExpr = new multiop_expr(selectExpr.op, [dropInput, dragInput]),
          ruleMatches = findMatchRules(autoIdentityList, tempExpr, true);
      
        // There was a valid simplification so make the substitution.
        if (ruleMatches.length > 0) {
          selectExpr.inputs[dropIndex] = parseExpression(ruleMatches[0].subStr).simplifyConstants();
          selectExpr.inputs[dropIndex].parent = selectExpr;
          selectExpr.inputs = selectExpr.inputs.slice(0,dragIndex)
            .concat(selectExpr.inputs.slice(dragIndex+1));
        }

        // Check if distributive property would apply.
        // Restricted to the case of binary multiplication so that associative rule can
        // be used when more than 2.
        // This is treated specially so that can apply to all terms. If can find
        // how to implement a recursive substitution, then this could be eliminated.
        else if ((dropInput.type === exprType.binop || dropInput.type === exprType.multiop)
            && dropInput.op === '+' && selectExpr.op === '*' && selectExpr.inputs.length == 2)
        {
          var newExpr,
            factorStr = dragInput.toString();
          for (var i in dropInput.inputs) {
            newInputs[i] = new multiop_expr('*', [parseExpression(factorStr), dropInput.inputs[i]]).simplifyConstants();
          }
          selectExpr.inputs[dropIndex] = new multiop_expr('+', newInputs);
          selectExpr.inputs[dropIndex].parent = selectExpr;
          selectExpr.inputs = selectExpr.inputs.slice(0,dragIndex)
            .concat(selectExpr.inputs.slice(dragIndex+1));
        }
      
        // Final option is just to regroup (Associativity)
        else {
          if ((dropInput.type === exprType.binop || dropInput.type === exprType.multiop)
              && dropInput.op === selectExpr.op)
          {
            newInputs = newInputs.concat(dropInput.inputs);
          } else {
            newInputs.push(dropInput);
          }

          if ((dragInput.type === exprType.binop || dragInput.type === exprType.multiop)
              && dragInput.op === selectExpr.op) {
            newInputs = newInputs.concat(dragInput.inputs);
          } else {
            newInputs.push(dragInput);
          }
          selectExpr.inputs[dropIndex] = new multiop_expr(selectExpr.op, newInputs).simplifyConstants();
          selectExpr.inputs[dropIndex].parent = selectExpr;
          selectExpr.inputs = selectExpr.inputs.slice(0,dragIndex)
            .concat(selectExpr.inputs.slice(dragIndex+1));
        }
        
        // After making the substitution, reset the selected element.
        updateSelect(selectExpr.reduce(), true);
        doVisualUpdate = true;
      }
    }

    // Was the parent dropped on the active element or vice versa.
    else if ( (curAction.element.id == 'parent-element' && curAction.lastDropTarget == 'active-element')
          || (curAction.element.id == 'active-element' && curAction.lastDropTarget == 'parent-element') )
    {
      applyParentActiveRule();
    }

    // Was the active element dragged onto an input or vice versa 
    // (or non-commutative input dropped on another input ==> binary operator!)
    else if ( (curAction.element.id.indexOf('input-element') == 0 && curAction.lastDropTarget == 'active-element')
          || (curAction.element.id == 'active-element' && curAction.lastDropTarget.indexOf('input-element')==0) 
          || (curAction.element.id.indexOf('input-element') == 0 
            && curAction.lastDropTarget.indexOf('input-element') == 0)
        )
    {
      var whichInput;
      
      if (curAction.lastDropTarget == 'active-element') {
        whichInput = curTree.inputElements.indexOf(curAction.element);
      } else {
        whichInput = +curAction.lastDropTarget.slice(14);
      }
      applyActiveInputRule(whichInput);
    }
    
    else {
      treePositions();
    }
  } else {
  }
  
  // Now act on the behavior.
  switch (curAction.action) {
    case "dblclick":
      doDoubleClick(curAction);
      break;
    default:
      if (doVisualUpdate) {
        updateVisual();
      }
      break;
  }
}

// Deal with release of click inside of the tree area.
window.doTreeAreaMouseUp = function (event) {
  document.getElementById("last-event").innerHTML = "Click Up Event";
  doTreeAreaClickUp(event.timeStamp, event.clientX, event.clientY);
  event.preventDefault();
}

// Deal with release of touch inside of the tree area.
window.doTreeAreaTouchEnd = function (event) {
  var curAction = algebWrist.dragging.curAction;

  // Not designed to deal with multi-touch.
  if (event.touches.length > 1) {
    doAbortClick();
  }
  
  if (curAction.action !== "cancel") {
    document.getElementById("last-event").innerHTML = "Touch Up Event";
    doTreeAreaClickUp(event.timeStamp, curAction.lastX, curAction.lastY);
    event.preventDefault();
  }
}

function updateSelect(newSelectExpr, doHistory) {
  if (algebWrist.selectExpr !== null) {
    algebWrist.selectExpr.select = false;
  }
  algebWrist.selectExpr = newSelectExpr;
  if (algebWrist.selectExpr == null) {
    algebWrist.selectExpr = algebWrist.theExpr;
  }
  algebWrist.selectExpr.select = true;
  if (typeof doHistory != "undefined" && doHistory)
    addHistory();
  updateIdentities();
}

window.moveLeft = function() {
  if (algebWrist.selectExpr !== null && algebWrist.selectExpr.parent !== null
      && typeof algebWrist.selectExpr.parent.inputs !== 'undefined') {
    var newChild = algebWrist.selectExpr.parent.inputs.indexOf(algebWrist.selectExpr) - 1;
    if (newChild < 0) {
      newChild = algebWrist.selectExpr.parent.inputs.length - 1;
    }
    updateSelect(algebWrist.selectExpr.parent.inputs[newChild]);
    updateVisual();
  }
}

window.moveRight = function() {
  if (algebWrist.selectExpr !== null && algebWrist.selectExpr.parent !== null
      && typeof algebWrist.selectExpr.parent.inputs !== 'undefined') {
    var newChild = algebWrist.selectExpr.parent.inputs.indexOf(algebWrist.selectExpr) + 1;
    if (newChild >= algebWrist.selectExpr.parent.inputs.length) {
      newChild = 0;
    }
    updateSelect(algebWrist.selectExpr.parent.inputs[newChild]);
    updateVisual();
  }
}

window.moveUp = function() {
  if (algebWrist.selectExpr === null) {
    updateSelect(algebWrist.theExpr);
  } else if (algebWrist.selectExpr.inputs.length > 0) {
    updateSelect(algebWrist.selectExpr.inputs[0]);
  }
  updateVisual();
}

window.moveDown = function() {
  if (algebWrist.selectExpr.parent !== null) {
    updateSelect(algebWrist.selectExpr.parent);
  }
  updateVisual();
}
