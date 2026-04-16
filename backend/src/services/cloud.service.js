const imagekit = require('@imagekit/nodejs')

async function imageURL(path,name){

    const client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    });
    
    const response = await client.files.upload({
      file: fs.createReadStream(path),
      fileName: name,
    });
    
    return response
}

module.exports = imageURL