# Testing [rdfjs-c14n](https://github.com/iherman/rdfjs-c14n)

[rdfjs-c14n](https://github.com/iherman/rdfjs-c14n) is an implementation (under development) of the [RDF Dataset Canonicalization](https://www.w3.org/TR/rdf-canon/) algorithm. (The algorithm is being specified by the W3C [RDF Dataset Canonicalization and Hash Working Group](https://www.w3.org/groups/wg/rch)). This repository is to become an "official" test for the algorithm, eventually relying on the testing methodology the WG will adopt in due time. The test material (test manifest and the tests themselves) are directly fetched from the [official repository](https://github.com/w3c/rdf-canon/) of the specification.

Having this as a separate repository makes it also possible to test `rdfjs-c14n` as a separate module to be used, via `npm`, as an imported module in other places. 

(Note, however, that at this point the `package.json` file in the package relies on the local linkage to the `rdfjs-c14n` module rather than importing from `npm`. When the project gets to a final equilibrium point, the package file will be modified. In the meantime, users of this module must modify the `package.json` file by putting a reference to `rdfjs-c14n` manually.)

Note: the "core" library and program has been developed using Typescript on top of node.js and npm. For the fun of it, I created a version that runs with [deno](deno.land) in the directory `deno`. Alas!, there are some subtle differences between a Typescript on top of node.js+npm and deno (e.g., the usage of the `npm:` specifier for the import of npm packages) so the same code cannot be reused. But it is almost the same code nevertheless.

---
Maintainer: [@iherman](https://github.com/iherman)
