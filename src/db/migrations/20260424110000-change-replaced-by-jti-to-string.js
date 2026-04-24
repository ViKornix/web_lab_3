'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('token', 'replaced_by_jti', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.bulkUpdate('token', { replaced_by_jti: null }, {});

    await queryInterface.changeColumn('token', 'replaced_by_jti', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('token', { replaced_by_jti: null }, {});

    await queryInterface.changeColumn('token', 'replaced_by_jti', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.bulkUpdate('token', { replaced_by_jti: false }, {
      replaced_by_jti: null,
    });

    await queryInterface.changeColumn('token', 'replaced_by_jti', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
