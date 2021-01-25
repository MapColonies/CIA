import { CoreSize } from './types';

export type IDsRangesSizes = Record<CoreSize, number>;

export interface ICore {
  readonly id: number;
  coreSize: CoreSize;
  description: string;
  readonly coreID: string;
  readonly allocatedNodeIDsRange: string;
  readonly allocatedWayIDsRange: string;
  readonly allocatedRelationIDsRange: string;
  readonly allocatedChangesetIDsRange: string;
  readonly allocationDateCreated: Date;
  readonly allocationDateUpdated: Date;
}

export interface IResponseCore {
  readonly id: number;
  readonly coreID: string;
  readonly allocatedNodeIdStart: number;
  readonly allocatedNodeIdEnd: number;
  readonly allocatedWayIdStart: number;
  readonly allocatedWayIdEnd: number;
  readonly allocatedRelationIdStart: number;
  readonly allocatedRelationIdEnd: number;
  readonly allocatedChangesetIdStart: number;
  readonly allocatedChangesetIdEnd: number;
  readonly coreSize: CoreSize;
  readonly description: string;
}
