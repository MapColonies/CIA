import {
  Column, CreateDateColumn, Entity, Exclusion, Generated, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { ICore } from '../interfaces';
import { CoreSize } from '../types';

@Entity()
@Exclusion(`USING gist ("allocated_node_ids_range" WITH &&)`)
@Exclusion(`USING gist ("allocated_way_ids_range" WITH &&)`)
@Exclusion(`USING gist ("allocated_relation_ids_range" WITH &&)`)
@Exclusion(`USING gist ("allocated_changeset_ids_range" WITH &&)`)
export class Core implements ICore {
  @PrimaryGeneratedColumn({ name: 'id' })
  public readonly id!: number;

  @Column({
    name: 'core_size',
    type: 'enum',
    update: false,
    enum: ['small', 'medium', 'large'],
    default: 'small',
  })
  public coreSize!: CoreSize;

  @Column({ name: 'description', type: 'character varying', length: 255 })
  public description!: string;

  @Column({ name: 'core_id', type: 'uuid', update: false, unique: true })
  @Generated('uuid')
  public readonly coreID!: string;

  @Column({ name: 'allocated_node_ids_range', type: 'int8range' })
  public readonly allocatedNodeIDsRange!: string;

  @Column({ name: 'allocated_way_ids_range', type: 'int8range' })
  public readonly allocatedWayIDsRange!: string;

  @Column({ name: 'allocated_relation_ids_range', type: 'int8range' })
  public readonly allocatedRelationIDsRange!: string;

  @Column({ name: 'allocated_changeset_ids_range', type: 'int8range' })
  public readonly allocatedChangesetIDsRange!: string;

  @CreateDateColumn({ name: 'allocation_date_created' })
  public readonly allocationDateCreated!: string; // TODO: check if type can be changed to Date

  @UpdateDateColumn({ name: 'allocation_date_updated' })
  public readonly allocationDateUpdated!: string;
}
