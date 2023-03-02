(defun null? (x) (eq x '()))

(defun append (x y)
  (cond ((null? x) y)
    ('t (cons (car x) (append (cdr x) y)))))
      
(defun pair (x y)
  (cond ((and (null? x) (null? y)) '())
    ((and (not (atom x)) (not (atom y)))
      (cons (list (car x) (car y))
            (pair (cdr x) (cdr y))))))
  
(defun and (x y)
  (cond (x (cond (y 't) ('t '())))
    ('t '())))

(defun or (x y) 
  (cond (x 't)
    (y 't)
    ('t '())))

(defun xor (x y)
  (cond ((and x y) '())
    (x 't)
    (y 't)
    ('t '())))
      
(defun not (x)
  (cond (x '())
    ('t 't)))

(defun last (arr) 
  (cond ((null? (cdr arr)) arr)
    ('t (last (cdr arr)))))

;; Helper function
(defun _reverse (lst acc)
  (cond 
    ((null? lst) acc)
    ('t (_reverse (cdr lst) (cons (car lst) acc)))))

(defun reverse (lst)
  (_reverse lst '()))

(defun _length (lst acc)
 (cond 
  ((null? lst) acc)
  ('t (_length (cdr lst) (+ 1 acc)))))

(defun length (lst)
  (_length lst '0))

(defun foldr (func acc arr) 
  (cond 
    (arr (foldr func (func acc (car arr)) (cdr arr))) 
    ('t acc)))

(defun foldl (func acc arr) 
  (foldr func acc (reverse arr)))

(defun all (fn lst)
  (foldr 
    (lambda (acc x)
      (cond 
        ((and (fn x) (eq acc 't)) 't)
        ('t '())))
    't lst))

(defun pop (arr)
  (reverse (cdr (reverse arr))))

(defun peek (arr)
  (car (reverse arr)))

(defun get (index arr) 
  (cond ((eq index '0) (car arr))
    ('t (get (- index 1) (cdr arr)))))

(defun includes? (x arr) 
  (cond ((null? arr) '())
    ((eq (car arr) x) 't)
    ('t (includes? x (cdr arr)))))

(defun if (pred then else)
  (cond (pred then)
    ('t else)))

(defun reduce (func acc arr) 
  (cond (arr (reduce func (func acc (car arr)) (cdr arr))) 
    ('t acc)))

(defun map (func arr)
  (cond ((null? arr) '())
    ('t (cons (func (car arr)) (map func (cdr arr))))))