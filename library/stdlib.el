(defun null? (x) (eq x '()))

(defun assoc (x y)
  (cond ((eq (caar y) x) (cadar y))
        ('t (assoc x (cdr y)))))

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
  (cond ((null? (cdr arr)) (arr))
    ('t (last (cdr arr)))))

(defun reverse (arr) 
  (cond ((null? arr) (arr))
    ('t (append (reverse (cdr arr)) (car arr)))))

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
  (cond 
    (arr (reduce func (func acc (car arr)) (cdr arr))) 
    ('t acc)))
