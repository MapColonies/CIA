import { CurrentAllocatedID, CoreIDColumnTypes, IDTypes } from 'src/core/types';

export const COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE: Record<CoreIDColumnTypes, IDTypes> = {
    allocatedNodeIDsRange: 'node',
    allocatedWayIDsRange: 'way',
    allocatedRelationIDsRange: 'relation',
    allocatedChangesetIDsRange: 'changeset',
  };
  
  export const DEFAULT_IDS: CurrentAllocatedID = { node: 0, way: 0, relation: 0, changeset: 0 } as CurrentAllocatedID;
  