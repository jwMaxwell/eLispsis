(library './src/library/io.json)
(library './src/library/process.json)
;; (import "./src/library/stdlib.el" '*)

(defun length (arr)
  (cond
    (arr (+ 1 (length (cdr arr))))
    ('t 0)))

(io::print (length '(1 2 3 4 5 6)))

;; (io::print 
;;   (any (lambda (x) (eq (% x 2) 0)) '(1 3 5 7 9 11)))
