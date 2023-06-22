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

import { Graph, Constants, TestEntry, TestResult, TestTypes, Json } from './types';
import { RDFC10 }                                                   from 'rdfjs-c14n';
import * as rdfn3                                                   from './rdfn3';


/**
 * As its name says: fetch a JSON file and convert it into a 
 * @param fname 
 * @returns 
 */
export async function fetchJson(fname: string): Promise<Json> {
    const f = await fetch(fname);
    return f.json();
}


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
    const manifest: Json = await fetchJson(`${Constants.TEST_DIR}${manifest_name}`);
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
async function basicTest(test: TestEntry, canonicalizer: RDFC10): Promise<TestResult> {
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
    
        const [p_input, p_expected] = await Promise.allSettled([
            fetch_text(`${Constants.TEST_DIR}${test.action}`),
            fetch_text(`${Constants.TEST_DIR}${test.result}`)
        ]);

        const errors: string[] = [];

        if (p_input.status === "rejected") {
            errors.push("test graph data could not be read")
        } else if (p_expected.status === "rejected") {
            errors.push("expected graph data could not read")
        }

        if (errors.length > 0) {
            throw( errors.join("; "));
        } else {
            // Strictly speaking the test for status is unnecessary, but
            // tsc (or lint) complains...
            return {
                input    : p_input.status    === "fulfilled" ? p_input.value    : '', 
                expected : p_expected.status === "fulfilled" ? p_expected.value : ''
            }
        }
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
    const c14n_graph: Graph     = canonicalizer.canonicalizeDetailed(input_graph).canonicalized_dataset as Graph;

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
export async function singleTest(test: TestEntry, canonicalizer: RDFC10): Promise<TestResult> {
    try {
        switch (test.type) {
            case TestTypes.basic: 
                return basicTest(test, canonicalizer);
            case TestTypes.timeout:
                throw new Error("Timeout control testing not yet implemented");
            case TestTypes.info:
                throw new Error("Information test not yet implemented");
            default:
                throw new Error(`Unknown test type: ${test.type}`);
        }
    } catch(error) {
        throw (`${test.id}: ${error}`)
    }
}
