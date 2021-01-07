import { ICore, IResponseCore } from './interfaces';

export type CoreSize = 'small' | 'medium' | 'large';
export type CoreIDColumnTypes = keyof Pick<
  ICore,
  'allocatedNodeIDsRange' | 'allocatedWayIDsRange' | 'allocatedRelationIDsRange' | 'allocatedChangesetIDsRange'
>;
export type IDTypes = 'node' | 'way' | 'relation' | 'changeset';
export type ResponseCoreIDColumnTypes = keyof Pick<
  IResponseCore,
  | 'allocatedNodeIdStart'
  | 'allocatedNodeIdEnd'
  | 'allocatedWayIdStart'
  | 'allocatedWayIdEnd'
  | 'allocatedRelationIdStart'
  | 'allocatedRelationIdEnd'
  | 'allocatedChangesetIdStart'
  | 'allocatedChangesetIdEnd'
>;
export type CurrentAllocatedID = Record<IDTypes, number>;