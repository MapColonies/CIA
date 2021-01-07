import config from 'config';
import faker from 'faker';
import { IDsRangesSizes } from '../../src/core/interfaces';
import { Core as CoreModel } from '../../src/core/models/core';
import { CoreSize } from '../../src/core/types';

faker.locale = 'en';

export const CORE_IDS_RANGES_SIZES: IDsRangesSizes = {
  small: config.get<number>('core.sizes.small'),
  medium: config.get<number>('core.sizes.medium'),
  large: config.get<number>('core.sizes.large'),
};

export class DBUtils {
  public static createFakeCore = (startID = 1, coreSize?: CoreSize): CoreModel => {
    const keys = Object.keys(CORE_IDS_RANGES_SIZES);
    coreSize = coreSize ?? (keys[Math.floor(Math.random() * keys.length)] as CoreSize);
    const endID = startID + CORE_IDS_RANGES_SIZES[coreSize];

    const core = {
      coreSize: coreSize,
      description: faker.lorem.sentence(),
      allocatedNodeIDsRange: `[${startID}, ${endID})`,
      allocatedWayIDsRange: `[${startID}, ${endID})`,
      allocatedRelationIDsRange: `[${startID}, ${endID})`,
      allocatedChangesetIDsRange: `[${startID}, ${endID})`,
      id: faker.random.number({min: 1}),
      coreID: faker.random.uuid(),
    } as CoreModel;

    return core;
  };
}