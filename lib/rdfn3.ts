/**
 * Direct interface to the N3 Package for the nquad parser, and on rdf-string for the nquad serializer.
 * All other parts of the library should only depend on the general
 * rdf-js package, ie, the using the semi-official data model specification only.
 * 
 * @packageDocumentation
 */

import * as n3                   from 'n3';
import * as rdf                  from '@rdfjs/types';
import { Graph }                 from './types';
import { promisifyEventEmitter } from "event-emitter-promisify";

/**
 * Convert the graph into ordered NQuads, more exactly into an array of individual NQuad statement
 * @param quads 
 * @returns 
 */
export function graphToOrderedNquads(quads: Graph): string[] {
    const n3Writer = new n3.Writer();
    const quadToNquad = (quad: rdf.Quad): string => {
        const retval = n3Writer.quadToString(quad.subject, quad.predicate, quad.object, quad.graph);
        return retval.endsWith('  .') ? retval.replace(/  .$/, ' .') : retval;
    }

    let retval: string[] = [];
    for (const quad of quads) {
        retval.push(quadToNquad(quad))
    }
    return retval.sort();
}

/**
 * Parse a turtle/trig file and return the result in a set of RDF Quads. 
 * Input format is a permissive superset of Turtle, TriG, N-Triples, and N-Quads.
 * 
 * An extra option is used to re-use the blank node id-s in the input without modification. 
 * 
 * @param trig - TriG content
 * @returns 
 */

export async function getQuads(trig: string): Promise<Graph> {
    const store = new n3.Store();
    const parser = new n3.StreamParser({ blankNodePrefix: '' });
    const storeEventHandler = store.import(parser);

    parser.write(trig);
    parser.end();
    await promisifyEventEmitter(storeEventHandler);
    return store;
}
