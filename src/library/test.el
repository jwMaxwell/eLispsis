(library './src/library/io.json)
(library './src/library/process.json)
;; (import "./src/library/stdlib.el" '*)

(io::print "Hello, world!")

(defun null? (x) (eq x '()))

(defun append (x y)
  (cond ((null? x) y)
    ('t (cons (car x) (append (cdr x) y)))))

(defun reverse (arr) 
  (cond ((null? (cons (car arr) '())) '())
    ('t (append (reverse (cdr arr)) (car arr)))))

(io::print (append '4 '(1 2 3 4)))