module.exports = {
    database: 'mongodb://Deng:13919273153dtc@ds031925.mlab.com:31925/ecommerce_deng',
    port: process.env.PORT,
    secretKey: "TingchangDeng@Zhu",  //secret key for sessions

    //facebook会被应用在middleware中
    facebook: {
        clientID: process.env.FACEBOOK_ID || '1757809527841344',
        clientSecret: process.env.FACEBOOK_SECRET || 'ba36ff15fe7a45f11b727692dcc8ef27',
        profileFields: ['emails', 'displayName'],  //array
        //after authentication, callback to redirect the user to profile page
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }
};