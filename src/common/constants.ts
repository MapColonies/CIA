export const DEFAULT_SERVER_PORT = 80;

export enum Services {
  LOGGER = 'ILogger',
  CONFIG = 'IConfig',
}

export const COLUMN_NAMES_TO_ID_STATE_HOLDER_TYPE: Record<string, string> = {
  allocatedNodeIDsRange: 'node',
  allocatedWayIDsRange: 'way',
  allocatedRelationIDsRange: 'relation',
  allocatedChangesetIDsRange: 'changeset',
};
