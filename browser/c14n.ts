import {RDFC10, InputDataset} from 'rdfjs-c14n';

export function canonicalize(inp: string): string {
    const rdfc10 = new RDFC10();
    const out = rdfc10.canonicalize(inp as InputDataset);
    return out;
}
