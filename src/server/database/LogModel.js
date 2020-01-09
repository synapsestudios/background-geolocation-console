import Sequelize from 'sequelize';
import definedSequelizeDb from './define-sequelize-db';

const LogModel = definedSequelizeDb.define(
  'logs',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // log entry
    entry: { type: Sequelize.TEXT },

    // device metadata
    device_id: { type: Sequelize.TEXT },
    uploaded_at: { type: Sequelize.DATE },
    version: { type: Sequelize.TEXT },
    manufacturer: { type: Sequelize.TEXT },
    platform: { type: Sequelize.TEXT },
    model: { type: Sequelize.TEXT },
  },
  {
    timestamps: false,
    indexes: [{ fields: ['uploaded_at'] }],
  }
);

export default LogModel;
