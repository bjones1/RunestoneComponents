// ********************************************************
// |docname| - grading-related utilities for FITB questions
// ********************************************************
// This code runs both on the server (for server-side grading) and on the client. It's placed here as a set of functions specifically for this purpose.


"use strict";

// Includes
// ========
// This is an edited copy of `EJS <https://ejs.co/>`_:
//
// -    It contains the improvement mentioned in `this issue <https://github.com/mde/ejs/issues/624>`_.
// -    It also contains a workaround for a `js2py v0.71 bug <https://github.com/PiotrDabkowski/Js2Py/pull/265>`_. The fix is merged, but not yet released.
//
// If both issues are merged and released, then use EJS from NPM.
import { render as ejs_render } from "./ejs/lib/ejs.js";


// Globals
// =======
// Standard options to use for EJS templates.
const EJS_OPTIONS = {
    strict: true,
    // Not needed, but might reduce confusion -- you can access the variable ``a`` as ``a`` or ``v.a``.
    localsName: "v",
    // Avoid the default delimiters of ``<`` and ``>``, which get translated to HTML entities by Sphinx.
    openDelimiter: "[",
    closeDelimiter: "]"
};


// Functions
// =========
// Update the problem's description based on dynamically-generated content.
export function renderDynamicContent(seed, dyn_vars, html_in, divid, prepareCheckAnswers) {
    // Initialize RNG with ``this.seed``. Taken from `SO <https://stackoverflow.com/a/47593316/16038919>`_.
    const rand = function mulberry32(a) {
        return function() {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }(seed);

    // See `RAND_FUNC <RAND_FUNC>`_, which refers to ``rand`` above.
    const dyn_vars_eval = window.Function(
        "v", "rand", `"use strict";\n${dyn_vars};\nreturn v;`
    )(
        {divid: divid, prepareCheckAnswers: prepareCheckAnswers}, RAND_FUNC
    );

    let html_out;
    if (typeof(dyn_vars_eval.beforeContentRender) === "function") {
        try {
            dyn_vars_eval.beforeContentRender(dyn_vars_eval);
        } catch (err) {
            console.log(`Error in problem ${divid} invoking beforeContentRender`);
            throw err;
        }
    }
    try {
        html_out = ejs_render(html_in, dyn_vars_eval, EJS_OPTIONS);
    } catch (err) {
        console.log(`Error rendering problem ${divid} text using EJS`);
        throw err;
    }

    // the afterContentRender event will be called by the caller of this function (after it updated the HTML based on the contents of html_out).
    return [html_out, dyn_vars_eval];
}


// Given student answers, grade them and provide feedback.
//
// Outputs:
//
// -    ``displayFeed`` is an array of HTML feedback.
// -    ``isCorrectArray`` is an array of true, false, or null (the question wasn't answered).
// -    ``correct`` is true, false, or null (the question wasn't answered).
// -    ``percent`` is the percentage of correct answers (from 0 to 1, not 0 to 100).
export function checkAnswersCore(
    // _`blankNamesDict`: An dict of {blank_name, blank_index} specifying the name for each named blank.
    blankNamesDict,
    // _`given_arr`: An array of strings containing student-provided answers for each blank.
    given_arr,
    // A 2-D array of strings giving feedback for each blank.
    feedbackArray,
    // _`dyn_vars_eval`: A dict produced by evaluating the JavaScript for a dynamic exercise.
    dyn_vars_eval,
    // True if this is running on the server, to work around a `js2py v0.71 bug <https://github.com/PiotrDabkowski/Js2Py/pull/266>`_ fixed in master. When a new version is released, remove this.
    is_server=false,
) {
    if (typeof(dyn_vars_eval.beforeCheckAnswers) === "function") {
        const [namedBlankValues, given_arr_converted] = parseAnswers(blankNamesDict, given_arr, dyn_vars_eval);
        const dve_blanks = Object.assign({}, dyn_vars_eval, namedBlankValues);
        try {
            dyn_vars_eval.beforeCheckAnswers(dve_blanks, given_arr_converted);
        } catch (err) {
            console.log("Error calling beforeCheckAnswers");
            throw err;
        }
    }

    // Keep track if all answers are correct or not.
    let correct = true;
    const isCorrectArray = [];
    const displayFeed = [];
    for (let i = 0; i < given_arr.length; i++) {
        const given = given_arr[i];
        // If this blank is empty, provide no feedback for it.
        if (given === "") {
            isCorrectArray.push(null);
            // TODO: was $.i18n("msg_no_answer").
            displayFeed.push("No answer provided.");
            correct = false;
        } else {
            // Look through all feedback for this blank. The last element in the array always matches. If no feedback for this blank exists, use an empty list.
            const fbl = feedbackArray[i] || [];
            let j;
            for (j = 0; j < fbl.length; j++) {
                // The last item of feedback always matches.
                if (j === fbl.length - 1) {
                    displayFeed.push(fbl[j]["feedback"]);
                    break;
                }
                // If this is a dynamic solution...
                if (dyn_vars_eval) {
                    const [namedBlankValues, given_arr_converted] = parseAnswers(blankNamesDict, given_arr, dyn_vars_eval);
                    // If there was a parse error, then it student's answer is incorrect.
                    if (given_arr_converted[i] instanceof TypeError) {
                        displayFeed.push(given_arr_converted[i].message);
                        // Count this as wrong by making j != 0 -- see the code that runs immediately after the executing the break.
                        j = 1;
                        break;
                    }
                    // Create a function to wrap the expression to evaluate. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function.
                    // Pass the answer, array of all answers, then all entries in ``this.dyn_vars_eval`` dict as function parameters.
                    const is_equal = window.Function(
                        "ans",
                        "ans_array",
                        ...Object.keys(dyn_vars_eval),
                        ...Object.keys(namedBlankValues),
                        `"use strict;"\nreturn ${fbl[j]["solution_code"]};`
                    )(
                        given_arr_converted[i],
                        given_arr_converted,
                        ...Object.values(dyn_vars_eval),
                        ...Object.values(namedBlankValues)
                    );
                    // If student's answer is equal to this item, then append this item's feedback.
                    if (is_equal) {
                        displayFeed.push(typeof(is_equal) === "string" ? is_equal : fbl[j]["feedback"]);
                        break;
                    }
                } else
                // If this is a regexp...
                if ("regex" in fbl[j]) {
                    const patt = RegExp(
                        fbl[j]["regex"],
                        fbl[j]["regexFlags"]
                    );
                    if (patt.test(given)) {
                        displayFeed.push(fbl[j]["feedback"]);
                        break;
                    }
                } else {
                    // This is a number.
                    console.assert("number" in fbl[j]);
                    const [min, max] = fbl[j]["number"];
                    // Convert the given string to a number. While there are `lots of ways <https://coderwall.com/p/5tlhmw/converting-strings-to-number-in-javascript-pitfalls>`_ to do this; this version supports other bases (hex/binary/octal) as well as floats.
                    const actual = +given;
                    if (actual >= min && actual <= max) {
                        displayFeed.push(fbl[j]["feedback"]);
                        break;
                    }
                }
            }

            // js2py seems to increment j in the for loop **after** encountering a break statement. Aargh. Work around this.
            if (is_server) {
                --j;
            }
            // The answer is correct if it matched the first element in the array. A special case: if only one answer is provided, count it wrong; this is a misformed problem.
            const is_correct = j === 0 && fbl.length > 1;
            isCorrectArray.push(is_correct);
            if (!is_correct) {
                correct = false;
            }
        }
    }

    if (typeof(dyn_vars_eval.afterCheckAnswers) === "function") {
        const [namedBlankValues, given_arr_converted] = parseAnswers(blankNamesDict, given_arr, dyn_vars_eval);
        const dve_blanks = Object.assign({}, dyn_vars_eval, namedBlankValues);
        try {
            dyn_vars_eval.afterCheckAnswers(dve_blanks, given_arr_converted);
        } catch (err) {
            console.log("Error calling afterCheckAnswers");
            throw err;
        }
    }

    const percent = isCorrectArray.filter(Boolean).length / isCorrectArray.length;
    return [displayFeed, correct, isCorrectArray, percent];
}


// Use the provided parsers to convert a student's answers (as strings) to the type produced by the parser for each blank.
function parseAnswers(
    // See blankNamesDict_.
    blankNamesDict,
    // See given_arr_.
    given_arr,
    // See `dyn_vars_eval`.
    dyn_vars_eval,
){
    // Provide a dict of {blank_name, converter_answer_value}.
    const namedBlankValues = getNamedBlankValues(given_arr, blankNamesDict, dyn_vars_eval);
    // Invert blankNamedDict: compute an array of [blank_0_name, ...]. Note that the array may be sparse: it only contains values for named blanks.
    const given_arr_names = [];
    for (const [k, v] of Object.entries(blankNamesDict)) {
        given_arr_names[v] = k;
    }
    // Compute an array of [converted_blank_0_val, ...]. Note that this re-converts all the values, rather than (possibly deep) copying the values from already-converted named blanks.
    const given_arr_converted = given_arr.map((value, index) => type_convert(given_arr_names[index], value, index, dyn_vars_eval));

    return [namedBlankValues, given_arr_converted];
}


// Render the feedback for a dynamic problem.
export function renderDynamicFeedback(
    // See blankNamesDict_.
    blankNamesDict,
    // See given_arr_.
    given_arr,
    // The index of this blank in given_arr_.
    index,
    // The feedback for this blank, containing a template to be rendered.
    displayFeed_i,
    // See dyn_vars_eval_.
    dyn_vars_eval
) {
    // Use the answer, an array of all answers, the value of all named blanks, and all solution variables for the template.
    const namedBlankValues = getNamedBlankValues(given_arr, blankNamesDict, dyn_vars_eval);
    const sol_vars_plus = Object.assign({
        ans: given_arr[index],
        ans_array: given_arr
    },
        dyn_vars_eval,
        namedBlankValues,
    );
    try {
        displayFeed_i = ejs_render(displayFeed_i, sol_vars_plus, EJS_OPTIONS);
    } catch (err) {
        console.log(`Error evaluating feedback index ${index}.`)
        throw err;
    }

    return displayFeed_i;
}


// Utilities
// ---------
// For each named blank, get the value for the blank: the value of each ``blankName`` gives the index of the blank for that name.
function getNamedBlankValues(given_arr, blankNamesDict, dyn_vars_eval) {
    const namedBlankValues = {};
    for (const [blank_name, blank_index] of Object.entries(blankNamesDict)) {
        namedBlankValues[blank_name] = type_convert(blank_name, given_arr[blank_index], blank_index, dyn_vars_eval);
    }
    return namedBlankValues;
}


// Convert a value given its type.
function type_convert(name, value, index, dyn_vars_eval) {
    // The converter can be defined by index, name, or by a single value (which applies to all blanks). If not provided, just pass the data through.
    const types = dyn_vars_eval.types || pass_through;
    const converter = types[name] || types[index] || types;
    // ES5 hack: it doesn't support binary values, and js2py doesn't allow me to override the ``Number`` class. So, define the workaround class ``Number_`` and use it if available.
    if (converter === Number && typeof Number_ !== "undefined") {
        converter = Number_;
    }

    // Return the converted type. If the converter raises a TypeError, return that; it will be displayed to the user, since we assume type errors are a way for the parser to explain to the user why the parse failed. For all other errors, re-throw it since something went wrong.
    try {
        return converter(value);
    } catch (err) {
        if (err instanceof TypeError) {
            return err;
        } else {
            throw err;
        }
    }
}


// A pass-through "converter".
function pass_through(val) {
    return val;
}
