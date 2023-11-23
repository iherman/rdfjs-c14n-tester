import { RDFC10, C14nResult, BNodeId } from 'rdfjs-c14n';
import { parseNquads, quadsToNquads, concatNquads } from 'rdfjs-c14n/lib/common';

function toNquads(ttl: string): string {
    const nqs: string[] = quadsToNquads(parseNquads(ttl));
    nqs.sort();
    return concatNquads(nqs);
}

interface DisplayableResults {
    original_quads: string,
    c14n: string,
    c14n_quads: string;
}

async function process(original: string): Promise<DisplayableResults> {
    const change_bnodes = (map: ReadonlyMap<BNodeId, BNodeId>, ttl: string): string => {
        let retval = ttl;
        for (const key of map.keys()) {
            retval = retval.replaceAll(key, map.get(key));
        }
        return retval;
    }

    // Run the real deal:
    const results: C14nResult = await (new RDFC10()).c14n(original);

    // Collect the results
    const original_quads: string = toNquads(original);
    const c14n: string = change_bnodes(results.issued_identifier_map, original);
    const c14n_quads: string = results.canonical_form;

    return { original_quads, c14n, c14n_quads }
}


async function convert(): Promise<void> {
    const txtArea = (id: string): HTMLTextAreaElement => {
        const element = document.getElementById(id);
        if (element === null) {
            throw new Error(`Element #${id} does not exist!`);
        } else {
            return element as HTMLTextAreaElement;
        }
    };

    const text: HTMLTextAreaElement = txtArea("inp");
    const original = text.value;
    // alert(`before doit "${original}"`);
    try {
        const results = await process(original);

        const original_quads = txtArea("original_quads");
        const c14n = txtArea("c14n");
        const c14n_quads = txtArea("c14n_quads");

        original_quads.value = results.original_quads;
        c14n.value = results.c14n;
        c14n_quads.value = results.c14n_quads;
    } catch(e) {
        alert(e.message);
    }
}

window.addEventListener("load", () => {
    const button = document.getElementById("go");
    if (button === null) {
        throw new Error(`Element #go does not exist!`);
    } else {
        button.addEventListener("click", convert);
    }
})






// --------------------------

// const test: string = `
// @prefix ex: <http://example.com/#> .
// ex:p ex:q [
//     ex:p _:x2 ;
// ] .
// ex:p ex:q [
//     ex:p _:e3 ;
// ] .    
// _:x2 <http://example.com/#r> _:e3 .
// `;

// const result = process(test);

// console.log(`>>>> original: ${result.original}`);
// console.log(`>>>> original in nquads: \n${result.original_quads}`);
// console.log(`>>>> canonicalized: ${result.c14n}`);
// console.log(`>>>> canonicalized in nquads:\n${result.c14n_quads}`);

