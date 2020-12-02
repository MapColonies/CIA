import { Entity, Column, PrimaryGeneratedColumn, Generated, CreateDateColumn, UpdateDateColumn, Exclusion } from 'typeorm';

export type CoreSize = 'small' | 'medium' | 'large';

@Entity()
@Exclusion(`USING gist ("allocatedNodeIDsRange" WITH &&)`)
@Exclusion(`USING gist ("allocatedWayIDsRange" WITH &&)`)
@Exclusion(`USING gist ("allocatedRelationIDsRange" WITH &&)`)
@Exclusion(`USING gist ("allocatedChangesetIDsRange" WITH &&)`)
export class Core {
    @PrimaryGeneratedColumn()
    public readonly id!: number;
    
    @Column({ type: 'enum', update: false, enum: ['small', 'medium', 'large'], default: 'small' })
    public coreSize!: CoreSize;

    @Column({ type: 'character varying', length: 255 })
    public description!: string;

    @Column({ type: 'uuid', update: false, unique: true })
    @Generated('uuid')
    public readonly coreID!: string;

    @Column({ type: 'int8range' })
    private readonly allocatedNodeIDsRange!: string;

    @Column({ type: 'int8range' })
    private readonly allocatedWayIDsRange!: string;

    @Column({ type: 'int8range' })
    private readonly allocatedRelationIDsRange!: string;

    @Column({ type: 'int8range' })
    private readonly allocatedChangesetIDsRange!: string;

    @CreateDateColumn()
    private readonly allocationDateCreated!: string;

    @UpdateDateColumn()
    private readonly allocationDateUpdated!: string;
}