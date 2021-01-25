import { RESPONSE_CORE_ID_COLUMNS, ID_TYPES, CORE_ID_COLUMNS, CORE_SIZES } from './constants';
import { ICore } from './interfaces';

export type CoreSize = typeof CORE_SIZES[number];
export type CoreIDColumn = typeof CORE_ID_COLUMNS[number];
export type IDType = typeof ID_TYPES[number];
export type ResponseCoreIDColumn = typeof RESPONSE_CORE_ID_COLUMNS[number];
export type CoreCurrentAllocatedIDsRange = Record<CoreIDColumn, string>;
export type CurrentAllocatedID = Record<IDType, number>;
export type ColumnsToTypesMapping = Record<CoreIDColumn, IDType>;
export type InputCore = Pick<ICore, 'description' | 'coreSize'>;
export type CalculatedCore = Pick<
  ICore,
  'description' | 'coreSize' | 'allocatedNodeIDsRange' | 'allocatedWayIDsRange' | 'allocatedRelationIDsRange' | 'allocatedChangesetIDsRange'
>;
