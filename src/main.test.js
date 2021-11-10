const exec = require('./main.js').execute;

const tests = [
  ['(+ 1 2 3 4 5)', '15'],
  ['(set x 5) (+ 4 3 x)', '12'],
  ['(- 100 20 10 15)', '55'],
  ['(set x 5) (- 25 10 x)', '10'],
  ["(defun null? (x) (eq x '())) (null? '())", 't'],
  [`(defun and (x y)
    (cond (x (cond (y 't) ('t '())))
      ('t '()))) 
    (and 't 't)`, 't'],
  [`
  (defun null? (x) (eq x '()))

  (defun append (x y)
  (cond ((null? x) y)
    ('t (cons (car x) (append (cdr x) y)))))

  (defun reverse (arr) 
  (cond ((null? arr) (arr))
    ('t (append (reverse (cdr arr)) (car arr)))))
    
  (reverse '(a b c d e))`, ["e", "d", "c", "b", "a"]],
  [`(cdr (cons 'y (cons '(a b v c x) 'b)))`, [ [ 'a', 'b', 'v', 'c', 'x' ], 'b' ]]
]

for (const n of tests) {
  test(n[0], () => {
    expect(exec(n[0])).toEqual(n[1]);
  });  
}
