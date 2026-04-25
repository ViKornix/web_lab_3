'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('user', 'passwd_salt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'passwd_salt', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
