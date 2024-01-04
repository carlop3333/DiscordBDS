import * as bedrock_prot from "bedrock-protocol";

//we always know the options are going to be here
const options = JSON.parse(process.argv[2]);

const client = bedrock_prot.createClient(options);