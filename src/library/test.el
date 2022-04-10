(defun reduce (func acc arr) 
  (cond (arr (reduce func (func acc (car arr)) (cdr arr))) 
    ('t acc)))


(defun nestOps (r arg) 
  (cons (car arg) (cons r (cdr arg))))

(defmacro -> (args)
  (reduce nestOps (car args) (cdr args))
)

(defun funTime (m)
  (-> m (/ 4) (+ 1) (* m))
)

(print (funTime 10))

(print (+ "Hi " "there"))
