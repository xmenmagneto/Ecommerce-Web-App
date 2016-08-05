module.exports = {
    database: 'mongodb://Deng:13919273153dtc@ds031925.mlab.com:31925/ecommerce_deng',
    port: 3000,
    secretKey: "TingchangDeng@Zhu",

    facebook: {
        clientID: process.env.FACEBOOK_ID || '1757809527841344',
        clientSecret: process.env.FACEBOOK_SECRET || 'ba36ff15fe7a45f11b727692dcc8ef27',
        profileFields: ['email', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }
};