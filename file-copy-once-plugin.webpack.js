var fs = require('fs');

class FileCopyOncePlugin {
    constructor(pluginOptions) {
        this.from = pluginOptions.from
        this.to = pluginOptions.to
    }

    apply(compiler) {
      // emit is asynchronous hook, tapping into it using tapAsync, you can use tapPromise/tap(synchronous) as well
      compiler.hooks.emit.tap('FileCopyOncePlugin', (compilation, callback) => {
        // Create a header string for the generated file:
        try {
            if (fs.existsSync(this.to)) {
              //file exists
              console.log(this.to + ' already exists')
            }
            else {
                console.log('creating ' + this.to)
                fs.createReadStream(this.from).pipe(fs.createWriteStream(this.to));
            }
          } catch(err) {
            console.error(err)
          }
    
      });
    }
  }
  
  module.exports = FileCopyOncePlugin;