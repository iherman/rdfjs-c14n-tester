import { TestResult, Constants } from './types';
import { promises as fs } from 'fs';

const today = new Date();

const createEarlEntry = (result: TestResult): string => {
    return `

[ 
    a earl:Assertion ;
    earl:assertedBy <https://www.ivan-herman.net/foaf#me> ;
    earl:subject <https://github.com/iherman/rdfjs-c14n>;
    earl:test <https://w3c.github.io/rdf-canon/tests/manifest-urdna2015#${result.id}>;
    earl:result [
        a earl:TestResult ;
        earl:outcome ${result.pass ? "earl:passed" : "earl:failed" } ;
        dc:date "${today.toISOString()}"^^xsd:dateTime
    ]
    earl:mode earl:automatic
] .
    
`
}

/**
 * Create a complete EARL report. The result is stored in a TTL file at the top of the folder, ready to be
 * uploaded. The file name is defined in {@Link Constant}.
 * 
 * At the moment, the EARL preamble is stored separately in a file (see {@Link Constant}) and read from the 
 * file system. This makes the possible maintenance of that file easier...
 * 
 * @param results - the test results
 * @returns 
 */
export async function createEarlReport(results: TestResult[]): Promise<void> {
    // Create the array of individual earl reports
    const earl_reports = results.map(createEarlEntry);

    // Get hold of the normal preamble
    const preamble = await fs.readFile(Constants.EARL_PREAMBLE,"utf-8");

    // Final earl report: preamble, concatenated with the individual reports and all in one string
    const report = [preamble, ...earl_reports].join('\n');

    // Store the report
    return fs.writeFile(Constants.EARL_REPORT, report);
}
