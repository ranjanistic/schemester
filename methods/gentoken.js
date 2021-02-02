require("dotenv/config");
const {token} = require("../workers/common/inspector"), readline =require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

(_=>{
    console.log("\nUsing SSH from your env variable.\n");
    readline.question("Value to sign:",(value)=>{
        console.log("Signed token starts below.");
        console.log(token.sign(value));
        readline.question("\nAnother? (y/n): ",(resp)=>{
            if(resp.toLowerCase().trim() == 'y'){
                genJwt();
            } else process.exit(0);
        })
    })
})();

