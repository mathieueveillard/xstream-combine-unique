import { describe, it } from 'mocha';
import { Stream } from 'xstream';
import { mockTimeSource } from '@cycle/time';
import combineUnique from '.';

const Time = mockTimeSource({ interval: 20 });

describe('Test of combineUnique()', function() {
  it('should combine as regular operator but wait for second stream values', function(done) {
    // GIVEN
    const $1: Stream<number> = Time.diagram('--1----2-3----------4-5--');
    const $2: Stream<number> = Time.diagram('----1------2--3-------4--');

    // WHEN
    const actual$: Stream<[number, number]> = combineUnique($1, $2);

    // THEN
    const expected$: Stream<[number, number]> = Time.diagram('----a------b--------c-d--', {
      a: [1, 1],
      b: [3, 2],
      c: [4, 3],
      d: [5, 4]
    });
    Time.assertEqual(actual$, expected$);
    Time.run(done);
  });

  it('should be a commutative operator', function(done) {
    const $1: Stream<number> = Time.diagram('--1----2-3----------4-5--');
    const $2: Stream<number> = Time.diagram('----1------2--3-------4--');

    const combined$: Stream<[number, number]> = combineUnique($1, $2);
    const commutatedAndCombined$: Stream<[number, number]> = combineUnique($2, $1).map(commuteArray);

    Time.assertEqual(combined$, commutatedAndCombined$);
    Time.run(done);
  });
});

function commuteArray<T1, T2>([a, b]: [T1, T2]): [T2, T1] {
  return [b, a];
}
