(defun null? (x) (eq x '()))

(defun assoc. (x y)
  (cond ((eq (caar y) x) (cadar y))
        ('t (assoc. x (cdr y)))))
                 
(defun caar (x)
  (car (car x)))

(defun append. (x y)
  (cond ((null. x) y)
    ('t (cons (car x) (append. (cdr x) y)))))
      
(defun pair. (x y)
  (cond ((and. (null. x) (null. y)) '())
        ((and. (not. (atom x)) (not. (atom y)))
          (cons (list (car x) (car y))
                (pair. (cdr x) (cdr y))))))
    
(defun cadar (x)
  (car (cdr (car x))))

(defun null. (x) (eq x '()))
  
(defun and. (x y)
  (cond (x (cond (y 't) ('t '())))
    ('t '())))
      
(defun not. (x)
  (cond (x '())
    ('t 't)))
              
(defun cadr (x)
  (car (cdr x)))

(defun caddr (x)
  (car (cdr (cdr x))))
  
(defun caddar (x)
  (car (cdr (cdr (car x)))))
