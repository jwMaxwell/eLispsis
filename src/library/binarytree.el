;; Code courtesy of Andrew Maxwell

(import library/stdlib.el)
(defun getProp (name obj)
  (cond
    (obj (cond
      ((eq name (car (car obj))) (car (cdr (car obj))))
      ('t (getProp name (cdr obj)))))
      ('t '())))

(defun deleteProp (name obj)
  (cond
    (obj (cond 
      ((eq name (car (car obj))) (cdr obj))
      ('t (cons (car obj) (deleteProp name (cdr obj))))))
      ('t '())))

(defun setProp (name value obj)
  (cons 
    (list name value) 
    (deleteProp name obj)))

(defun addTo (tree name value) 
    (setProp name (addNode (getProp name tree) value) tree))

(defun addNode (tree value)
  (cond 
    (tree 
      (cond
        ((< value (getProp 'value tree)) (addTo tree 'left value))
        ('t (addTo tree 'right value))))
        ('t (list (list 'value value)))))

(defun buildTree (arr) (reduce addNode '() arr))

(buildTree '(10 9 2 5 4 6 7 8))
