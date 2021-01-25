import { CurrentAllocatedID, ColumnsToTypesMapping } from 'src/core/types';

export const ID_TYPES = ['node', 'way', 'relation', 'changeset'] as const;
export const RESPONSE_CORE_ID_COLUMNS = [
  'allocatedNodeIdStart',
  'allocatedNodeIdEnd',
  'allocatedWayIdStart',
  'allocatedWayIdEnd',
  'allocatedRelationIdStart',
  'allocatedRelationIdEnd',
  'allocatedChangesetIdStart',
  'allocatedChangesetIdEnd',
] as const;
export const CORE_ID_COLUMNS = ['allocatedNodeIDsRange', 'allocatedWayIDsRange', 'allocatedRelationIDsRange', 'allocatedChangesetIDsRange'] as const;
export const CORE_SIZES = ['small', 'medium', 'large'] as const;
export const COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE: ColumnsToTypesMapping = {
  allocatedNodeIDsRange: 'node',
  allocatedWayIDsRange: 'way',
  allocatedRelationIDsRange: 'relation',
  allocatedChangesetIDsRange: 'changeset',
};
export const DEFAULT_IDS: CurrentAllocatedID = { node: 0, way: 0, relation: 0, changeset: 0 };
