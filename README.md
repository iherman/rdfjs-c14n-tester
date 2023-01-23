# rdfjs-c14n Tester
Testing the rdfjs-c14n

[rdfjs-c14n](https://github.com/iherman/rdfjs-c14n) is an implementation (under development) of the [RDF Dataset Canonicalization](https://www.w3.org/TR/rdf-canon/) algorithm. (The algorithm is being specified by the W3C [RDF Dataset Canonicalization and Hash Working Group](https://www.w3.org/groups/wg/rch)). This repository is to become an "official" test for the algorithm, eventually relying on the testing methodology the WG will adopt in due time.

Having this as a separate repository makes it possible to also test `rdfjs-c14n` as a separate module to be used, via npm, as an imported module. Note, however, that at this point the `package.json` file in the package relies on the local linkage to the `rdfjs-c14n` module rather than importing from npm. When the project gets to a final equilibrium point, the package file will be modified...


