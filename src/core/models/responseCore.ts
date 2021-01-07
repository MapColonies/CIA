import { rangeToObj } from '../../utils/postgresRanges';
import { IResponseCore } from '../interfaces';
import { CoreSize } from '../types';
import { Core as CoreModel } from './core';

export class ResponseCore implements IResponseCore {
  public readonly id!: number;
  public readonly coreID!: string;
  public readonly allocatedNodeIdStart!: number;
  public readonly allocatedNodeIdEnd!: number;
  public readonly allocatedWayIdStart!: number;
  public readonly allocatedWayIdEnd!: number;
  public readonly allocatedRelationIdStart!: number;
  public readonly allocatedRelationIdEnd!: number;
  public readonly allocatedChangesetIdStart!: number;
  public readonly allocatedChangesetIdEnd!: number;
  public readonly coreSize!: CoreSize;
  public readonly description!: string;

  public constructor(core: CoreModel) {
    Object.assign(this, this.generateResponseCore(core));
  }

  public generateResponseCore(core: CoreModel): IResponseCore {
    const { allocatedNodeIDsRange, allocatedWayIDsRange, allocatedRelationIDsRange, allocatedChangesetIDsRange, ...partialResponseCore } = core;

    // Create a respone core witch transforms IDs allocation ranges to core ends
    const responseCore = {
      ...partialResponseCore,
      ...rangeToObj('allocatedNodeIdStart', 'allocatedNodeIdEnd', allocatedNodeIDsRange),
      ...rangeToObj('allocatedWayIdStart', 'allocatedWayIdEnd', allocatedWayIDsRange),
      ...rangeToObj('allocatedRelationIdStart', 'allocatedRelationIdEnd', allocatedRelationIDsRange),
      ...rangeToObj('allocatedChangesetIdStart', 'allocatedChangesetIdEnd', allocatedChangesetIDsRange),
    } as IResponseCore;
    return responseCore;
  }
}
