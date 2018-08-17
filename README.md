# xstream-combine-unique

An xstream operator that combines two streams using each event at most once. It's a derivative of xstream's regular [`combine()`](https://github.com/staltz/xstream#combine) operator.

## Marble diagram

```
input$1:    --1--------2-3--------------4-----5------
input$2:    ----1----------2------3-----------4------
output$:    ----[1,1]------[3,2]--------[4,3]-[5,4]--
```

## API

```TypeScript
import { Stream } from 'xstream';
export declare function combineUnique<T1, T2>($1: Stream<T1>, $2: Stream<T2>): Stream<[T1, T2]>;
```

The `combineUnique()` operator works only for 2 arguments.

## Installation

```
npm i xstream-combine-unique --save
```

## Usage

```TypeScript
import { Stream } from 'xstream';
import combineUnique from 'xstream-combine-unique';

const $1: Stream<string> = ...
const $2: Stream<number> = ...
const combined$: Stream<string, number> = combineUnique($1, $2);
```

## Commutativity

`combineUnique()` is almost [commutative](https://en.wikipedia.org/wiki/Commutative_property), as shown by the following passing test. Almost commutative only, because when arguments are commuted, the output stream must be mapped with a function that commutes the arrays in order to be strictly commutative.

```TypeScript
it("should be a commutative operator", function(done) {
  const $1: Stream<number> = Time.diagram("--1----2-3----------4-5--");
  const $2: Stream<number> = Time.diagram("----1------2--3-------4--");

  const combined$: Stream<[number, number]> = combineUnique($1, $2);
  const commutatedAndCombined$: Stream<[number, number]> = combineUnique($2, $1).map(commuteArray);

  Time.assertEqual(combined$, commutatedAndCombined$);
  Time.run(done);
});

function commuteArray<T1, T2>([a, b]: [T1, T2]): [T2, T1] {
  return [b, a];
}
```
