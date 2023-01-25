/**
 * Minor utilities, separated here for an easier maintenance and cleaner code.
 * 
 * Warning: the functions rely on the built-in implementation of the `fetch` function.
 * This is available on version 18 or higher of the underlying node.js environment )in version 18
 * the feature is labelled as "experimental", which means that, by default, node.js
 * issues a warning.
 *
 * 
 * @packageDocumentation
 */

import { Graph, Constants, TestEntry, TestResult } from './types';
import { RDFCanon }                                from 'rdfjs-c14n';
import * as rdfn3                                  from './rdfn3';


/**
 * Get the list of all tests, which is an array in the manifest file. The manifest 
 * itself is fetched from the github repository. The necessary URL fragments are separated in 
 * the `./types` module.
 * 
 * 
 * @param manifest_name 
 * @returns 
 */
export async function getTestList(manifest_name: string): Promise<TestEntry[]> {
    const fetch_json = async (fname: string): Promise<string> => {
        const manif = await fetch(fname);
        return manif.json();           
    };

    const manifest: any = await fetch_json(`${Constants.TEST_DIR}${manifest_name}`);
    return manifest["entries"] as TestEntry[];
}

/**
 * Handle a single test: the test, and its requested canonical equivalents are parsed,
 * the input is canonicalized, and the three datasets (input, canonical, and requested) are
 * serialized back into nquads, with the latter two compared. Comparison is made by 
 * comparing the arrays of nquads in order as strings.
 * 
 * (It might have been possible to compare the quads by comparing their hash values...)
 * 
 * @param test 
 * @param canonicalizer 
 * @returns 
 */
export async function singleTest(test: TestEntry, canonicalizer: RDFCanon): Promise<TestResult> {
    interface TestPair {
        input    : string,
        expected : string,
    }

    //
    // Get the nquad representation of a single test, and of its requested canonical pair,
    // fetched from the github repository. The necessary URL fragments are separated in 
    // the `./types` module.
    //
    //
    const getTestPair = async (test: TestEntry): Promise<TestPair> => {
        const fetch_text = async (fname: string): Promise<string> => {
            const nqp = await fetch(fname);
            return nqp.text();           
        };
    
        const [input, expected] = await Promise.all([
            fetch_text(`${Constants.TEST_DIR}${test.action}`),
            fetch_text(`${Constants.TEST_DIR}${test.result}`)
        ]);
        return {input, expected}
    };

    // Compare to arrays of nquads line by line and in order...
    const compareNquads = (left: string[], right: string[]): boolean => {
        if (left.length !== right.length) {
            return false;
        } else {
            for (let index = 0; index < left.length; index++) {
                if (left[index] !== right[index]) {
                    return false;
                }
            }
            return true;
        }    
    };

    // Get the test and the expected result from the test entry;
    // the returned values are strings of nquads.
    const { input, expected } = await getTestPair(test);

    // Get the three graphs in 'real' graph including the canonicalized one.
    const input_graph: Graph    = rdfn3.getQuads(input);
    const expected_graph: Graph = rdfn3.getQuads(expected);
    const c14n_graph: Graph     = canonicalizer.canonicalize(input_graph) as Graph;

    // Serialize the three graphs/datasets. The last two will be compared; if they match, the test passes.
    const input_nquads: string[]    = rdfn3.graphToOrderedNquads(input_graph);
    const expected_nquads: string[] = rdfn3.graphToOrderedNquads(expected_graph);
    const c14n_nquads: string[]     = rdfn3.graphToOrderedNquads(c14n_graph);

    return {
        id : test.id,
        input_nquads, c14n_nquads, expected_nquads,
        pass: compareNquads(c14n_nquads, expected_nquads)
    };
}
