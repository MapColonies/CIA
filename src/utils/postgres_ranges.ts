type Bound = 'upper' | 'lower';
type Inclusion = 'open' | 'closed';

export function rangeFormatter(start: number, end: number, inclusion: Inclusion = 'closed'): string {
    return inclusion === 'closed' ? `[${start}, ${end}]` : `(${start}, ${end})`;
}

export function getIntRangeBound(range: string, bound: Bound = 'lower', inclusion: Inclusion = 'closed'): number {
  const [lower, upper] = range.split(',');
  let add = 0;
  let end;

  if (bound === 'lower') {
    const lowerBoundInclusion: Inclusion = lower.startsWith('[') ? 'closed' : 'open';
    end = Number(lower.substring(1, lower.length));
    if (inclusion === 'closed') add += lowerBoundInclusion === 'closed' ? 0 : 1;
    else add -= lowerBoundInclusion === 'open' ? 0 : 1;
  } else {
    const upperBoundInclusion: Inclusion = upper.endsWith(']') ? 'closed' : 'open';
    end = Number(upper.substring(0, upper.length - 1));
    if (inclusion === 'closed') add -= upperBoundInclusion === 'closed' ? 0 : 1;
    else add += upperBoundInclusion === 'open' ? 0 : 1;
  }
  
  return end + add;
}

export function rangeToObj(startKey: string, endKey: string, range: string): Record<string, number> {
  const idsRange: Record<string, number> = {};
  idsRange[startKey] = getIntRangeBound(range, 'lower');
  idsRange[endKey] = getIntRangeBound(range, 'upper');
  return idsRange;
}
