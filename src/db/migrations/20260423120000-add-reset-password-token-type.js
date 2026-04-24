'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_token_type"
      ADD VALUE IF NOT EXISTS 'reset_password';
    `);
  },

  async down() {},
};
