exports.DATABASE_URL = process.env.MONGODB_URI ||
                       global.MONGODB_URI||
                      'mongodb://localhost/restaurants-app';
                      
exports.PORT = process.env.PORT || 8080;