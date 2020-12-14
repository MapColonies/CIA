import { CoreSize } from './types/core';

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

export interface ResponseCore {
  id: number;
  coreID: string;
  allocatedNodeIdStart: number;
  allocatedNodeIdEnd: number;
  allocatedWayIdStart: number;
  allocatedWayIdEnd: number;
  allocatedRelationIdStart: number;
  allocatedRelationIdEnd: number;
  allocatedChangesetIdStart: number;
  allocatedChangesetIdEnd: number;
  coreSize: CoreSize;
  description: string;
}
