const jwt = require("jsonwebtoken"), {ssh} = require("../config/config.json"), readline =require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

const genJwt=_=>{
    readline.question("Value to sign:",(value)=>{
        console.log("Signed token starts below.");
        console.log(jwt.sign(value,ssh));
        readline.question("\nAnother? (y/n): ",(resp)=>{
            if(resp.toLowerCase().trim() == 'y'){
                genJwt();
            } else process.exit(0);
        })
    })
};
genJwt();
