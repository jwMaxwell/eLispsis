<<<<<<< Updated upstream
(import library/stdlib.el)
(import library/eval.el)
(import library/math.el)
(import library/binarytree.el)
    
(print (+))

;; a code challenge for you (language of your choice): given a string "S" of 1's and 0's representing a binary number, and a number N, return S mod N. S can be very large. N will be between 1 and a billion.
;; example: modulo('1010001', 13) would return 3
;; using BigInt is prohibited
=======
(import "./library/stdlib.el")
;; (library "./library/bitops.json")
;; (library "./library/math.json")
(library "./library/io.json")

(set prompt "What is yuor name? ")
(io::print (+ "Hello, " (io::read prompt)))
>>>>>>> Stashed changes
