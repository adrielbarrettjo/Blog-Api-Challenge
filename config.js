exports.DATABASE_URL = process.env.MONGODB_URI ||
                       global.MONGODB_URI||
                      "mongodb://dbuser:dbpassword@ds239387.mlab.com:39387/mongoose-app-thinkful";

exports.PORT = process.env.PORT || 8080;