/**
 * Batch execution of promises, if a single step execution does not work...
 * 
 * @packageDocumentation
 */
import * as utils                           from './utils';
import { TestEntry, TestResult, Constants } from './types';
import { RDFC10 }                           from 'rdfjs-c14n';

import * as _ from 'underscore';

/**
 * In some cases it seems that the number of fetches is limited, and the execution creates exceptions.
 * The problem is that this is not deterministic...
 * Running the tests in "batches" of parallel Promise execution seems to solve the problem when it occurs.
 * The number of maximal parallel execution is a constant in Constants.FETCH_LIMIT;
 * 
 * @param tests 
 * @param rdfc10 
 * @returns 
 */
export async function batchPromises(tests: TestEntry[]): Promise<[results: TestResult[], test_issues: string[]]> {
    // Execute a batch of tests
    const execute = async (batch: TestEntry[]): Promise<[results: TestResult[], test_issues: string[]]> => {
        const promises: Promise<TestResult>[] = batch.map((t: TestEntry): Promise<TestResult> => utils.singleTest(t));
        const retval_results: TestResult[] = [];
        const single_test_issues: string[] = [];
        for (const p_result of await Promise.allSettled(promises)) {
            if (p_result.status === "fulfilled") {
                retval_results.push(p_result.value)
            } else {
                single_test_issues.push(p_result.reason);
            }
        }
        return [retval_results, single_test_issues];
    }

    const chunks: TestEntry[][] = _.chunk(tests, Constants.FETCH_LIMIT);
    let results: TestResult[] = [];
    let test_issues: string[] = [];

    for (const chunk of chunks) {
        const [c_results, c_test_issues] = await execute(chunk);
        results     = [...results, ...c_results];
        test_issues = [...test_issues, ...c_test_issues]
    }

    return [results, test_issues];
}

