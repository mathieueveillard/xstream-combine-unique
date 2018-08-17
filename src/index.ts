import { Stream } from 'xstream';

interface Wrapped<T> {
  id: number;
  wrapped: T;
}

interface WorkObject<T1, T2> {
  wrapped1: Wrapped<T1>;
  wrapped2: Wrapped<T2>;
  pass?: boolean;
}

export default function combineUnique<T1, T2>($1: Stream<T1>, $2: Stream<T2>): Stream<[T1, T2]> {
  /*
   * Implementation details: instead of implementing an operator as such,
   * we use a combination of existing operators.
   * 
   * ---1---------2----3------------------------4------- (1st arg)
   * -----a--------------------b-----c----d------------- (2nd arg)
   * -----[1,a]---[2,a][3,a]---[3,b]-[3,c][3,d]-[4,d]--- (combine)
   * -----{[1,a],true}---{[2,a],false}{[3,a],false}---{[3,b],true}... (fold and additional value set to true if both terms differ from the last true one)
   * -----[1,a]----------------------------------------[3,b]------... (filter)
   */

  // @ts-ignore
  return Stream.combine(wrap($1), wrap($2))
    .map(makeWorkObject)
    .fold(accumulateWorkObjects, null)
    .drop(1)
    .filter(shallPass)
    .map(destroyWorkObject);
}

function wrap<T>($: Stream<T>): Stream<Wrapped<T>> {
  let i = 0;
  return $.map((t: T) => ({
    id: i++,
    wrapped: t
  }));
}

function makeWorkObject<T1, T2>([wrapped1, wrapped2]: [Wrapped<T1>, Wrapped<T2>]): WorkObject<T1, T2> {
  return { wrapped1, wrapped2 };
}

function accumulateWorkObjects<T1, T2>(
  accumulator: WorkObject<T1, T2>,
  current: WorkObject<T1, T2>
): WorkObject<T1, T2> {
  if (isSeed(accumulator) || bothValuesHaveChanged(accumulator, current)) {
    return {
      ...current,
      pass: true
    };
  }
  return {
    ...accumulator,
    pass: false
  };
}

function isSeed<T1, T2>(workObject: WorkObject<T1, T2>): boolean {
  return workObject === null;
}

function bothValuesHaveChanged<T1, T2>(object1: WorkObject<T1, T2>, object2: WorkObject<T1, T2>): boolean {
  return object2.wrapped1.id !== object1.wrapped1.id && object2.wrapped2.id !== object1.wrapped2.id;
}

function shallPass<T1, T2>({ pass }: WorkObject<T1, T2>): boolean {
  return pass;
}

function destroyWorkObject<T1, T2>({ wrapped1, wrapped2 }: WorkObject<T1, T2>): [T1, T2] {
  return [unWrap(wrapped1), unWrap(wrapped2)];
}

function unWrap<T>({ wrapped }: Wrapped<T>): T {
  return wrapped;
}
