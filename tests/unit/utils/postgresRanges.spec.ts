import faker from 'faker';
import { rangeFormatter, getIntRangeBound, rangeToObj } from '../../../src/utils/postgresRanges';

let start: number, end: number;

beforeEach(() => {
  start = faker.random.number();
  end = faker.random.number({ min: start });
});
describe('postgresRanges', () => {
  describe('rangeFormatter', () => {
    it('Should response with PostgreSQL closed range', () => {
      const postgresRange = rangeFormatter(start, end, 'closed');

      expect(postgresRange).toBe(`[${start}, ${end}]`);
    });
    it('Should response with PostgreSQL open range', () => {
      const postgresRange = rangeFormatter(start, end, 'open');

      expect(postgresRange).toBe(`(${start}, ${end})`);
    });
  });
  describe('getIntRangeBound', () => {
    describe('lower bound', () => {
      it('When range is closed bounded, Should reponse with a valid closed bound', () => {
        const range = `[${start}, ${end}]`;

        const lower = getIntRangeBound(range, 'lower', 'closed');

        expect(lower).toBe(start);
      });
      it('When range is open bounded, Should reponse with a valid closed bound', () => {
        const range = `(${start}, ${end})`;

        const lower = getIntRangeBound(range, 'lower', 'closed');

        expect(lower).toBe(start + 1);
      });
      it('When range is open bounded, Should reponse with a valid open bound', () => {
        const range = `(${start}, ${end})`;

        const lower = getIntRangeBound(range, 'lower', 'open');

        expect(lower).toBe(start);
      });
      it('When range is closed bounded, Should reponse with a valid open bound', () => {
        const range = `[${start}, ${end}]`;

        const lower = getIntRangeBound(range, 'lower', 'open');

        expect(lower).toBe(start - 1);
      });
    });
    describe('upper bound', () => {
      it('When range is closed bounded, Should reponse with a valid closed bound', () => {
        const range = `[${start}, ${end}]`;

        const upper = getIntRangeBound(range, 'upper', 'closed');

        expect(upper).toBe(end);
      });
      it('When range is open bounded, Should reponse with a valid closed bound', () => {
        const range = `(${start}, ${end})`;

        const upper = getIntRangeBound(range, 'upper', 'closed');

        expect(upper).toBe(end - 1);
      });
      it('When range is closed bounded, Should reponse with a valid open bound', () => {
        const range = `[${start}, ${end}]`;

        const upper = getIntRangeBound(range, 'upper', 'open');

        expect(upper).toBe(end + 1);
      });
      it('When range is open bounded, Should reponse with a valid open bound', () => {
        const range = `(${start}, ${end})`;

        const upper = getIntRangeBound(range, 'upper', 'open');

        expect(upper).toBe(end);
      });
    });
  });
  describe('rangeToObj', () => {
    it('Should create a valid', () => {
      const startKey = faker.random.word();
      const endKey = faker.random.word();
      
      const range = rangeToObj(startKey, endKey, `[${start}, ${end}]`);

      const expected = { [startKey]: start, [endKey]: end }
      expect(range).toStrictEqual(expected);
    });
  });
});
