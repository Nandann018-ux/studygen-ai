const mongoose = require('mongoose');

function encodeMongoPassword(uri) {
  const protocolEnd = uri.indexOf('://');
  if (protocolEnd === -1) return uri;

  const afterProtocol = uri.slice(protocolEnd + 3); // authority + path
  const firstSlash = afterProtocol.indexOf('/');
  const authority = firstSlash === -1 ? afterProtocol : afterProtocol.slice(0, firstSlash);
  const rest = firstSlash === -1 ? '' : afterProtocol.slice(firstSlash);

  const lastAt = authority.lastIndexOf('@');
  if (lastAt === -1) return uri; // no credentials section

  const creds = authority.slice(0, lastAt);
  const host = authority.slice(lastAt + 1);

  const firstColon = creds.indexOf(':');
  if (firstColon === -1) return uri; // not in username:password form

  const username = creds.slice(0, firstColon);
  const password = creds.slice(firstColon + 1);

  // Mongo URI parsing breaks if password contains unescaped `@`.
  const passwordEncoded = password.replace(/@/g, '%40');

  const newAuthority = `${username}:${passwordEncoded}@${host}`;
  const protocol = uri.slice(0, protocolEnd + 3);
  return `${protocol}${newAuthority}${rest}`;
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  const preview = uri ? uri.slice(0, 12) : 'undefined';
  console.log(`MONGO_URI preview: ${preview}${uri && uri.length > 12 ? '...' : ''}`);

  if (!uri) {
    console.error('Missing `MONGO_URI` in environment variables.');
    process.exit(1);
  }

  try {
    const finalUri = encodeMongoPassword(uri);
    console.log('Connecting to MongoDB...');
    await mongoose.connect(finalUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

module.exports = { connectDB };

