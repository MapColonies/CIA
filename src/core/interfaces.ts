import { CoreSize } from 'src/core/models/core';

export interface CurrentAllocatedID {
  [index: string]: number;
  node: number;
  way: number;
  relation: number;
  changeset: number;
}
export interface IDsRangesSizes {
  small: number;
  medium: number;
  large: number;
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