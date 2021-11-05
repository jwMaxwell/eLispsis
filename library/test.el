(import library/stdlib.el)
(import library/eval.el)
(import library/math.el)
(import library/binarytree.el)
    
(print (reverse '(a b c d e)))

;; a code challenge for you (language of your choice): given a string "S" of 1's and 0's representing a binary number, and a number N, return S mod N. S can be very large. N will be between 1 and a billion.
;; example: modulo('1010001', 13) would return 3
;; using BigInt is prohibited