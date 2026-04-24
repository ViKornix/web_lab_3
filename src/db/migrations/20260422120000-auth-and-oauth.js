'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      vk_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      yandex_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      passwd_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      passwd_salt: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable('token', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM('access', 'refresh'),
        allowNull: false,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jti: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      replaced_by_jti: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('token', ['user_id']);
    await queryInterface.addIndex('token', ['type', 'revoked']);

    await queryInterface.addColumn('movies', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addIndex('movies', ['user_id']);
    await queryInterface.removeColumn('movies', 'added_by');
  },

  async down(queryInterface) {
    await queryInterface.addColumn('movies', 'added_by', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
    await queryInterface.removeIndex('movies', ['user_id']);
    await queryInterface.removeColumn('movies', 'user_id');
    await queryInterface.removeIndex('token', ['type', 'revoked']);
    await queryInterface.removeIndex('token', ['user_id']);
    await queryInterface.dropTable('token');
    await queryInterface.dropTable('user');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_token_type";');
  },
};
