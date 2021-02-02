require("dotenv/config");
const {token} = require("./../workers/common/inspector"), readline =require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

const decode=_=>{
    console.log("\nUsing SSH from your env variable.\n");
    readline.question("token to decode:",(value)=>{
        try{
            console.log("Value starts below.");
            console.log(token.verify(value));
        }catch(e){
            console.log(String(e).includes("invalid signature")?"INVALID SSH":e);
        }
        readline.question("\nAnother? (y/n): ",(resp)=>{
            if(resp.toLowerCase().trim() == 'y'){
                decode();
            } else process.exit(0);
        })
    })
};
decode();
