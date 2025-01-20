import { GeneralAgent } from "./src/agents/general-agent";

const generalAgent = new GeneralAgent();
const stream = await generalAgent.execute("add 124213+93219 and then multiply the result by 5.2");

for await (const message of stream) {
	console.log(message);
}

console.log(generalAgent.getMessages());