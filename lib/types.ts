/**
 * Type and constant specifications for the tester.
 * 
 * @packageDocumentation
 */

import * as rdf      from 'rdf-js';

export namespace Constants {
    /** 
     * URL of the directory within the github repository where the tests reside.
     * The test manifest entries for the tests (see {@link TestEntry}) contain
     * relative addresses for the individual tests, which must be concatenated with this
     * URL.
     */
    export const TEST_DIR      = "https://raw.githubusercontent.com/w3c/rdf-canon/main/tests/";

    /**
     * URL of the (JSON-LD version of) the Manifest file. Note that the '-LD' part is not used,
     * and the only key in the JSON file that is of importance is `entries` that contains an array of
     * {@link TestEntry} instances.
     */
    export const MANIFEST_NAME = "manifest-urdna2015.jsonld";

    /**
     * Pattern used to identify individual tests in the manifest; used when individual tests are 
     * run.
     */
    export const ID_PREFIX     = "manifest-urdna2015#test";

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
    id       : string,
    type     : string,
    name     : string,
    comment  : null | string,
    approval : string,
    /** This string provides a relative URL to the test itself */
    action   : string,
    /** This string provided a relative URL to the expected, canonical version of the test */
    result   : string
}

/**
 * Test result. 
 * 
 * This type may evolve in future, when the EARL representation of the testing results will be known.
 */
export interface TestResult {
    /** This a copy of the `id` value of the test, from {@link TestEntry} */
    id              : string,
    /** Nquads array representation of the test */
    input_nquads    : string[],
    /** Nquads array representation of the generated canonical version of the test */
    c14n_nquads     : string[],
    /** Nquads array representation of the expected canonical version of the test */
    expected_nquads : string[],
    /** Comparison result between `c14_nquads` and `expected_nquads` */
    pass            : boolean,
}

/** 
 * Just a shorthand for an RDF Graph/Dataset: it is a set of quads...
 * 
 * This is the representation sent to the canonicalizer algorithm, as well as the returned format thereof.
 */
export type Graph = Set<rdf.Quad>;
