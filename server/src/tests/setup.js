process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.5';
process.env.MONGOMS_PLATFORM = process.env.MONGOMS_PLATFORM || 'linux';
process.env.MONGOMS_ARCH = process.env.MONGOMS_ARCH || 'x86_64';
process.env.MONGOMS_DOWNLOAD_URL =
  process.env.MONGOMS_DOWNLOAD_URL ||
  'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz';

delete process.env.http_proxy;
delete process.env.HTTP_PROXY;
delete process.env.https_proxy;
delete process.env.HTTPS_PROXY;

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: process.env.MONGOMS_VERSION,
      },
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error(
      'Failed to start in-memory MongoDB instance. Ensure the test environment can download the MongoDB binary or provide an offline cache via MONGOMS_DOWNLOAD_URL.',
      error
    );
    throw error;
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
