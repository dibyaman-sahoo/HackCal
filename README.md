# HackCal — Scientific Binary Calculator

A scientific calculator that shows its own math happening in binary, live, as it computes.

![Main interface](assets/screenshots/hackcal-main.png)

## What it is

HackCal is a single-page scientific calculator. It looks and behaves like a normal phone calculator — one input line, tap or type an expression, hit `=` — but next to the keypad is a live trace panel. Every time an expression is evaluated, that panel animates through each individual operation the evaluator performed: it converts the numbers involved to binary and types out the operation, one character at a time, instead of dumping the final answer instantly.

## How it works

The app is built in three plain files with no framework and no build step.

**Input & parsing.** The display is a single text line, not two separate number boxes. Whatever you type or tap is kept as one expression string (e.g. `(45+385)*2-10`). On `=`, that string is tokenized and parsed with a hand-written recursive-descent parser into an expression tree, respecting normal precedence (`^` binds tighter than `× ÷`, which bind tighter than `+ −`, and parentheses override all of it).

**Evaluation & tracing.** The tree is walked node by node to compute the result. While it evaluates, every binary operation (`+ − × ÷ ^`) and every function call (`sin cos tan log ln sqrt`, plus unary `-` and `%`) is recorded into a trace list as it happens — the operand(s) and the result. Basic operators are labeled as ALU work (`ADD`, `SUB`, `MUL`, `DIV`, `POW`); transcendental functions are labeled as FPU work (`FPU SIN`, `FPU LOG10`, etc.), matching how a real processor splits that work between an integer/arithmetic unit and a floating-point unit.

**Binary conversion.** Each recorded number is converted into binary by splitting it into an integer part (repeated division by 2) and a fractional part (repeated multiplication by 2, extracting the leading bit each time, up to 14 bits).

**Animated playback.** Once evaluation finishes, the trace list is replayed step by step in the side panel: each operand's binary form is typed out character by character, then the operation is shown "executing," then the result's binary form types out the same way, before moving to the next step. Nothing is rendered all at once.

## Example

`(45 + 385) × 2 − 10 = 850`

1. **ADD** — `45` (`101101`) + `385` (`110000001`) → `430` (`110101110`)
2. **MUL** — `430` (`110101110`) × `2` (`10`) → `860` (`1101011100`)
3. **SUB** — `860` (`1101011100`) − `10` (`1010`) → `850` (`1101010010`)

The panel animates through exactly these three steps, in order, before the decimal answer settles in the display.
