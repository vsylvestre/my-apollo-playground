const { startApollo } = require('./server/server.js');
const { connectToDB } = require('./server/db');

async function launch() {
  const db = await connectToDB();
  const server = startApollo(db);

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  });
}

// Let's go!
launch();