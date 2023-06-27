/**
 * Testing the [rdfjs-c14n](https://github.com/iherman/rdfjs-c14n) implementation.
 * 
 * @packageDocumentation
 */
import * as utils                           from './lib/utils';
import { TestEntry, TestResult, Constants } from './lib/types';
import { createEarlReport }                 from './lib/earl';
import { RDFC10, LogLevels, Logger }        from 'rdfjs-c14n';
import { Command }                          from 'commander';
import { batchPromises }                    from './lib/batch';


/**
 * Main entry point.
 * 
 * ```
 * Usage: main [number] [options]
 *
 * Run a specific test from the test suite.
 * 
 * Options:
 *   -f --full             Run the full tests suite, returns the list of fails (if any)
 *   -e --earl             Run the full tests suite and produce an EARL report file
 *   -n --number [number]  Test number
 *   -d --debug            Display all log
 *   -t --trace            Display trace log
 *   -h, --help            display help for command
 * ```
 * 
 * @async
 */
async function main(): Promise<void> {
    // Minor thingy: the test numbers are always three digit, which may be a pain for the users to type...
    const testNumber = (num?: string): string => {
        if (num) {
            switch (num.length) {
                case 2:
                    return `00${num}`;
                case 3:
                    return `0${num}`;
                case 4:
                default:
                    return num;
            }
        } else {
            return "020c"
        }
    };

    // This is thing we are testing...
    const rdfc10 = new RDFC10();

    // Grab the list of official test references from the github repository, via the test manifest.
    const tests:  TestEntry[] = await utils.getTestList(Constants.MANIFEST_NAME);

    // This is just standard UI handling...
    const program = new Command();
    program
        .name ('main [number]')
        .description('Run either a specific test from the test suite or the full test suite')
        .usage('[options]')
        .option('-f --full', 'Run the full tests suite, just return the list of fails')
        .option('-e --earl', 'Run the full tests suite and produce an EARL report file')
        .option('-n --number [number]', 'Test number')
        .option('-d --debug', 'Display all log')
        .option('-t --trace', 'Display trace and debug log')
        .parse(process.argv);

    const options = program.opts();
    const debug = options.debug ? true : false;
    const trace = options.trace ? true : false;
    
    // "full" means that all the tests must be performed. Otherwise a single test is run with, possibly,
    // a detailed log.
    if (options.full || options.earl) {
        const [results, single_test_issues] = await batchPromises(tests, rdfc10);
        if (options.earl) {
            await createEarlReport(results);
        }

        if (options.full) {
            // In an ideal case, this array is empty :-)
            const errors: TestResult[] = results.filter((t: TestResult): boolean => !t.pass);

            if (errors.length === 0) {
                console.log("All tests pass.");
            } else {
                const faulty_tests: string[] = errors.map((t: TestResult): string => t.id);
                console.log(`Failed tests: ${faulty_tests}`);
            }
        }
        if (single_test_issues.length > 0) {
            console.error(`\nSome tests have resulted in exceptions:\n  ${single_test_issues.join('\n  ')}`);
        }
    } else {
        const num = (program.args.length === 0) ? testNumber(options.number) : testNumber(program.args[0]);
        // The user may provide some rubbish in lieu of a test number, so this must be
        // handled somehow. Raising an exception is probably the best approach...
        try {
            const locateTestEntry = (num: string, the_tests: TestEntry[]): TestEntry => {
                for (const entry of the_tests) {
                    if (entry.id === `${Constants.ID_PREFIX}${num}`) {
                        return entry;
                    }
                }
                throw("Wrong test number...");
            };
            const the_test = locateTestEntry(num,tests);

            // Set up the logger, if requested
            let logger : Logger|undefined = undefined;
            const logLevel = (debug) ? LogLevels.debug : ((trace) ? LogLevels.info : undefined);

            if (logLevel) {
                logger = rdfc10.setLogger("YamlLogger", logLevel)
            }

            // The real action for canonicalization (which may also raise some exceptions)
            const result: TestResult  = await utils.singleTest(the_test, rdfc10);

            // For now, just display the results. This may change later, if the
            // exact reporting format will be settled.
            console.log(JSON.stringify(result,null,4));
            
            if (logger) {
                console.log("\n>>>> Log <<<<");
                console.log(logger.log);
            }

        } catch(error) {
            // console.error(error)
            console.error(`Something went wrong: ${error}`);
        }
    }
}

main();
