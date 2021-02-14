import faker from 'faker';
import { container } from 'tsyringe';
import { QueryFailedError, Repository } from 'typeorm';
import { Services } from '../../../../src/common/constants';
import { DEFAULT_IDS } from '../../../../src/core/constants';
import { CoreManager } from '../../../../src/core/coreManager';
import { IResponseCore } from '../../../../src/core/interfaces';
import { Core as CoreModel } from '../../../../src/core/models/core';
import { CoreNotFoundError } from '../../../../src/core/models/errors';
import { ResponseCore } from '../../../../src/core/models/responseCore';
import { CORE_IDS_RANGES_SIZES, createFakeCore } from '../../../utils/db';
import { CurrentAllocatedID, InputCore } from '../../../../src/core/types';

let coreManager: CoreManager;

const initialAllocationIDs = DEFAULT_IDS;

beforeEach(() => {
  container.clearInstances();
  container.register(Services.LOGGER, { useValue: { log: jest.fn() } });
  container.register('CORE_IDS_RANGES_SIZES', { useValue: CORE_IDS_RANGES_SIZES });
  container.register('InitialAllocationIDs', { useValue: { initialAllocationIDs } });
});

describe('CoreManager', () => {
  const find = jest.fn();
  const findOne = jest.fn();
  const create = jest.fn();
  const save = jest.fn();
  const initialFakeCore = createFakeCore();

  beforeEach(() => {
    const coreRepository = ({ find, findOne, create, save } as unknown) as Repository<CoreModel>;
    container.register('CoreRepository', { useValue: coreRepository });
    coreManager = container.resolve(CoreManager);
  });
  afterEach(() => {
    find.mockClear();
    findOne.mockClear();
    create.mockClear();
    save.mockClear();
  });

  describe('constructor', () => {
    it(`Should be able to resolve to a CoreManager instance with initalized IDs`, () => {
      const initialSize = faker.random.number({ min: 0 });
      const initialAllocationIDs: CurrentAllocatedID = { node: initialSize, way: initialSize, relation: initialSize, changeset: initialSize };

      // Re-register values for DI
      container.register('CORE_IDS_RANGES_SIZES', { useValue: CORE_IDS_RANGES_SIZES });
      container.register('InitialAllocationIDs', { useValue: initialAllocationIDs });

      const coreManager = container.resolve(CoreManager);

      expect(coreManager.currentAllocatedIDs).toStrictEqual(initialAllocationIDs);
    });
  });
  describe('findCoreById', () => {
    it('If a core with the specified coreID is found, then this core should be returned', async () => {
      findOne.mockResolvedValue(initialFakeCore);

      const core = await coreManager.findCoreById(initialFakeCore.coreID);

      expect(core).toHaveProperty('coreID', initialFakeCore.coreID);
      expect(core).toBeInstanceOf(ResponseCore);
    });
    it('When coreID is not found, then expect an error', async () => {
      findOne.mockResolvedValue(undefined);

      const core = coreManager.findCoreById('');

      await expect(core).rejects.toThrow(CoreNotFoundError);
    });
    it('When internal typeorm method `findOne` throws an error, then expect an error', async () => {
      findOne.mockRejectedValue(new QueryFailedError('', undefined, ''));

      const core = coreManager.findCoreById('');

      await expect(core).rejects.toThrow(QueryFailedError);
    });
  });
  describe('findCores', () => {
    it('Should get all allocated cores', async () => {
      find.mockResolvedValue([initialFakeCore]);

      const cores = await coreManager.findCores();

      expect(cores).toHaveLength(1);
      expect(cores[0]).toBeInstanceOf(ResponseCore);
    });
    it('When internal typeorm method `find` throws an error, then expect an error', async () => {
      find.mockRejectedValue(new QueryFailedError('', undefined, ''));

      const cores = coreManager.findCores();

      await expect(cores).rejects.toThrow(QueryFailedError);
    });
  });
  describe('allocateIDs', () => {
    it('Should allocate a new core', async () => {
      const fakeCore = createFakeCore(CORE_IDS_RANGES_SIZES[initialFakeCore.coreSize] + 1);
      const fakeRequestedCore: InputCore = { coreSize: fakeCore.coreSize, description: fakeCore.description };
      create.mockResolvedValue(fakeCore);
      save.mockResolvedValue(fakeCore);

      const startID = CORE_IDS_RANGES_SIZES[initialFakeCore.coreSize] + 1;
      const endID = startID + CORE_IDS_RANGES_SIZES[fakeRequestedCore.coreSize] - 1;
      type ExpectedCore = Omit<IResponseCore, 'id' | 'coreID'>;
      const expectedCore: ExpectedCore = {
        ...fakeRequestedCore,
        allocatedNodeIdStart: startID,
        allocatedNodeIdEnd: endID,
        allocatedWayIdStart: startID,
        allocatedWayIdEnd: endID,
        allocatedRelationIdStart: startID,
        allocatedRelationIdEnd: endID,
        allocatedChangesetIdStart: startID,
        allocatedChangesetIdEnd: endID,
      };

      const core = await coreManager.allocateIDs(fakeRequestedCore);

      expect(core).toMatchObject<ExpectedCore>(expectedCore);
    });
    it('When internal typeorm method `save` throws an error, then expect an error', async () => {
      const fakeCore = createFakeCore(CORE_IDS_RANGES_SIZES[initialFakeCore.coreSize] + 1);
      const fakeRequestedCore = { coreSize: fakeCore.coreSize, description: fakeCore.description } as CoreModel;

      create.mockResolvedValue(fakeCore);
      save.mockRejectedValue(new QueryFailedError('', undefined, ''));

      const core = coreManager.allocateIDs(fakeRequestedCore);

      await expect(core).rejects.toThrow(QueryFailedError);
    });
  });
});
