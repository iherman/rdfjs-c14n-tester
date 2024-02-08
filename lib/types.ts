/**
 * Type and constant specifications for the tester.
 * 
 * @packageDocumentation
 */

import * as rdf    from '@rdfjs/types';
import { BNodeId } from 'rdfjs-c14n';

export type Json = Record<string, unknown> ;

export type IDMapping = Record<BNodeId,BNodeId>;

export namespace Constants {
    /** 
     * URL of the directory within the github repository where the tests reside.
     * The test manifest entries for the tests (see {@link TestEntry}) contain
     * relative addresses for the individual tests, which must be concatenated with this
     * URL.
     */
    export const TEST_DIR      = "https://raw.githubusercontent.com/w3c/rdf-canon/main/tests/";
    // export const TEST_DIR      = "http://localhost:8001/LocalData/github/RCH/rdf-canon/tests/";

    /**
     * URL of the (JSON-LD version of) the Manifest file. Note that the '-LD' part is not used,
     * and the only key in the JSON file that is of importance is `entries` that contains an array of
     * {@link TestEntry} instances.
     */
    export const MANIFEST_NAME = "manifest.jsonld";

    /**
     * Pattern used to identify individual tests in the manifest; used when individual tests are 
     * run.
     */
    export const ID_PREFIX     = "#test";

    /**
     * Relative file name of the EARL report preamble
     */
    export const EARL_PREAMBLE = "./lib/earl.ttl";

    /**
     * Relative file name of the final EARL report
     */
    export const EARL_REPORT = "./rdfjs-c14n-report.ttl";

    /**
     * URL of the project's Package.json file
     */
    export const PACKAGE_FILE = "https://raw.githubusercontent.com/iherman/rdfjs-c14n/main/package.json";

    /**
     * Number of parallel fetches that can be issued against the test server
     * 
     * So far: the value of 40 is necessary for localhost, otherwise exceptions may occur
     */
    export const FETCH_LIMIT = 40;
}

export enum TestTypes {
    eval    = "rdfc:RDFC10EvalTest",
    map     = "rdfc:RDFC10MapTest", 
    timeout = "rdfc:RDFC10NegativeEvalTest",
}

/**
 * These are the fields in the manifest. Most of the fields are not used (at the moment) by 
 * this tester, but I are defined here to make the JSON->Object conversion simple. 
 */
export interface TestEntry {
    /** 
     * The ID value is of the form `ID_PREFIXabc`, where `abc` is a three digit number, 
     * and `ID_PREFIX` is defined in {@Link Constants}
     */
    id                      : string,
    /** This gives the type of the test. This may determine what exactly the testing process should be */
    type                    : TestTypes,
    name                    : string,
    comment                 : null | string,
    computationalComplexity : string,
    approval                : string,
    hashAlgorithm           : string,
    /** This string provides a relative URL to the test itself */
    action                  : string,
    /** This string provided a relative URL to the expected, canonical version of the test */
    result                  : string,
}

/**
 * Test result. 
 * 
 * This type may evolve in future, when the EARL representation of the testing results will be known.
 */
export interface TestResult {
    /** This is a copy of the `id` value of the test, from {@link TestEntry} */
    id               : string,
    /** This is a copy of the `type` value of the tst, from {@link TestEntry} */
    type             : TestTypes,
    /** Nquads array representation of the test */
    input_nquads     : string[],
    /** Nquads array representation of the generated canonical version of the test */
    c14n_nquads      : string[],
    /** Generated mapping */
    c14n_mapping     : IDMapping,
    /** Nquads array representation of the expected canonical version of the test */
    expected_nquads  : string[],
    /** BNode Mapping */
    expected_mapping : IDMapping,
    /** Comparison result between `c14_nquads` and `expected_nquads`, or the IDMapping and the returned mapping */
    pass             : boolean,
}

/** 
 * Just a shorthand for an RDF Graph/Dataset
 * 
 * This is the representation sent to the canonicalizer algorithm, as well as the returned format thereof.
 * (Actually, the return type is a Set, but this package uses the iteration only.)
 */
export type Graph = Iterable<rdf.Quad>;
