
async function main(): Promise<void> {
    const get_nq = async (test: string): Promise<string> => {
        const nqp = await fetch(`https://raw.githubusercontent.com/w3c/rdf-canon/main/tests/urdna2015/${test}`);
        return nqp.text();
    }

    const test: string = "test002-in.nq";
    console.log(`Fetching ${test}`);
    const nq = await get_nq(test);
    console.log(nq);
}

main();
