import { defaults } from 'lodash';
import { StringValueObject } from 'src/common/types/indexable_types';
import { IDsRangesSizes } from '../interfaces';

// Extract env vars starting with 'IDS_RANGES_SIZES_' and fallback to hardcoded values
export const IDS_RANGES_SIZES: IDsRangesSizes = defaults(
  {
    small: process.env.IDS_RANGES_SIZES_SMALL,
    medium: process.env.IDS_RANGES_SIZES_MEDIUM,
    large: process.env.IDS_RANGES_SIZES_LARGE,
  },
  {
    small: 10000,
    medium: 1000000,
    large: 100000000,
  }
);

export const COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE: StringValueObject = {
  allocatedNodeIDsRange: 'node',
  allocatedWayIDsRange: 'way',
  allocatedRelationIDsRange: 'relation',
  allocatedChangesetIDsRange: 'changeset',
};
