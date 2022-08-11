qnum testing
------------
.. qnum::
    :prefix: Before-
    :suffix: -After
    :start: 5

Fill in the Blank
-----------------
.. fillintheblank:: test_fitb_string

    Fill in the blanks to make the following sentence: "The red car drove away."

    The |blank| car drove |blank|.

    -   :red: Correct.
        :x: Incorrect. Try 'red'.
    -   :away: Correct.
        :x: Incorrect. Try 'away'.

Test 2 - test a numeric range.

.. fillintheblank:: test_fitb_number

    .. If this isn't treated as a comment, then it will cause a **syntax error, thus producing a test failure.

    What is the solution to the following?

    :math:`2 * \pi =` |blank|.

    -   :6.28 0.005: Good job.
        :3.27 3: Try higher.
        :9.29 3: Try lower.
        :.*: Incorrect. Try again.

Error testing
-------------
.. fillintheblank:: error1_no_content

.. fillintheblank:: error2

    No feedback provided.

.. fillintheblank:: error3

    List contents aren't field lists.

    -   I'm not a field list.

.. fillintheblank:: error4

    Not enough feedback. |blank| |blank|

    -   :Feedback: For blank 1.

Regex testing
-------------
.. fillintheblank:: test_fitb_regex_1
   :casei:

   Complete the sentence: |blank| had a |blank| lamb. One plus one is: (note that if there aren't enough blanks for the feedback given, they're added to the end of the problem. So, we don't **need** to specify a blank here.)

   -   :mary|Mair[a|e|i]: Correct.
       :Sue: Is wrong.
       :wrong: Try again. (Note: the last item of feedback matches anything, regardless of the string it's given.)
   -   :little: That's right.
       :.*: Nope.
   -   :0b10: Right on! Numbers can be given in decimal, hex (0x10 == 16), octal (0o10 == 8), binary (0b10 == 2), or using scientific notation (1e1 == 10), both here and by the user when answering the question.
       :2 1: Close.... (The second number is a tolerance, so this matches 1 or 3.)
       :x: Nope. (As earlier, this matches anything.)

.. fillintheblank:: test_fitb_regex_2
   :casei:

   Windows system files are stored in: |blank|.

   -   :C\:\\Windows\\system: Correct.
       :program files: Third party applications are stored here, not system files.
       :x: Try again.

.. fillintheblank:: test_fitb_regex_3
   :casei:

   Python lists are declared using: |blank|.

   -   :\[\]: Correct.
       :x: Try again.


Dynamic problem testing
-----------------------
TODO items:

-   Need a good basic math library.
-   Need a `good approximate equality test <https://docs.pytest.org/en/6.2.x/reference.html#pytest-approx>`_.

This problem demonstrates the basic syntax for a dynamic problem:

-   Define dynamic variables by placing JavaScript code in the ``:dyn_vars:`` option of a fill-in-the-blank problem.

    -   Use only the ``rand()`` function to generate random numbers. This function produces values from a seeded RNG; this seed is saved on the client or server and restored so the problem doesn't change every time the page is refreshed.
    -   Any arbitrary JavaScript code can be included, such as defining functions, temporary variables, ``for`` loops, etc.
    -   **Blank lines are not allowed** due to the way reStructuredText parses options -- instead, use a comment with no content for additional visual space. See the quadratic roots problem for an example.
    -   To include additional JavaScript libraries for use in your problems, follow `these directions <https://docs.readthedocs.io/en/stable/guides/adding-custom-css.html>`_. (Note that the Runestone authoring system is built on Sphinx).

-   Use ``v.``\ *variable_name* when creating variables inside the ``:dyn_vars:`` option for use in the problem. Everywhere else, use just *variable_name*.
-   Use the syntax ``<script-eval expr="JavaScript_variable_name_or_expression"></script-eval>`` to display the value of a variable or expression in the problem description or in the feedback.
-   Create named blanks in the problem description using the syntax ``:blank:`blank_name_here```. You may also used unnamed blanks as usual via ``|blank|``.
-   In the problem's feedback section, refer to a blank in any of three ways: the blank's name, ``ans`` (the student-provided answer for this blank), or the blank's index in ``ans_array`` (an array of all student-provided answers for this problem).
-   Optionally (though strongly recommended) provide a type converter for blanks in either of the three following ways:

    -   A dict of ``v.types = {blank0_name: converter0, blank1_name: converter1, ...}`` based on the blank's names.
    -   An array of ``v.types = [blank0_converter, blank1_converter, ...]`` based on the blank's index (order of appearance in the problem).
    -   A value of ``v.types = converter_for_all_blanks``.

    The converter is a function that takes a string (the raw value entered by a student) as input, returning the string converted to the appropriate type. If the converter isn't specified, then no conversion is performed. The standard JavaScript library provides the ``Number`` converter. [#converters]_ Converters bring a number of important advantages:

    -   Using a converter helps avoid unexpected results for expressions:

        -   Without conversion, the expression ``blank1 + blank2`` concatenates the two blanks as strings instead of adding them as numbers.
        -   Without conversion, The expression ``ans == 0`` is true if the answer was blank, since JavaScript converts an empty string to the value 0. Likewise, ``ans < 1`` is true for a blank answer.
    -   Converters allow `strict equality/inequality comparisons <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness>`_ in JavaScript (``===``/\ ``!==``).
    -   Converters provides a natural method to handle more complex types such as complex numbers, equations, matrices, etc.

The problems below convert their inputs using ``Number``.

.. fillintheblank:: test_fitb_dynamic_1
    :dyn_vars:
        v.a = Math.floor(rand()*10);
        v.b = Math.floor(rand()*10);
        v.types = {c: Number};

    .. raw:: html

        <p>What is <script-eval expr="a"></script-eval> + <script-eval expr="b"></script-eval>?</p>

    :blank:`c`

    -   :c === a + b:
            .. raw:: html

                Correct; <script-eval expr="a"></script-eval> + <script-eval expr="b"></script-eval> is <script-eval expr="c"></script-eval>. Note that <script-eval expr="ans"></script-eval> or <script-eval expr="ans_array[0]"></script-eval> also works.

        :c === a - b: That's subtraction.
        :c === a * b: That's multiplication.
        :x:
            .. raw:: html

                I don't know what you're doing; <script-eval expr="a"></script-eval> + <script-eval expr="b"></script-eval> is <script-eval expr="a + b"></script-eval>, not <script-eval expr="c"></script-eval>.


This problem demonstrates some of the possibilities and challenges in dynamic problems:

-   The solution gets computed on the client, which makes the problems vulnerable to students peeking at the JavaScript console to get the correct answer. Hence, the need for server-side grading.
-   It's easy to include math. However, formatting math requires an optional plus sign -- negative numbers don't need it, while positive numbers do. Hence, use of the ``plus`` function below.
-   Solution checking requires some careful thought.

.. fillintheblank:: test_fitb_dynamic_2
    :dyn_vars:
        // The solution.
        v.ax1 = Math.floor(rand()*10);
        v.ax2 = Math.floor(rand()*10);
        //
        // Values used in showing the problem. Don't allow a to be 0!
        v.a = Math.floor(rand()*9) + 1;
        v.b = v.a * -(v.ax1 + v.ax2);
        v.c = v.a * v.ax1 * v.ax2;
        //
        // Formatting niceness: put a plus in front on non-negative values only.
        v.plus = x => x < 0 ? x : `+${x}`;
        //
        v.types = Number;

    .. raw:: html

        <p>What are the solutions to <script-eval expr="a"></script-eval>x^2 <script-eval expr="plus(b)"></script-eval>x <script-eval expr="plus(b)"></script-eval> = 0? For repeated roots, enter the same value in both blanks.</p>

    TODO: in reST, I can't put these in a math expression. Hopefully, it works in PreTeXt.

    :blank:`sx1`, :blank:`sx2`

    Notes:

    -   ``ax1`` is short for "answer for x1"; ``sx1`` is "student's answer for x1".
    -   The first answer grades either root as correct.
    -   The second answer checks that the student isn't answering with the same value twice -- unless this happens to be a repeated root.
    -   The second hint has to be smart: if the first blank contained the second answer, then show the first answer as a hint.

    Writing dynamic problems is, fundamentally, hard. However, it produces an infinite stream of problems.

    -   :ans === ax1 || ans === ax2: Correct!
        :x:
            .. raw:: html

                Try <script-eval expr="ax1"></script-eval>.

    -   :(ans === ax1 || ans === ax2) && (sx1 !== sx2 || ax1 === ax2): Correct!
        :x:
            .. raw:: html

                Try <script-eval expr="sx1 === ax2 ? ax1 : ax2"></script-eval>.


.. fillintheblank:: test_fitb_dynamic_3
    :dyn_vars:
        // The correct answer, in percent.
        v.correct = Math.round(rand()*100)
        // Update the image.
        v.beforeCheckAnswers = v => svg_rect.width.baseVal.valueAsString = v.a + "%"
        v.types = Number

    This demonstrates drawing using an SVG as part of a dynamic problem. The percentage entered changes the image drawn.

    .. raw:: html

        <svg version="1.1"
            width="300" height="200"
            xmlns="http://www.w3.org/2000/svg">
            <rect id="svg_rect" width="100%" height="100%" fill="red" />
            <circle cx="150" cy="100" r="80" fill="green" />
            <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
        </svg>

    Guess a percentage! :blank:`a`\ %

    -   :a === correct: Correct!
        :x:
            .. raw:: html

                Try <script-eval expr="correct"></script-eval>.


.. raw:: html

    <script src="https://educ.jmu.edu/~waltondb/dynamic_fitb/btmExpressions.js"></script>
    <script src="https://jsxgraph.org/distrib/jsxgraphcore.js"></script>


.. fillintheblank:: test_fitb_dynamic_4
    :dyn_vars:
        // Initialize environment
        v._menv = new BTM({'rand': rand});
        v.jsxid = v.divid + "-jsx";
        // Initialize problem parameters
        v.a = v._menv.addParameter('a', { mode:'random', min:-4, max:3, by:0.1, prec:0.1 });
        v.b = v._menv.addParameter('b', { mode:'random', min:-4, max:5, by:0.1, prec:0.1 });
        v.dx = v._menv.addParameter('dx', { mode:'random', min:0.4, max:3, by:0.1, prec:0.1 });
        v.dy = v._menv.addParameter('dy', { mode:'random', min:-3, max:3, by:0.1, prec:0.1 });
        v.c = v._menv.addParameter('c', { mode:'calculate', formula:'a+dx', prec:0.1 });
        v.d = v._menv.addParameter('d', { mode:'calculate', formula:'b+dy', prec:0.1 });
        v.m = v.dy/v.dx;
        v.bint = v.b-v.m*v.a;
        // Equation of the line
        v.pointSlope = v._menv.addExpression('pointSlope', {
            formula: '{{dy}}/{{dx}}*(x-{{a}})+{{b}}'
        }).reduce();
        // Declare answer parsers
        v.types = v._menv.getParser();
        // Setup post-processing function
        v.afterContentRender = v => {
            // Assign a unique ID to the div used for JSXGraph.
            document.getElementById(v.divid).querySelector(".jxgbox").id = v.jsxid;
            // Create the graph
            const board = JXG.JSXGraph.initBoard(v.jsxid, {boundingbox: [-6, 6, 6, -6], axis:true});
            const P1 = board.create('point', [v.a, v.b], {name: 'P_1', fixed: true});
            const P2 = board.create('point', [v.c, v.d], {name: 'P_2', fixed: true});
            board.create('line', [P1, P2]);
        };

    Can we include a randomly generated graph?

    .. raw:: html

        <div class="jxgbox" style="width:300px; height:300px;"></div>

        <p>Find the equation of the line passing through the points P_1 = (<script-eval expr="a"></script-eval>, <script-eval expr="b"></script-eval>) and P_2 = (<script-eval expr="c"></script-eval>, <script-eval expr="d"></script-eval>).</p>

    TODO: render the points using MathJax.

    :math:`y =` :blank:`formula`

    -   :_menv.compareExpressions(pointSlope, formula): Correct!
        :x:
            .. raw:: html

                Try again! The answer is <script-eval expr="pointSlope"></script-eval>.


Footnotes
---------
.. [#converters]

    While JavaScript provides ``Date`` and ``Date.parse`` converters, there's a lot of subtlety in time zones making this difficult to use for most cases. Likewise, ``Boolean`` makes little sense although it's available. It's possible to use ``Math.round``, but again this makes little sense for most cases (should a student answer of 3.4 correctly compare to a solution of 3?).

    It might be useful to write a  ``CleanString`` converter to remove leading and trailing spaces in a blank and provide equality operators that ignore multiple spaces, capitalization, etc. However, what sort of dynamic problems would be able to correctly grade string answers?


qnum reset
----------
Reset ``qnum`` values to prevent affecting other problems.

.. qnum::
    :prefix:
    :suffix:
