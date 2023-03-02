(library './src/library/io.json)
(library './src/library/process.json)
(library './src/library/math.json)
(library './src/library/regex.json)
(import "./src/library/stdlib.el" '*)

(defun all (fn lst)
  (foldr 
    (lambda (acc x)
      (cond 
        ((and (fn x) (eq acc 't)) 't)
        ('t '())))
    't lst))

(io::print 
  (all (lambda (x) (eq (% x 2) 0)) '(2 4 6 8 10 12)))