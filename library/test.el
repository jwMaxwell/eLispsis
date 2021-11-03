(import library/stdlib.el)
(import library/eval.el)
(import library/math.el)
(import library/binarytree.el)

;; (defun map (func arr)
;;   (cond ((null? arr) '())
;;     ('t (cons (func (car arr)) (map func (cdr arr))))))

(defun length (x)
  (cond ((null? x) '1)
    ('t (+ '1 (length (cdr x))))))

(defun binToInt (s)
  (cond ((null? s) '0)
    ((eq '1 (car s)) (+ (^ 2 (length s)) (binToInt (cdr s))))
    ('t (binToInt (cdr s)))))

(print (binToInt "1010001"))
(defun if (pred then else)
  (cond (pred then)
    ('t else)))
(print (+ '1 (car "2a")))

;; a code challenge for you (language of your choice): given a string "S" of 1's and 0's representing a binary number, and a number N, return S mod N. S can be very large. N will be between 1 and a billion.
;; example: modulo('1010001', 13) would return 3
;; using BigInt is prohibited