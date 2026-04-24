import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    AllowNull,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

export type UserAttributes = {
    id: number;
    phone: string | null;
    yandexId: string | null;
    passwdHash: string | null;
    passwdSalt: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type UserCreationAttributes = Optional<
    UserAttributes,
    | 'id'
    | 'phone'
    | 'yandexId'
    | 'passwdHash'
    | 'passwdSalt'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
>;

@Table({
    tableName: 'user',
    underscored: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING, field: 'phone' })
    declare phone: string | null;

    @AllowNull(true)
    @Column({ type: DataType.STRING, field: 'yandex_id' })
    declare yandexId: string | null;

    @AllowNull(true)
    @Column({ type: DataType.STRING, field: 'passwd_hash' })
    declare passwdHash: string | null;

    @AllowNull(true)
    @Column({ type: DataType.STRING, field: 'passwd_salt' })
    declare passwdSalt: string | null;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @DeletedAt
    declare deletedAt: Date | null;
}
