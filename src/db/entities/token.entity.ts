import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement, ForeignKey, BelongsTo, CreatedAt
} from 'sequelize-typescript';
import {User} from "@entities/user.entity";
import {Optional} from "sequelize";



export enum TokenTypes {
    ACCESS = 'access',
    REFRESH = 'refresh',
    RESET_PASSWORD = 'reset_password'
}

export type TokenAttributes = {
    id: number,
    type: TokenTypes,
    hash: string,
    jti: string,
    expiresAt: Date,
    revoked: boolean,
    createdAt: Date,
    replacedByJti: string | null,
    userId: number,
    user: User
};
export type TokenCreationAttributes = Optional<
    TokenAttributes,
    | 'id'
|'createdAt'|'type'|'jti'|'replacedByJti'|'userId'|'user'|'expiresAt'|'revoked'|'hash'
>;

@Table({
    tableName: 'token',
    underscored: true,
    updatedAt: false
})
export class Token extends Model<TokenAttributes, TokenCreationAttributes> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.ENUM(...Object.values(TokenTypes)), field: 'type' })
    declare type: TokenTypes;

    @Column({type: DataType.STRING, field: 'hash'})
    declare hash: string

    @Column({type: DataType.STRING, field: 'jti'})
    declare jti: string

    @Column({type: DataType.DATE, field: 'expires_at'})
    declare expiresAt: Date

    @Column({type: DataType.BOOLEAN, field: 'revoked', defaultValue: false})
    declare revoked: boolean

    @CreatedAt
    declare createdAt: Date

    @Column({type: DataType.STRING, field: 'replaced_by_jti', allowNull: true})
    declare replacedByJti: string | null

    @ForeignKey(() => User)
    @Column
    userId: number

    @BelongsTo(()=> User)
    user: User
}
