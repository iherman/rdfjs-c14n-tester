# Testing [rdfjs-c14n](https://github.com/iherman/rdfjs-c14n)

[rdfjs-c14n](https://github.com/iherman/rdfjs-c14n) is an implementation of the [RDF Dataset Canonicalization](https://www.w3.org/TR/rdf-canon/) algorithm. (The algorithm has been defined by the W3C [RDF Dataset Canonicalization and Hash Working Group](https://www.w3.org/groups/wg/rch)). This repository is an test-runner for the algorithm, relying on the testing methodology the WG has adopted. The test material (test manifest and the tests themselves) are directly fetched from the [official test repository](https://github.com/w3c/rdf-canon/) of the specification, and the test-runner generates the relevant reports in EARL format. Having this as a separate repository makes it also possible to test `rdfjs-c14n` as a separate module to be used, e.g., via `npm` from a separate Typescript program.

Functionally, but also in terms of the Typescript code, there is also a ["sister" project](https://github.com/iherman/rdfjs-c14n-tester-d) doing essentially the same, except that while this version runs on top of [Node.js](https://nodejs.org), the other version does on top of [Deno](https://deno.land). The differences in the code are insignificant (mostly a different way of referencing to imported modules), but it also proves that the core, `rdfjs-c14n` npm package can also be used from Deno.

Finally, this repository also includes a small, toy example for how to use the package from within a browser (relying on `esbuild`).

(Note, however, that at this point the `package.json` file in this repository relies on the local linkage to the `rdfjs-c14n` module rather than importing from `npm`. That obviously helps debugging on all sites. Users of this module must modify the `package.json` file by putting a reference to `rdfjs-c14n` manually.)

---
Maintainer: [@iherman](https://github.com/iherman)
