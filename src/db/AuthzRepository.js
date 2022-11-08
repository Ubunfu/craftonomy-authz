const { Sequelize, Model, DataTypes } = require('sequelize')

function getDbConnString() {
    return process.env.DB_CONN_STRING || 'sqlite::memory';
}

const sequelize = new Sequelize(getDbConnString(), {
    logging: false
});

class App extends Model {}
class AppIdp extends Model {}
class AppClient extends Model {}
class AppGrant extends Model {}
class Idp extends Model {}
class UserScope extends Model {}
class UserIdp extends Model {}

App.init({
    appId: {
        field: 'app_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    appName: {
        field: 'app_name',
        type: DataTypes.STRING
    },
    appDescription: {
        field: 'app_description',
        type: DataTypes.STRING
    }
}, { sequelize, tableName: 'APP' })

Idp.init({
    idpId: {
        field: 'idp_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    issuerUrl: {
        field: 'issuer_url',
        type: DataTypes.STRING,
        allowNull: false
    },
    idpName: {
        field: 'idp_name',
        type: DataTypes.STRING
    },
    idpDescription: {
        field: 'idp_description',
        type: DataTypes.STRING
    }
}, { sequelize, tableName: 'IDP' })

AppIdp.init({
    appId: {
        field: 'app_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: {
            model: App,
            key: 'app_id'
        }
    },
    idpId: {
        field: 'idp_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Idp,
            key: 'idp_id'
        }
    }
}, { sequelize, tableName: 'APP_IDP' })

AppClient.init({
    clientId: {
        field: 'client_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    secret: {
        field: 'secret',
        type: DataTypes.STRING
    },
    appId: {
        field: 'app_id',
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: App,
            key: 'app_id'
        }
    }
}, { sequelize, tableName: 'APP_CLIENT' })

AppGrant.init({
    appId: {
        field: 'app_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: {
            model: App,
            key: 'app_id'
        }
    },
    grantType: {
        field: 'grant_type',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    }
}, { sequelize, tableName: 'APP_GRANT' })

UserScope.init({
    email: {
        field: 'email',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    scope: {
        field: 'scope',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    }
}, { sequelize, tableName: 'USER_SCOPE' })

UserIdp.init({
    email: {
        field: 'email',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    idpId: {
        field: 'idp_id',
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Idp,
            key: 'idp_id'
        }
    }
}, { sequelize, tableName: 'USER_IDP' })

module.exports = {
    sequelize,
    App,
    AppIdp,
    AppClient,
    AppGrant,
    Idp,
    UserScope,
    UserIdp
}